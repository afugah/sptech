import { isNull, isUndefined } from 'lodash';
import { inject, singleton } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IReviewRepository } from '@/src/lib/framework/Reviews/domain/IReviewRepository';
import { type ILipScore } from '@/src/lib/framework/Reviews/types/ILipScore';
import { type IReviewParams } from '@/src/lib/framework/Reviews/types/IReviewParams';

@singleton()
export class LipScoreRepository implements IReviewRepository {
  public constructor(
    @injectLogger('LipScoreRepository') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
  ) {
    if (!this._config.Reviews) throw new Error('Missing "Reviews" config');
  }

  public async getScore(productId: string) {
    try {
      const score = await this.fetchProduct(productId);

      const rating = Number.parseFloat(score.rating) ?? 0;
      if (!rating) return null;

      return {
        rating,
        reviewsCount: score.review_count ?? 0,
        voteCount: score.votes ?? 0,
      };
    } catch (error) {
      this._logger.warn(`Failed to fetch score for productId="${productId}"`, error);

      return null;
    }
  }

  public async getReviews(productId: string, params?: IReviewParams) {
    try {
      const reviews = await this.fetchReviews(productId, {
        translate_to_lang: params?.language,
        page: params?.page,
        per_page: params?.limit,
      });

      return reviews.map((review) => ({
        id: String(review.id),
        user: {
          id: String(review.user.id),
          name: review.user.name,
        },
        date: review.created_at,
        rating: review.rating,
        text: review.text,
        translatedText: review.translated_text?.trim() || null,
        productTitle: review.displayed_name,
      }));
    } catch (error) {
      this._logger.warn(`Failed to fetch reviews for productId="${productId}"`, error);

      return [];
    }
  }

  /**
   * Fetches product basic info
   *
   * @see https://members.lipscore.com/apidoc/v2/products/show.en.html
   * @param productId the product id
   * @returns product info
   */
  protected async fetchProduct(productId: string): Promise<ILipScore.ApiScoreResponse> {
    const { ApiUrl, ApiKey, SecretKey } = this._config.Reviews!;

    const result = await fetch(`${ApiUrl}/products/${productId}?fields=rating,votes,review_count&api_key=${ApiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': SecretKey,
      },
    });

    return this.parseResponse<ILipScore.ApiScoreResponse>(result);
  }

  /**
   * Fetches reviews
   *
   * @see https://members.lipscore.com/apidoc/v2/reviews/index.en.html
   * @param productId the product id
   * @param params the request params
   * @returns list of reviews
   */
  protected async fetchReviews(
    productId: string,
    params: ILipScore.ApiReviewsRequest,
  ): Promise<ILipScore.ApiReviewsResponse> {
    const { ApiUrl, ApiKey, SecretKey } = this._config.Reviews!;

    const searchParams = this.paramsToSearchParams(params);
    searchParams.append('api_key', ApiKey);

    const result = await fetch(`${ApiUrl}/products/${productId}/reviews?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': SecretKey,
      },
    });

    return this.parseResponse<ILipScore.ApiReviewsResponse>(result);
  }

  private readonly parseResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) throw new Error(response.statusText);

    return (await response.json()) as T;
  };

  private paramsToSearchParams(params: ILipScore.ApiReviewsRequest): URLSearchParams {
    const stringParams = Object.entries(params)
      .filter(([_key, value]) => !isNull(value) && !isUndefined(value))
      .reduce((result, item) => (result += `${item[0]}=${item[1]}&`), '')
      .slice(0, -1);

    return new URLSearchParams(stringParams);
  }
}
