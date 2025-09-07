# PDP Template Translation Guide

This guide explains how to handle translations when adding new PDP templates to the system.

## Overview

The PDP template system supports two approaches for handling translations:

1. **Static Translations** (Current Implementation) - Using translation JSON files with next-intl
2. **Dynamic Translations** (Alternative) - Using configuration-based translations

## Current Approach: Static Translations

### How It Works

1. Template configuration specifies a `sizeSelectionKey` (e.g., `"letter"` for love letters)
2. Components generate translation keys: `select-{key}` and `choose-your-{key}`
3. Translations are looked up from JSON files via next-intl

### Adding Translations for New Templates

When adding a new template, follow these steps:

#### 1. Add Template Configuration

In `src/config/pdpTemplateConfig.ts`:

```typescript
export const PDP_TEMPLATE_CONFIG = {
  // ... existing templates

  my_new_template: {
    sizeSelectionKey: 'my-option',
    variantLabel: 'option',
    showSizeGuide: false,
  },
};
```

#### 2. Add Translation Keys to All Language Files

For each language file in `translations/`:

**translations/en.json:**

```json
{
  "product-page": {
    "select-my-option": "Select option",
    "choose-your-my-option": "Choose your option"
  }
}
```

**translations/sv.json:**

```json
{
  "product-page": {
    "select-my-option": "Välj alternativ",
    "choose-your-my-option": "Välj ditt alternativ"
  }
}
```

**translations/nb.json:**

```json
{
  "product-page": {
    "select-my-option": "Velg alternativ",
    "choose-your-my-option": "Velg ditt alternativ"
  }
}
```

**translations/no.json:**

```json
{
  "product-page": {
    "select-my-option": "Velg alternativ",
    "choose-your-my-option": "Vel ditt alternativ"
  }
}
```

**translations/fi.json:**

```json
{
  "product-page": {
    "select-my-option": "Valitse vaihtoehto",
    "choose-your-my-option": "Valitse vaihtoehtosi"
  }
}
```

## Alternative: Dynamic Translations

### Benefits

- All translations in one place (`src/config/pdpTemplateTranslations.ts`)
- Automatic fallbacks if translation missing
- Easier to maintain consistency
- No need to modify JSON files for each new template

### How to Enable

1. Add translations to `src/config/pdpTemplateTranslations.ts`:

```typescript
export const TEMPLATE_TRANSLATIONS = {
  // ... existing translations

  'my-option': {
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
      no: 'Vel ditt alternativ',
      fi: 'Valitse vaihtoehtosi',
    },
  },
};
```

2. Update components to use dynamic translations:

```typescript
import { getVariantSelectionText } from '@/src/util/pdpTemplateTranslations';

// Instead of:
const key = getVariantSelectionKey(elasticData, 'select');
const text = t(`product-page.${key}`);

// Use:
const text = getVariantSelectionText({
  elasticData,
  keyType: 'select',
  language: locale,
  useDynamicTranslations: true,
});
```

## Translation Key Naming Convention

Follow these patterns for consistency:

- **Select**: `select-{key}` → "Select {item}"
- **Choose**: `choose-your-{key}` → "Choose your {item}"

Where `{key}` matches the `sizeSelectionKey` in the template configuration.

## Common Template Types

Here are translation patterns for common template types:

| Template  | sizeSelectionKey | English          | Swedish          | Norwegian          |
| --------- | ---------------- | ---------------- | ---------------- | ------------------ |
| Size      | `size`           | Select size      | Välj storlek     | Velg størrelse     |
| Letter    | `letter`         | Select letter    | Välj bokstav     | Velg bokstav       |
| Color     | `color`          | Select color     | Välj färg        | Velg farge         |
| Length    | `length`         | Select length    | Välj längd       | Velg lengde        |
| Ring Size | `ring-size`      | Select ring size | Välj ringstorlek | Velg ringstørrelse |
| Engraving | `engraving`      | Select engraving | Välj gravyr      | Velg gravering     |
| Charm     | `charm`          | Select charm     | Välj berlock     | Velg sjarm         |

## Testing Translations

### Manual Testing

1. Set `pdp_template` field in ElasticSearch to your template value
2. Navigate to product page
3. Check that correct text appears on:
   - Add to cart button hover (when no size selected)
   - Size selector modal title
   - Size selector label (mobile)

### Automated Validation

Use the validation utility to check translations:

```typescript
import { validateTemplateTranslations } from '@/src/util/pdpTemplateTranslations';
import enTranslations from '@/translations/en.json';

const result = validateTemplateTranslations('my-option', enTranslations);
if (!result.valid) {
  console.error('Missing translations:', result.missing);
}
```

## Migration Path

To migrate from static to dynamic translations:

1. Move all template-specific translations to `pdpTemplateTranslations.ts`
2. Update components to use `useDynamicTranslations: true`
3. Remove template-specific keys from JSON files
4. Keep only common translations in JSON files

## Best Practices

1. **Consistency**: Use the same terminology across all languages
2. **Context**: Consider the UI context where text appears (button vs. modal)
3. **Length**: Keep translations concise, especially for buttons
4. **Testing**: Always test with actual products in all supported languages
5. **Documentation**: Document any special cases or exceptions

## Troubleshooting

### Translation Not Appearing

1. Check that translation key exists in all language files
2. Verify `sizeSelectionKey` in template configuration matches translation keys
3. Ensure template value in ElasticSearch matches configuration key
4. Check browser console for missing translation warnings

### Fallback Text Appearing

If you see text like "Select my option" instead of proper translation:

- Translation key is missing from JSON files
- Add the missing keys following the naming convention

### Wrong Language Appearing

- Verify locale is correctly set in the application
- Check that translation exists for the current locale
- Ensure language detection is working properly
