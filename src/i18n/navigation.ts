import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Export navigation utilities for client components
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
