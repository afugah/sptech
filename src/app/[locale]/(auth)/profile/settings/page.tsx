import React from 'react';
import SettingsPage from '@/src/templates/settings/settingsPage';

export const dynamic = 'force-dynamic';

interface ISettingsProps {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ page?: number; q: string }>;
}

const Settings: React.FC<ISettingsProps> = async () => {
  return <SettingsPage />;
};

export default Settings;
