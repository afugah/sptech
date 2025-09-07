/**
 * SafeHTML Component
 * Provides secure HTML rendering with DOMPurify sanitization
 */

import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * Default DOMPurify configuration for e-commerce content
 */
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'div',
    'span',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'a',
  ],
  ALLOWED_ATTR: ['class', 'id', 'href', 'title', 'alt', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * Strict configuration for user-generated content
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * SafeHTML component that sanitizes HTML content before rendering
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({
  html,
  className,
  tag: Tag = 'div',
  allowedTags,
  allowedAttributes,
}) => {
  const [sanitizedHTML, setSanitizedHTML] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !html) {
      setSanitizedHTML('');
      return;
    }

    try {
      // Create custom configuration if custom tags/attributes provided
      const config =
        allowedTags || allowedAttributes
          ? {
              ...DEFAULT_CONFIG,
              ...(allowedTags && { ALLOWED_TAGS: allowedTags }),
              ...(allowedAttributes && { ALLOWED_ATTR: allowedAttributes }),
            }
          : DEFAULT_CONFIG;

      // Sanitize the HTML
      const sanitized = DOMPurify.sanitize(html, config);
      setSanitizedHTML(sanitized);
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      setSanitizedHTML(''); // Fail safely by rendering nothing
    }
  }, [html, isClient, allowedTags, allowedAttributes]);

  // Server-side rendering fallback
  if (!isClient) {
    return <Tag className={className}>{html.replace(/<[^>]*>/g, '')}</Tag>;
  }

  // Don't render if no content or sanitization failed
  if (!sanitizedHTML) {
    return null;
  }

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

/**
 * SafeHTML component with strict sanitization for user content
 */
export const SafeUserHTML: React.FC<Omit<SafeHTMLProps, 'allowedTags' | 'allowedAttributes'>> = (props) => {
  return <SafeHTML {...props} allowedTags={STRICT_CONFIG.ALLOWED_TAGS} allowedAttributes={[]} />;
};

/**
 * Utility hook for sanitizing HTML in other contexts
 */
export function useSanitizedHTML(html: string, strict: boolean = false) {
  const [sanitizedHTML, setSanitizedHTML] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !html) {
      setSanitizedHTML('');
      return;
    }

    try {
      const config = strict ? STRICT_CONFIG : DEFAULT_CONFIG;
      const sanitized = DOMPurify.sanitize(html, config);
      setSanitizedHTML(sanitized);
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      setSanitizedHTML('');
    }
  }, [html, isClient, strict]);

  return {
    sanitizedHTML,
    isLoading: !isClient,
    isEmpty: !sanitizedHTML,
  };
}

/**
 * Server-safe utility function for sanitizing HTML
 * Use this for pre-processing HTML on the server side
 */
export function sanitizeHTMLServer(html: string, strict: boolean = false): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags for safety
    return html.replace(/<[^>]*>/g, '');
  }

  try {
    const config = strict ? STRICT_CONFIG : DEFAULT_CONFIG;
    return DOMPurify.sanitize(html, config);
  } catch (error) {
    console.error('Error sanitizing HTML on server:', error);
    return html.replace(/<[^>]*>/g, '');
  }
}
