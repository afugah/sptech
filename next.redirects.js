const redirects = async () => {
  return [
    {
      source: '/preview/:path*',
      destination: `/:path*?x-vercel-protection-bypass=${process.env.VERCEL_PROTECTION_BYPASS_KEY}&x-vercel-set-bypass-cookie=samesitenone`,
      permanent: false,
    },
  ];
};

module.exports = { redirects };
