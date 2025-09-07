module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--ignore-ssl-errors=yes',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list'
    ]
  },
  browserContext: 'default'
};