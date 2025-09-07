# PDP Template Attributes

## Overview

The `pdp_template` attribute in ElasticSearch allows customization of product detail pages based on product type. This document lists all available templates that can be set as product attributes.

## Available Templates

### Currently Configured Templates

| Template Value       | Description              | Use Case                                                 | Customizations                                                                      |
| -------------------- | ------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `love_letter`        | Letter selection         | Products where customers select letters instead of sizes | - Shows "Select letter" instead of "Select size"<br>- No size guide                 |
| `ring_size`          | Ring sizing              | Ring products with specific sizing                       | - Shows "Select ring size"<br>- Displays size guide                                 |
| `engraving`          | Engraving options        | Products with custom engraving                           | - Shows "Select engraving"<br>- Custom engraving input field<br>- Max 20 characters |
| `chain_length`       | Chain length selection   | Necklaces and chains                                     | - Shows "Select chain length"<br>- No size guide                                    |
| `bracelet_size`      | Bracelet sizing          | Bracelets with size options                              | - Shows "Select bracelet size"<br>- Displays size guide                             |
| `pearl_type`         | Pearl selection          | Pearl jewelry with different pearl types                 | - Shows "Select pearl type"<br>- No size guide                                      |
| `stone_type`         | Stone/gemstone selection | Jewelry with different stone options                     | - Shows "Select stone"<br>- No size guide                                           |
| `diamond_selection`  | Diamond options          | Diamond jewelry with quality/carat selection             | - Shows "Select diamond"<br>- Displays certificate info<br>- Shows size guide       |
| `charm_selection`    | Charm selection          | Charm bracelets and accessories                          | - Shows "Select charm"<br>- No size guide                                           |
| `custom_measurement` | Custom measurements      | Made-to-measure products                                 | - Shows "Select measurement"<br>- Requires measurement input                        |
| `gift_card`          | Gift card value          | Gift cards with different values                         | - Shows "Select value"<br>- No size guide                                           |
| `made_to_order`      | Made to order            | Products made on demand                                  | - Shows lead time<br>- Standard sizing with delivery info                           |

## Product Attributes Mapping

Based on the ElasticSearch schema, these product attributes could be used to determine which template to apply:

### Attributes from IElasticSearch.Item:

- `pdp_template` - Direct template specification
- `material` - Could trigger material-specific templates
- `pl_Pearls` - Could trigger `pearl_type` template
- `pl_Stone` - Could trigger `stone_type` template
- `pl_Diamonds` - Could trigger `diamond_selection` template
- `pl_Length` - Could trigger `chain_length` template
- `engravingInfo` - Could trigger `engraving` template
- `measurementInfo` - Could trigger `custom_measurement` template
- `resizeInfo` - Could indicate resizable products
- `size_guide` - Indicates if size guide should be shown

### Attributes from ProductVariant:

- `leadTime` - Could trigger `made_to_order` template
- `giftcard_value` - Could trigger `gift_card` template
- `sizeDescription` - Standard size descriptions

## How to Set Templates

### 1. Direct Setting via pdp_template

Set the `pdp_template` attribute directly on the product in your PIM/ElasticSearch:

```json
{
  "attributes": {
    "pdp_template": {
      "value": "ring_size",
      "type": "TEXT_INPUT"
    }
  }
}
```

### 2. Automatic Detection (Future Enhancement)

The system could be enhanced to automatically detect templates based on:

- Product category (mainCategory, sanity_category)
- Product attributes (presence of pl_Pearls, pl_Diamonds, etc.)
- Product group identifier
- Material type

## Adding New Templates

To add a new template:

1. **Update Configuration** (`src/config/pdpTemplateConfig.ts`):

```typescript
export const PDP_TEMPLATE_CONFIG = {
  // ... existing templates
  new_template: {
    sizeSelectionKey: 'new-selection',
    variantLabel: 'new label',
    showSizeGuide: false,
    customSettings: {
      // Any custom settings
    },
  },
};
```

2. **Add Translations** (all language files in `translations/`):

```json
{
  "product-page": {
    "select-new-selection": "Select new option",
    "choose-your-new-selection": "Choose your new option"
  }
}
```

3. **Set on Products**: Update products in PIM/ElasticSearch with the new template value.

## Template Priority

When multiple templates could apply to a product, the priority is:

1. Explicit `pdp_template` attribute value
2. Material selector (for material variations - handled separately)
3. Default template (standard size selection)

## Integration with Other Systems

- **MaterialSelector**: Handles material variations independently
- **Stock Rules**: Templates respect stock type (MTO, NOOS, etc.)
- **Pricing**: Templates don't affect pricing logic
- **Search/Filters**: Templates can influence filter options

## Best Practices

1. **Use Specific Templates**: Choose the most specific template for each product type
2. **Consistent Naming**: Use lowercase with underscores for template values
3. **Test Translations**: Ensure all languages have appropriate translations
4. **Consider Mobile**: Templates affect both desktop and mobile views
5. **Document Custom Settings**: If using customSettings, document their purpose

## Future Enhancements

Potential templates that could be added based on existing attributes:

- `packaging_options` - For products with gift wrapping options
- `color_selection` - For products where color is the primary variant
- `volume_selection` - For products with volume options (pl_Volume)
- `certificate_products` - For products with certificates (pl_Certificate)
- `repair_eligible` - For products with repair policies
- `cooperation_products` - For collaboration/cooperation products
