export const dynamic = 'force-dynamic';

import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import ResetPasswordTemplate from '@/src/templates/reset-password/resetPasswordPage';

interface IResetPasswordProps {
  searchParams: Promise<{
    oobCode?: string;
  }>;
}

const ResetPassword: React.FC<IResetPasswordProps> = async ({ searchParams }) => {
  const { oobCode } = await searchParams;
  return <ResetPasswordTemplate oobCode={oobCode || null} />;
};

export default ResetPassword;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/reset-password`;

  return {
    title: t('account.reset-your-password'),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}
