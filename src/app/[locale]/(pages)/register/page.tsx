export const dynamic = 'force-dynamic';

import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import { redirect } from '@/src/i18n/navigation';
import { auth } from '@/src/lib/auth';
import RegisterPage from '@/src/templates/register/registerPage';

const Register = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const session = await auth();

  if (session) {
    return redirect({ href: '/profile', locale });
  }

  return <RegisterPage />;
};

export default Register;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/register`;

  return {
    title: t('account.register'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
