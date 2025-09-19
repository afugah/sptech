'use client';

import { type IStoryblok } from '@/src/types/framework/storyblok';

// Placeholder component for linksGrid Storyblok component
// TODO: Implement proper linksGrid functionality based on Storyblok schema
interface LinksGridProps {
  links?: Array<{
    url?: string;
    title?: string;
    target?: string;
  }>;
  title?: string;
  columns?: number;
}

const LinksGrid: IStoryblok.FC<LinksGridProps> = ({ blok }) => {
  const { links, title, columns = 3 } = blok;

  // Return empty if no links
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={'container mx-auto px-4 py-8'}>
      {title && <h2 className={'mb-6 text-2xl font-bold'}>{title}</h2>}

      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url || '#'}
            target={link.target || '_self'}
            className={'hover:bg-gray-50 rounded border p-4 transition-colors'}
          >
            {link.title || 'Link'}
          </a>
        ))}
      </div>
    </div>
  );
};

export default LinksGrid;
