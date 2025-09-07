module.exports = {
  "*.{js,jsx,ts,tsx}": (filenames) => {
    // Filter out .storyblok files and config files
    const filteredFiles = filenames.filter(
      file => !file.includes('.storyblok/') && !file.endsWith('.config.js') && !file.endsWith('rc.js')
    );
    
    // Only run ESLint if there are non-Storyblok files
    if (filteredFiles.length > 0) {
      return [`eslint --cache --fix --max-warnings 0 ${filteredFiles.join(' ')}`];
    }
    return [];
  },
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{css,scss}": ["prettier --write"]
};