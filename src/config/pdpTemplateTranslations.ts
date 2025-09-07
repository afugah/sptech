/**
 * PDP Template Translation Configuration
 *
 * Centralized translation definitions for all PDP template variations.
 * This ensures consistency and makes it easy to add new templates.
 */

export interface TemplateTranslations {
  select: Record<string, string>;
  chooseYour: Record<string, string>;
}

/**
 * Default fallback translations for all languages
 * Used when specific translations are not available
 */
export const DEFAULT_TEMPLATE_TRANSLATIONS: TemplateTranslations = {
  select: {
    en: 'Select option',
    sv: 'Välj alternativ',
    nb: 'Velg alternativ',
    no: 'Velg alternativ',
    fi: 'Valitse vaihtoehto',
  },
  chooseYour: {
    en: 'Choose your option',
    sv: 'Välj ditt alternativ',
    nb: 'Velg ditt alternativ',
    no: 'Velg ditt alternativ',
    fi: 'Valitse vaihtoehtosi',
  },
};

/**
 * Template-specific translations
 * Key: template value from pdp_template field
 * Value: translations for each language
 */
export const TEMPLATE_TRANSLATIONS: Record<string, TemplateTranslations> = {
  // Standard size selection (default)
  size: {
    select: {
      en: 'Select size',
      sv: 'Välj storlek',
      nb: 'Velg en størrelse',
      no: 'Velg en størrelse',
      fi: 'Valitse koko',
    },
    chooseYour: {
      en: 'Choose your size',
      sv: 'Välj din storlek',
      nb: 'Velg din størrelse',
      no: 'Vel storleiken din',
      fi: 'Valitse kokosi',
    },
  },

  // Love letter selection
  letter: {
    select: {
      en: 'Select letter',
      sv: 'Välj bokstav',
      nb: 'Velg bokstav',
      no: 'Velg bokstav',
      fi: 'Valitse kirjain',
    },
    chooseYour: {
      en: 'Choose your letter',
      sv: 'Välj din bokstav',
      nb: 'Velg din bokstav',
      no: 'Vel din bokstav',
      fi: 'Valitse kirjaimesi',
    },
  },

  // Ring size selection (future use)
  'ring-size': {
    select: {
      en: 'Select ring size',
      sv: 'Välj ringstorlek',
      nb: 'Velg ringstørrelse',
      no: 'Velg ringstørrelse',
      fi: 'Valitse sormuksen koko',
    },
    chooseYour: {
      en: 'Choose your ring size',
      sv: 'Välj din ringstorlek',
      nb: 'Velg din ringstørrelse',
      no: 'Vel din ringstørrelse',
      fi: 'Valitse sormuksesi koko',
    },
  },

  // Engraving option selection (future use)
  'engraving-option': {
    select: {
      en: 'Select engraving',
      sv: 'Välj gravyr',
      nb: 'Velg gravering',
      no: 'Velg gravering',
      fi: 'Valitse kaiverrus',
    },
    chooseYour: {
      en: 'Choose your engraving',
      sv: 'Välj din gravyr',
      nb: 'Velg din gravering',
      no: 'Vel din gravering',
      fi: 'Valitse kaiverruksesi',
    },
  },

  // Charm selection (future use)
  charm: {
    select: {
      en: 'Select charm',
      sv: 'Välj berlock',
      nb: 'Velg sjarm',
      no: 'Velg sjarm',
      fi: 'Valitse riipus',
    },
    chooseYour: {
      en: 'Choose your charm',
      sv: 'Välj din berlock',
      nb: 'Velg din sjarm',
      no: 'Vel din sjarm',
      fi: 'Valitse riipuksesi',
    },
  },

  // Color selection (future use)
  color: {
    select: {
      en: 'Select color',
      sv: 'Välj färg',
      nb: 'Velg farge',
      no: 'Velg farge',
      fi: 'Valitse väri',
    },
    chooseYour: {
      en: 'Choose your color',
      sv: 'Välj din färg',
      nb: 'Velg din farge',
      no: 'Vel din farge',
      fi: 'Valitse värisi',
    },
  },

  // Length selection (future use)
  length: {
    select: {
      en: 'Select length',
      sv: 'Välj längd',
      nb: 'Velg lengde',
      no: 'Velg lengde',
      fi: 'Valitse pituus',
    },
    chooseYour: {
      en: 'Choose your length',
      sv: 'Välj din längd',
      nb: 'Velg din lengde',
      no: 'Vel din lengde',
      fi: 'Valitse pituutesi',
    },
  },
};

/**
 * Get translation for a specific template key and language
 * Falls back to default translations if not found
 */
export function getTemplateTranslation(
  sizeSelectionKey: string,
  translationType: 'select' | 'chooseYour',
  language: string,
): string {
  // Try to get template-specific translation
  const templateTranslations = TEMPLATE_TRANSLATIONS[sizeSelectionKey];
  if (templateTranslations) {
    const translation = templateTranslations[translationType][language];
    if (translation) {
      return translation;
    }
  }

  // Fall back to default translation
  return (
    DEFAULT_TEMPLATE_TRANSLATIONS[translationType][language] ||
    DEFAULT_TEMPLATE_TRANSLATIONS[translationType]['en'] ||
    `${translationType} ${sizeSelectionKey}`
  );
}
