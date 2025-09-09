# Typesense Missing Data Analysis

## Overview

This document identifies data fields that are expected by the application but are missing or incomplete in the current Typesense product data structure.

## Current Typesense Data Structure (From Provided Payload)

```json
{
  "id": "18",
  "sku": "100018",
  "title": { "en": "Tote Bag" },
  "description": { "en": "..." },
  "image_url": "https://a.storyblok.com/f/247851/f820c775e7/1059048_02.jpg",
  "prices": {
    "europe_SE": { "regularPrice": 1290, "salePrice": 1290, "currency": "SEK" },
    "europe_NO": { "regularPrice": 1290, "salePrice": 1290, "currency": "NOK" },
    // ...other markets
  },
  "product_urls": {
    "europe_SE": "/products/tote-bag-18",
    // ...other markets
  },
  "variants": [
    { "id": "41", "sku": "100018", "stock": 50, "in_stock": true },
    { "id": "86", "sku": "100019", "stock": 75, "in_stock": true }
  ],
  "collections": { "en": ["categories/bags", ...] },
  "availability": "in_stock",
  "in_stock": true,
  "variant_count": 2,
  "created_at_timestamp": 1696189301,
  "updated_at_timestamp": 1755682316,
  "custom_attributes": []
}
```

## Missing/Incomplete Data Fields

### 1. **Multiple Product Images** ⚠️ HIGH PRIORITY

- **Current**: Only single `image_url` field
- **Expected**: Array of images with main and hover images
- **Used In**:
  - `ProductCardBase.tsx` - Expects `thumbnail.hoverUrl` for hover effect
  - `ProductImage.tsx` - Shows hover image on mouse over
  - Product detail pages - Gallery of product images
- **Impact**: No hover effects on product cards, limited product imagery
- **Recommendation**: Add `images` array field with multiple product images, or at minimum add `hover_image_url` field

### 2. **Product Tags** ⚠️ MEDIUM PRIORITY

- **Current**: `tags` field exists but is empty `[]`
- **Expected**: Array of tag strings for product badges (e.g., "NEW", "SALE", "BESTSELLER")
- **Used In**:
  - `ProductCardBase.tsx` - Shows tags when `showTags=true`
  - `ProductTags.tsx` - Renders product badges
  - `StoryblokProductCard.tsx` - Passes tags to card
- **Impact**: No product badges/labels shown on cards
- **Recommendation**: Populate tags field or disable tag display

### 3. **Product Colors** 🟡 LOW PRIORITY

- **Current**: Missing color information
- **Expected**: `color` array field with color codes/names
- **Used In**:
  - `TypesenseProductMapper.ts` - Maps to `color` and `productColor` fields
  - Product filters - Color filtering functionality
- **Impact**: Color filtering not available
- **Recommendation**: Add `color` field or disable color filters

### 4. **Size Information** 🟡 LOW PRIORITY

- **Current**: Variants have no size information
- **Expected**: Size field in variants or separate sizes array
- **Used In**:
  - Product detail pages - Size selection
  - `TypesenseProductMapper.ts` - Maps variant sizes
- **Impact**: No size selection on product pages
- **Recommendation**: Add size info to variants or as separate field

### 5. **Product Type/Category Metadata** 🟡 LOW PRIORITY

- **Current**: Collections exist but no explicit product type
- **Expected**: `productType`, `mainCategory`, `categoryCode` fields
- **Used In**:
  - `TypesenseProductMapper.ts` - Maps these fields
  - Category filtering and navigation
- **Impact**: Limited categorization capabilities
- **Recommendation**: Extract from collections or add explicit fields

### 6. **Material Information** 🟡 LOW PRIORITY

- **Current**: Missing material field
- **Expected**: `material` field for product materials
- **Used In**:
  - `TypesenseProductMapper.ts` - Maps material field
  - Product filters - Material filtering
- **Impact**: Material filtering not available
- **Recommendation**: Add material field or disable material filters

### 7. **Date Fields** 🟡 LOW PRIORITY

- **Current**: Has timestamps but missing formatted date strings
- **Expected**: `created_at`, `updated_at`, `release_date`, `out_of_stock_at` as ISO strings
- **Used In**:
  - Product cards - Display creation date when enabled
  - Sorting - Sort by newest products
- **Impact**: Date display and sorting limited
- **Recommendation**: Add ISO date strings alongside timestamps

### 8. **External IDs** 🟡 LOW PRIORITY

- **Current**: Missing external system references
- **Expected**: `external_id`, `brinkId`, `mpn` fields
- **Used In**:
  - `TypesenseProductMapper.ts` - Maps external IDs
  - Integration with external systems
- **Impact**: Limited external system integration
- **Recommendation**: Add if needed for integrations

### 9. **Product Group Information** 🟡 LOW PRIORITY

- **Current**: Missing product grouping
- **Expected**: `product_group_identifier`, `productGroupProducts`
- **Used In**:
  - Related products functionality
  - Product variants grouping
- **Impact**: No related products shown
- **Recommendation**: Add if related products feature needed

### 10. **Breadcrumb Navigation** 🟡 LOW PRIORITY

- **Current**: Missing breadcrumb data
- **Expected**: Breadcrumb array with title, slug, full_slug
- **Used In**:
  - Product pages - Navigation breadcrumbs
  - SEO - Structured data
- **Impact**: Limited navigation context
- **Recommendation**: Generate from collections hierarchy

### 11. **Review Scores** 🟔 HANDLED SEPARATELY

- **Current**: Missing review data
- **Expected**: `reviewScore` field
- **Used In**: Product cards and detail pages
- **Impact**: No review scores shown
- **Note**: Already handled by separate LipScore integration

### 12. **Variant Titles** 🟡 LOW PRIORITY

- **Current**: Variants have empty title arrays
- **Expected**: Variant names/titles
- **Used In**: Variant selection on product pages
- **Impact**: Generic variant display
- **Recommendation**: Add variant titles or generate from attributes

## Recommendations Summary

### Must Fix (Breaking Issues)

1. ✅ **Prices structure** - FIXED: Updated API to handle market-specific pricing
2. ✅ **Image URL** - FIXED: Now using `image_url` field correctly
3. ✅ **Title/Description** - FIXED: Handling language-specific objects
4. ✅ **SKU field** - FIXED: Using `sku` directly instead of `product_sku`
5. ✅ **Product URLs** - FIXED: Using market-specific URLs

### Should Add (Feature Enhancements)

1. **Multiple images** - Add array of images or at least hover image
2. **Product tags** - Populate tags field with relevant labels
3. **Colors** - Add color information for filtering

### Nice to Have (Optional)

1. **Sizes** - Add size information to variants
2. **Material** - Add material field for filtering
3. **Product type** - Add explicit categorization fields
4. **External IDs** - Add if integrations require them
5. **Product groups** - Add for related products feature
6. **Breadcrumbs** - Generate from collections hierarchy
7. **Date strings** - Add formatted dates alongside timestamps

## Implementation Priority

1. **High Priority**: Multiple images (hover effect is expected UX)
2. **Medium Priority**: Product tags (visible feature on cards)
3. **Low Priority**: All other fields (can be added as features are needed)

## Notes

- The API transformation functions have been updated to handle the current Typesense structure
- Many missing fields can be disabled in the UI if not available
- Some fields (like reviews) are handled by separate integrations
- Consider gradual rollout of additional fields based on feature requirements
