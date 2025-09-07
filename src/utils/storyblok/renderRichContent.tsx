import React from 'react';
import {
  MARK_BOLD,
  MARK_LINK,
  MARK_UNDERLINE,
  NODE_BR,
  NODE_LI,
  NODE_PARAGRAPH,
  NODE_QUOTE,
  NODE_UL,
  render,
} from 'storyblok-rich-text-react-renderer';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import { Link } from '@/src/i18n/navigation';

export interface RichContentOptions {
  paragraphClass?: string;
  listClass?: string;
  listItemClass?: string;
  boldClass?: string;
  underlineClass?: string;
  linkClass?: string;
  emailLinkClass?: string;
  externalLinkClass?: string;
  internalLinkClass?: string;
  fontLight?: boolean;
  textSize?: 'sm' | 'base';
}

const defaultOptions: RichContentOptions = {
  paragraphClass: 'mb-3 leading-relaxed',
  listClass: '-mb-2 mb-0 list-disc space-y-0 pl-6',
  listItemClass: 'leading-tight',
  boldClass: 'font-bold',
  underlineClass: 'underline',
  linkClass: 'underline hover:no-underline',
  emailLinkClass: 'underline hover:no-underline',
  externalLinkClass: 'underline hover:no-underline',
  internalLinkClass: 'underline hover:no-underline',
  fontLight: false,
  textSize: 'base',
};

export const renderRichContent = (content: StoryblokRichtext, options: RichContentOptions = {}) => {
  const opts = { ...defaultOptions, ...options };

  // Build paragraph classes
  const paragraphClasses = [
    opts.paragraphClass,
    opts.fontLight ? 'font-light' : '',
    opts.textSize === 'sm' ? 'text-sm' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return content
    ? render(content, {
        nodeResolvers: {
          [NODE_BR]: () => <br />,
          [NODE_PARAGRAPH]: (children) => <p className={paragraphClasses}>{children}</p>,
          [NODE_UL]: (children) => <ul className={opts.listClass}>{children}</ul>,
          [NODE_LI]: (children) => <li className={opts.listItemClass}>{children}</li>,
          [NODE_QUOTE]: (children: React.ReactNode) => (
            <blockquote className={'mb-3 font-serif text-2xl italic'}>{children}</blockquote>
          ),
        },
        markResolvers: {
          [MARK_BOLD]: (children) => <span className={opts.boldClass}>{children}</span>,
          [MARK_UNDERLINE]: (children) => <span className={opts.underlineClass}>{children}</span>,
          [MARK_LINK]: (children, props) => {
            const { linktype, href, target } = props;

            if (linktype === 'email') {
              return (
                <a href={`mailto:${href}`} className={opts.emailLinkClass}>
                  {children}
                </a>
              );
            }

            if (href?.match(/^(https?:)?\/\//)) {
              return (
                <a href={href} target={target} className={opts.externalLinkClass}>
                  {children}
                </a>
              );
            }

            return (
              <Link href={href || '/'} className={opts.internalLinkClass}>
                {children}
              </Link>
            );
          },
        },
      })
    : null;
};

// Preset configurations for common use cases
export const richContentPresets = {
  // FAQ pages with font-light paragraphs
  faq: {
    fontLight: true,
  } as RichContentOptions,

  // CSR page with smaller text
  csr: {
    fontLight: true,
    textSize: 'sm' as const,
  } as RichContentOptions,

  // Clarity page with different spacing
  clarity: {
    paragraphClass: 'mb-2.5 leading-relaxed',
    listClass: 'mb-0 list-disc pl-6',
    listItemClass: 'mb-0 leading-snug',
  } as RichContentOptions,

  // Size guide modal with minimal styling
  modal: {
    paragraphClass: 'mb-3',
    listClass: undefined,
    listItemClass: undefined,
  } as RichContentOptions,

  // Default configuration for general use
  default: {} as RichContentOptions,
};
