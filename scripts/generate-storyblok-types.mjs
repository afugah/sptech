import { dirname } from 'path';
import storyblokGenerate from 'storyblok-generate-ts'; // Import the default export
import { fileURLToPath } from 'url';
// ../components.XXXXXX.json - Where XXXXXX is the your Storyblok Id
import componentsJson from '../components.329822.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storyblokToTypescript = storyblokGenerate.default;

/* #region  Custom type parser */
function customTypeParser(key, obj) {
  switch (obj.field_type) {
    case 'storyblok-slider':
      return {
        [key]: {
          type: 'object',
          required: ['value'],
          properties: {
            value: {
              plugin: 'string',
              type: 'number',
            },
          },
        },
      };

    case 'storyblok-palette':
      return {
        [key]: {
          type: 'object',
          required: ['value'],
          properties: {
            value: {
              plugin: 'string',
              type: 'string',
            },
          },
        },
      };

    default:
      return {};
  }
}
/* #endregion */

storyblokToTypescript({
  componentsJson: { components: componentsJson },
  path: `${__dirname}/../src/types/framework/storyblok-components.ts`,
  customTypeParser,
  // `yarn storyblok` runs `eslint` after so no need to format.
  format: false,
  compilerOptions: {
    bannerComment: '/* eslint-disable @typescript-eslint/no-explicit-any */',
  },
});
