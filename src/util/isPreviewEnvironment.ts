const isPreviewEnvironment = () => {
  // Check explicit preview environment variable
  if (/true/i.test(process.env.NEXT_PUBLIC_PREVIEW_ENVIRONMENT ?? '')) {
    return true;
  }

  // Check if running on dev.sp.tech (preview domain)
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'dev.sp.tech';
  }

  // Server-side check for preview domain
  return process.env.VERCEL_URL?.includes('dev.sp.tech') || false;
};

export default isPreviewEnvironment;
