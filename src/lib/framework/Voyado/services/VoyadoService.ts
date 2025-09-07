import { unstable_cache } from 'next/cache';
import { inject, singleton } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { isMultipleMatchesError, MultipleMatchesError } from '@/src/lib/errors/MultipleMatchesError';
import { ValidationError } from '@/src/lib/errors/ValidationError';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IVoyadoService } from '@/src/lib/framework/Voyado/domain/IVoyadoService';
import { isVoyadoMember } from '@/src/lib/framework/Voyado/shared/isVoyadoMember';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';
import { getMarketCode } from '@/src/util/locale';

@singleton()
export class VoyadoService implements IVoyadoService {
  protected readonly apiUrl = process.env.VOYADO_ENGAGE_API_URL;
  protected readonly apiKey = process.env.VOYADO_ENGAGE_API_KEY;

  public constructor(
    @injectLogger('VoyadoService') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
  ) {}

  public async getContactIdByEmail(email: string): Promise<IVoyado.ContactByEmail> {
    try {
      const encodedEmail = encodeURIComponent(email);
      return await this.fetch<IVoyado.ContactByEmail>('GET', `contacts/id?email=${encodedEmail}`);
    } catch (err) {
      if (err instanceof MultipleMatchesError) {
        this._logger.warn(`Multiple matches found for email "${email}"`);
        return this.getContactIdByEmailWithMultipleMatches(err);
      }

      throw err;
    }
  }

  protected async getContactIdByEmailWithMultipleMatches(error: MultipleMatchesError): Promise<string> {
    const matches = error.matches;

    const possibleContacts = await Promise.all(matches.map((id) => this.getContact(id)));

    const contact = possibleContacts.find(isVoyadoMember);
    if (!contact) {
      this._logger.error(`No "Member" found by multiple matches: [${matches.join(', ')}]`);
      throw new Error('No contact found', { cause: error });
    }

    return contact.id;
  }

  public async getContact(id: string): Promise<IVoyado.Contact> {
    return await this.fetch<IVoyado.Contact>('GET', `contacts/${id}`);
  }

  public async getContactByEmail(email: string): Promise<IVoyado.Contact> {
    const id = await this.getContactIdByEmail(email);
    if (!id) {
      this._logger.error(`No contact found with Id: "${id}"`);
      throw new Error('No contact found');
    }

    return this.getContact(id);
  }

  public async getContactOverview(id: string): Promise<IVoyado.ContactOverview> {
    return this.fetch<IVoyado.ContactOverview>('GET', `contactoverview?contactId=${id}`);
  }

  public async subscribeToProduct(body: IVoyado.Subscription): Promise<IVoyado.Subscription> {
    return this.fetch<IVoyado.Subscription>('POST', 'inventory/backinstock/subscriptions', body);
  }

  public async updateContact(id: string, body: Partial<IVoyado.Contact['attributes']>): Promise<IVoyado.Contact> {
    this._logger.info('Updating contact with body:', body);
    return this.fetch<IVoyado.Contact>('POST', `contacts/${id}`, body);
  }

  public async updateContactType(id: string, type: 'Member' | 'Contact') {
    if (type !== 'Member' && type !== 'Contact') {
      this._logger.error('Invalid contact type:', type);
      throw new Error('Invalid contact type');
    }

    return this.fetch<void>('POST', `contacts/${id}/updateContactType?contactTypeId=${type}`, { type });
  }

  public async promoteToMember(id: string) {
    return this.fetch<void>('POST', `contacts/${id}/promoteToMember`, {});
  }

  public async getOrCreateContact(createContact: IVoyado.CreateContact, locale: string): Promise<IVoyado.Contact> {
    const possibleId = await this.getContactIdByEmail(createContact.email).catch(() => null);

    if (possibleId) return this.getContact(possibleId);

    const countryCode = getMarketCode(locale).toUpperCase();
    const language = this._config.getLanguage(locale);

    const [currentStore, consentId] = await Promise.all([this.getStoreByMarketCode(countryCode), this.getConsentId()]);

    const body: IVoyado.CreateContactBody = {
      ...createContact,
      countryCode,
      language,

      consents: consentId ? [{ id: consentId, value: true, source: 'ecom' }] : [],
    };

    return this.fetch<IVoyado.Contact>('POST', `contacts`, body, {
      source: 'ecom',
      storeExternalId: currentStore?.externalId,
    });
  }

  public async getPromotions(id: string): Promise<IVoyado.Promotions> {
    return this.fetch<IVoyado.Promotions>('GET', `contacts/${id}/promotions`);
  }

  public async getTransactions(id: string): Promise<IVoyado.Transactions> {
    return this.fetch<IVoyado.Transactions>('GET', `contacts/${id}/transactions`);
  }

  public async getVouchers(id: string): Promise<IVoyado.Vouchers> {
    return await this.fetch<IVoyado.Vouchers>('GET', `contacts/${id}/bonuschecks/available`);
  }

  public async redeemVoucher(id: string, bonusCheckId: string): Promise<IVoyado.Vouchers> {
    return await this.fetch<IVoyado.Vouchers>('POST', `contacts/${id}/bonuschecks/${bonusCheckId}/redeem`);
  }

  public async setContactPreference(
    id: string,
    property: 'acceptsEmail' | 'acceptsPostal' | 'acceptsSms',
    state: boolean,
  ): Promise<IVoyado.Contact> {
    return this.fetch<IVoyado.Contact>('POST', `contacts/${id}/preferences/${property}`, { value: state });
  }

  public async subscribeToNewsletter(email: string, locale: string): Promise<boolean> {
    const language = this._config.getLanguage(locale);

    return this.getOrCreateContact({ email, contactType: 'Contact' }, locale)
      .then(async (contact) => {
        const promises: Promise<unknown>[] = [];

        if (contact.meta.contactType === 'transactContact') {
          /**
           * Sets the contact type to 'Contact' if it's not already set.
           * Overrides the "transactContact" type.
           **/
          promises.push(this.updateContactType(contact.id, 'Contact'));
        }

        /* #region Attributes update */
        const attributes: Partial<IVoyado.Contact['attributes']> = {};
        if (!contact.attributes.acceptsNewsletters) attributes.acceptsNewsletters = true;
        if (!contact.attributes.language) attributes.language = language;

        if (Object.keys(attributes).length > 0) {
          promises.push(this.updateContact(contact.id, attributes));
        }
        /* #endregion */

        if (!contact.preferences.AcceptsEmails)
          promises.push(this.setContactPreference(contact.id, 'acceptsEmail', true));

        await Promise.all(promises);
      })
      .then(() => {
        this._logger.debug(`Successfully subscribed to newsletter with email "${email}"`);
        return true;
      })
      .catch((err) => {
        this._logger.error(`Failed to subscribe to newsletter with email "${email}":`, err);
        return false;
      });
  }

  /* #region Static data fetching */

  protected getStoreByMarketCode = (marketCode: string): Promise<IVoyado.Store | undefined> =>
    this.getStores().then((stores) =>
      stores.find((store) => store.countryCode.toLowerCase() === marketCode.toLowerCase()),
    );

  protected readonly getStores = unstable_cache(() => this._getStores(), ['VoyadoService.getStores'], {
    tags: ['VoyadoService.getStores'],
  });

  private async _getStores(): Promise<IVoyado.Store[]> {
    try {
      return (await this.fetch<IVoyado.Store[]>('GET', 'stores')).map(({ name, countryCode, externalId }) => ({
        name,
        countryCode,
        externalId,
      }));
    } catch (err) {
      this._logger.error('Failed to fetch stores:', err);
      return [];
    }
  }

  protected readonly getConsentId = unstable_cache(() => this._getConsentId(), ['VoyadoService.getConsentId'], {
    tags: ['VoyadoService.getConsentId'],
  });

  private async _getConsentId(): Promise<string | undefined> {
    try {
      const consents = await this.fetch<IVoyado.Consent[]>('GET', 'consents');
      if (!consents.length) return undefined;
      else if (consents.length === 1) return consents[0].id;
      else return consents.find((consent) => consent.id === 'memberTerms')?.id;
    } catch (err) {
      this._logger.error('Failed to fetch consent:', err);
      return undefined;
    }
  }

  /* #endregion */

  /* #region Internals */

  protected async fetch<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    path: string,
    body?: Record<string, unknown>,
    headers?: Partial<Record<string, string>>,
  ): Promise<T> {
    // Skip API calls during SSG/SSR
    if (typeof window === 'undefined') {
      throw new Error('API calls are not available during server-side rendering or static generation');
    }

    const url = new URL(path, this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`);
    try {
      const result = await fetch(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          apiKey: this.apiKey ?? '',
        },
      });

      const json = await result.json().catch(() => null);

      if (result.status >= 400) {
        const newError: { message: string; validationErrors?: { errorDescription: string }[] } = !json
          ? { message: result.statusText }
          : (() => {
              let result = '';

              if ('errorCode' in json) result += `[${json.errorCode}] `;
              if ('message' in json) result += json.message;
              else result += json.statusText;

              return { message: result };
            })();

        if (result.status === 422) {
          if ('validationErrors' in newError && newError.validationErrors && Array.isArray(newError.validationErrors)) {
            const errorMessage = newError.validationErrors[0]?.errorDescription;
            if (errorMessage) throw new ValidationError(errorMessage, result.status);
          }
        }

        if (result.status === 409 && isMultipleMatchesError(json)) {
          const matches = json.messageDetails.multipleMatchesFound;
          throw new MultipleMatchesError('MultipleMatches', matches);
        }

        throw new Error(newError.message);
      }

      return json as T;
    } catch (err) {
      if (err instanceof ValidationError || err instanceof MultipleMatchesError) {
        throw err;
      } else {
        throw new Error(
          `[VoyadoRepository] Failed to fetch data on path "${method}:${url}": ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  /* #endregion */
}
