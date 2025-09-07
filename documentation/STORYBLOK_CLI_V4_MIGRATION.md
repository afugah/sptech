# Storyblok CLI v4 Migration Documentation

## Overview

This document describes the successful migration to Storyblok CLI v4 for type generation in the SP Tech project. The migration provides:

- ✅ Official Storyblok CLI v4 type generation
- ✅ Full backward compatibility with existing codebase
- ✅ Enhanced custom field type definitions
- ✅ Automated type generation workflow
- ✅ Dynamic proxy system for type management

## Migration Status

**Branch**: `feature/storyblok-cli-v4-migration`  
**Space ID**: `329822`  
**Components**: 87 Storyblok components migrated  
**Type Aliases**: 91 backward compatibility aliases created  
**Status**: ✅ Successfully migrated and tested

## Architecture

### Directory Structure

```
efva-attling/
├── .storyblok/
│   ├── components/329822/         # Pulled component definitions
│   │   ├── components.json
│   │   ├── groups.json
│   │   ├── presets.json
│   │   └── internal-tags.json
│   └── types/
│       ├── storyblok.d.ts        # Base Storyblok types
│       └── 329822/                # Space-specific types
│           └── storyblok-components.d.ts
├── scripts/
│   ├── generate-dynamic-storyblok-proxy.mjs  # Proxy generator
│   ├── generate-storyblok-types-with-env.mjs # Type generation coordinator
│   └── pull-and-generate-storyblok-v4.mjs    # Complete migration script
└── src/types/framework/
    └── storyblok-components.ts   # Dynamic proxy with aliases
```

### Type Generation Flow

1. **Component Pull**: `npx storyblok@latest components pull --space 329822`
2. **Type Generation**: `npx storyblok@latest types generate --space 329822`
3. **Proxy Generation**: Creates backward compatibility layer
4. **Lint Fix**: Ensures code quality

## Key Features

### 1. Backward Compatibility

The migration maintains 100% backward compatibility by:
- Creating type aliases for all existing `*Storyblok` suffixed types
- Mapping new clean interface names to legacy aliases
- Supporting both naming conventions simultaneously

**Example Mappings**:
- `Banner` → `BannerStoryblok`
- `Grid` → `GridStoryblok`
- `Hero` → `HeroStoryblok`
- `CmsPage` → `CmsPageStoryblok`

### 2. Enhanced Custom Field Types

The system provides proper TypeScript types for Storyblok custom fields:

```typescript
// Slider fields
export interface StoryblokSlider {
  value: number;
  [k: string]: any;
}

// Video fields
export interface StoryblokVimeo {
  url: string;
  title?: string;
  description?: string;
  [k: string]: any;
}

// Color picker fields
export interface StoryblokColorPicker {
  color: string;
  alpha?: number;
  [k: string]: any;
}

// SEO fields
export interface StoryblokSeo {
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  [k: string]: any;
}
```

### 3. Dynamic Proxy System

The proxy file at `src/types/framework/storyblok-components.ts`:
- Re-exports all CLI-generated types
- Adds enhanced custom field types
- Creates backward compatibility aliases
- Auto-updates when components change

## Usage

### Running Type Generation

```bash
# Pull components and generate types (recommended)
yarn pull-storyblok:v4

# Or run individual steps:

# 1. Pull components from Storyblok
npx storyblok@latest components pull --space 329822

# 2. Generate TypeScript types
npx storyblok@latest types generate --space 329822

# 3. Generate dynamic proxy
node ./scripts/generate-dynamic-storyblok-proxy.mjs

# 4. Fix linting
yarn lint:fix
```

### Package.json Scripts

```json
{
  "scripts": {
    "storyblok": "node ./scripts/generate-storyblok-types.mjs && eslint src/types/framework/storyblok-components.ts --fix",
    "storyblok:v4": "node ./scripts/generate-storyblok-types-with-env.mjs",
    "pull-storyblok": "node ./scripts/pull-and-generate-storyblok.mjs",
    "pull-storyblok:v4": "node ./scripts/pull-and-generate-storyblok-v4.mjs"
  }
}
```

### Environment Variables

Add to `.env.local`:
```bash
STORYBLOK_SPACE=329822
NEXT_PUBLIC_STORYBLOK_TOKEN=your_token_here
```

## Migration Scripts

### 1. generate-dynamic-storyblok-proxy.mjs

**Purpose**: Generates the dynamic proxy file with backward compatibility aliases

**Features**:
- Parses CLI-generated types
- Creates type aliases for backward compatibility
- Adds enhanced custom field types
- Handles 87 component interfaces and 4 base types

### 2. generate-storyblok-types-with-env.mjs

**Purpose**: Coordinates the entire type generation process

**Features**:
- Loads environment variables
- Runs proxy generation
- Executes CLI type generation
- Runs ESLint fix

### 3. pull-and-generate-storyblok-v4.mjs

**Purpose**: Complete migration workflow in one command

**Features**:
- Sets up directories
- Pulls components from Storyblok
- Generates TypeScript types
- Creates dynamic proxy
- Runs lint fix
- Provides error handling and troubleshooting

## Benefits

### For Developers

1. **No Breaking Changes**: Existing code continues to work
2. **Better IntelliSense**: Proper types for custom fields
3. **Official CLI**: Using Storyblok's maintained tooling
4. **Flexible Naming**: Use either clean names or legacy aliases

### For the Project

1. **Future-Proof**: Ready for Storyblok updates
2. **Maintainable**: Automated generation reduces manual work
3. **Type-Safe**: Comprehensive type coverage
4. **Cross-Environment**: Works with different Storyblok spaces

## Known Issues and Solutions

### Issue: Custom Field Types Show as `{}`

**Symptom**: Fields like `desktopBannerWidth` have type `{}` instead of proper structure

**Solution**: The enhanced custom field types in the proxy handle this, but components using these fields may need to cast to the proper type:

```typescript
// Example usage
const width = (block.desktopBannerWidth as StoryblokSlider)?.value || 100;
```

### Issue: TypeScript Errors After Generation

**Symptom**: Import errors for types with `Storyblok` suffix

**Solution**: Ensure the proxy generator has run and created backward compatibility aliases. Run:
```bash
node ./scripts/generate-dynamic-storyblok-proxy.mjs
```

## Testing

The migration has been tested with:
- ✅ 87 Storyblok components
- ✅ 150+ TypeScript files using the types
- ✅ ESLint passing with 0 warnings
- ✅ Backward compatibility verified
- ✅ Development server running successfully

## Future Enhancements

1. **Enhanced Type Overrides**: Add more specific type definitions for complex custom fields
2. **Automated CI/CD**: Include type generation in build pipeline
3. **Type Validation**: Add runtime validation for Storyblok responses
4. **Migration Tool**: Create tool to gradually migrate from legacy to new naming

## Rollback Procedure

If needed, to rollback to the previous system:

1. Switch back to main branch: `git checkout main`
2. Restore old type generation: Use existing `yarn storyblok` command
3. Remove new scripts and dependencies

## Support

For issues or questions about the migration:
1. Check this documentation
2. Review the migration guide at `/docs/storyblok-cli-v4-migration-guide.md`
3. Check the Storyblok CLI documentation: https://github.com/storyblok/storyblok-cli

## Conclusion

The migration to Storyblok CLI v4 is complete and successful. The system provides:
- Official type generation with CLI v4
- Full backward compatibility
- Enhanced developer experience
- Automated workflows
- Future-proof architecture

The project can now benefit from official Storyblok tooling while maintaining all existing functionality.