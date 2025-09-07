import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return <div className={cn(styles.badge, className)}>{children}</div>;
}
