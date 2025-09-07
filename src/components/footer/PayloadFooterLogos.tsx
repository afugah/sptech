import Image from 'next/image';
import { type FooterLogo, type FooterSettingsGlobal } from '@/src/types/payload/footer-logos';

async function getFooterSettings(): Promise<FooterSettingsGlobal | null> {
  try {
    // Use production URL if available, fallback to localhost
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'https://cms.sp.tech';
    const response = await fetch(`${payloadUrl}/api/globals/footer-settings`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Failed to fetch footer settings:', response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    return null;
  }
}

export async function PayloadFooterLogos() {
  const data = await getFooterSettings();

  if (!data || !data.showLogos || !data.logos || data.logos.length === 0) {
    return null;
  }

  // Use logos directly from the global
  const sortedLogos = data.logos;

  // Separate main logos from regular logos
  const mainLogos = sortedLogos.filter((logo) => logo.isMainLogo);
  const regularLogos = sortedLogos.filter((logo) => !logo.isMainLogo);

  return (
    <div className={'flex flex-col items-center gap-14'}>
      {/* Main logos section */}
      {mainLogos.length > 0 && (
        <div className={'mb-18 flex flex-wrap items-center justify-center gap-8'}>
          {mainLogos.map((logo: FooterLogo) => (
            <div key={logo.id}>
              <Image
                src={logo.logo.url}
                alt={logo.logo.alt || 'Logo'}
                title={logo.logo.alt || logo.logo.filename}
                width={185}
                height={185}
                quality={100}
                className={'inline-block align-middle'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Regular logos section */}
      {regularLogos.length > 0 && (
        <div
          className={
            'grid max-w-5xl grid-cols-3 items-center justify-items-center gap-8 lg:flex lg:justify-center lg:gap-10'
          }
        >
          {regularLogos.map((logo: FooterLogo) => (
            <div key={logo.id} className={'flex items-center justify-center'}>
              <Image
                src={logo.logo.url}
                alt={logo.logo.alt || 'Logo'}
                title={logo.logo.alt || logo.logo.filename}
                width={96}
                height={24}
                quality={100}
                className={
                  'position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;'
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PayloadFooterLogos;
