import { Link, type LinkProps } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type InternalLinkProps = Omit<
  LinkProps,
  'children' | 'className' | 'rel' | 'target'
> & {
  children: ReactNode;
};

const internalLinkClassName =
  'text-secondary underline decoration-black/70 decoration-wavy decoration-2 underline-offset-4 transition-colors hover:decoration-black dark:decoration-white/70 dark:hover:decoration-white';

export default function InternalLink({
  children,
  ...props
}: InternalLinkProps) {
  return (
    <Link
      {...props}
      className={internalLinkClassName}
      data-link-kind="internal"
      target="_self"
    >
      {children}
    </Link>
  );
}
