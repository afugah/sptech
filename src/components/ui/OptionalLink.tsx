import { Link } from '@/src/i18n/navigation';

interface IOptionalLinkProps extends React.PropsWithChildren {
  href: string | undefined;
}

export const OptionalLink: React.FC<IOptionalLinkProps> = (props) => {
  const { href, children, ...restProps } = props;

  if (!href) return <>{children}</>;

  return (
    <Link href={href} {...restProps}>
      {children}
    </Link>
  );
};
