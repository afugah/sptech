# Typesense Schema & Type Synchronization

This document describes the automated workflow for synchronizing Typesense collection schemas with TypeScript types, similar to the Storyblok workflow.

## Overview

The Typesense sync workflow provides:

- **Automated schema fetching** from your Typesense server
- **TypeScript type generation** from collection schemas
- **Sample document analysis** for comprehensive type coverage
- **Schema versioning and backup** for change tracking
- **Type-safe integration** with existing codebase

## Quick Start

### Prerequisites

Ensure you have Typesense credentials in your `.env.local` file:

```env
# Typesense Configuration
SEARCH_TYPESENSE_HOST=your-host.typesense.net
SEARCH_TYPESENSE_PORT=443
SEARCH_TYPESENSE_PROTOCOL=https
SEARCH_TYPESENSE_API_KEY=your-api-key
SEARCH_TYPESENSE_COLLECTION=products
```

### Basic Usage

1. **Pull schemas from Typesense server**:

   ```bash
   npm run typesense:pull
   ```

2. **Generate TypeScript types**:

   ```bash
   npm run typesense:generate
   ```

3. **Or run both in sequence**:
   ```bash
   npm run typesense:sync
   ```

## Commands

### `npm run typesense:pull`

Fetches collection schemas from your Typesense server.

**Options**:

- Default: Pulls the collection specified in `SEARCH_TYPESENSE_COLLECTION`
- Specific collection: `npm run typesense:pull -- collection_name`
- All collections: `npm run typesense:pull -- --all`

**Output**:

- Schema JSON: `.typesense/schemas/{collection}.json`
- Summary MD: `.typesense/schemas/{collection}_summary.md`
- Backups: `.typesense/schemas/backups/` (automatic versioning)

### `npm run typesense:generate`

Generates TypeScript types from pulled schemas.

**Output**:

- Individual types: `.typesense/types/{collection}.ts`
- Proxy file: `src/types/typesense/generated.ts`

### `npm run typesense:sync`

Convenience command that runs both pull and generate in sequence.

## Generated Files Structure

```
project-root/
├── .typesense/
│   ├── schemas/
│   │   ├── products.json          # Raw schema + sample document
│   │   ├── products_summary.md    # Human-readable summary
│   │   └── backups/               # Versioned schema backups
│   └── types/
│       └── products.ts            # Generated TypeScript types
└── src/
    └── types/
        └── typesense/
            └── generated.ts       # Proxy file for clean imports
```

## Type Usage

After generation, import types from the proxy file:

```typescript
import {
  TypesenseProductsDocument,
  TypesenseProductsDocumentSearchResponse,
  TypesenseQueryParams,
} from '@/src/types/typesense/generated';

// Use in your repositories
const product: TypesenseProductsDocument = {
  id: '123',
  sku: 'PROD-001',
  title: 'Product Name',
  // ... other fields
};

// Type-safe search responses
const searchResult: TypesenseProductsDocumentSearchResponse = await client
  .collections<TypesenseProductsDocument>('products')
  .documents()
  .search(params);
```

## Features

### 1. Schema Analysis

The pull script:

- Fetches the official schema from Typesense
- Retrieves a sample document for structure analysis
- Identifies fields present in documents but not in schema
- Creates human-readable summaries

### 2. Type Generation

The generator:

- Maps Typesense field types to TypeScript types
- Handles nested objects and arrays
- Includes fields from sample documents
- Generates search response types
- Creates JSDoc comments for special field properties

### 3. Version Control

- Automatic backup of existing schemas before updates
- Timestamped backups for change tracking
- Metadata tracking (environment, timestamp, document count)

### 4. Comprehensive Coverage

The system handles:

- Market-specific fields (prices, URLs, breadcrumbs)
- Product variants and groups
- Custom attributes
- Multi-language content
- Legacy field compatibility

## Type Mapping

| Typesense Type | TypeScript Type           |
| -------------- | ------------------------- |
| string         | string                    |
| int32/int64    | number                    |
| float          | number                    |
| bool           | boolean                   |
| geopoint       | [number, number]          |
| object         | Record<string, unknown>   |
| auto           | unknown                   |
| string[]       | string[]                  |
| object[]       | Record<string, unknown>[] |

## Workflow Integration

### Development Workflow

1. **Initial Setup**: Run `npm run typesense:sync` to get baseline types
2. **After Schema Changes**: Re-run sync to update types
3. **CI/CD Integration**: Add to build pipeline for validation
4. **Version Control**: Commit generated types for team consistency

### With Existing Code

The generated types complement the manually maintained types:

- Keep `ITypesense.ts` for complex business logic types
- Use generated types for raw document interfaces
- Update mappers to bridge between both type systems

### Example Integration

```typescript
// In your mapper
import { TypesenseProductsDocument } from '@/src/types/typesense/generated';
import { IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

export class TypesenseProductMapper {
  static toDomain(doc: TypesenseProductsDocument): IProduct {
    return {
      id: doc.id,
      sku: doc.sku,
      title: typeof doc.title === 'object' ? doc.title[marketKey] : doc.title,
      // ... mapping logic
    };
  }
}
```

## Best Practices

1. **Regular Syncing**: Run sync before major releases
2. **Review Changes**: Check schema summaries for unexpected changes
3. **Type Safety**: Use generated types in mappers and repositories
4. **Documentation**: Keep schema summaries in version control
5. **Environment Parity**: Ensure dev/staging/prod schemas match

## Troubleshooting

### Missing Environment Variables

```
❌ Missing required environment variables
```

**Solution**: Add required variables to `.env.local`:

- `SEARCH_TYPESENSE_HOST`
- `SEARCH_TYPESENSE_API_KEY`

### Collection Not Found

```
❌ Collection "collection_name" not found
```

**Solution**: Verify collection exists on server or use `--all` to list available collections.

### Connection Issues

```
❌ Schema pull failed: Connection timeout
```

**Solution**:

- Check Typesense server is accessible
- Verify host, port, and protocol settings
- Ensure API key has read permissions

### Type Conflicts

If generated types conflict with existing code:

1. Review the comparison report in console output
2. Update mappers to handle new fields
3. Consider using type guards for optional fields

## Advanced Usage

### Custom Type Overrides

Create a custom types file that extends generated types:

```typescript
// src/types/typesense/custom.ts
import { TypesenseProductsDocument } from './generated';

export interface EnhancedProduct extends TypesenseProductsDocument {
  // Add custom computed properties
  displayPrice: string;
  isOnSale: boolean;

  // Override specific fields
  variants: EnhancedVariant[];
}
```

### Schema Validation

Add pre-commit hook to validate schemas:

```json
// package.json
{
  "scripts": {
    "typesense:validate": "node ./scripts/validate-typesense-types.mjs"
  }
}
```

### Automated Updates

Add to CI/CD pipeline:

```yaml
# .github/workflows/typesense-sync.yml
- name: Sync Typesense Types
  run: |
    npm run typesense:sync
    npm run lint:fix
```

## Migration from Manual Types

1. **Run initial sync**: Generate baseline types
2. **Compare with existing**: Review ITypesense.ts vs generated
3. **Update mappers**: Use generated types where appropriate
4. **Gradual migration**: Replace manual types incrementally
5. **Maintain compatibility**: Keep legacy support as needed

## Future Enhancements

Potential improvements:

- Schema migration scripts
- Breaking change detection
- Automatic mapper updates
- Multi-environment schema comparison
- GraphQL schema generation
- OpenAPI spec generation

## Support

For issues or questions:

1. Check schema summaries in `.typesense/schemas/`
2. Review generated types for accuracy
3. Validate environment configuration
4. Ensure Typesense server compatibility
