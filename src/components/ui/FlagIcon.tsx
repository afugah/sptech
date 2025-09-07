import React, { useEffect, useState } from 'react';

type Props = {
  countryCode: string;
};

const FlagIcon = ({ countryCode }: Props) => {
  const [icon, setIcon] = useState();

  useEffect(() => {
    async function fetchFlag() {
      await import(`@images/flags/svg/${countryCode.toLowerCase()}.svg`).then((icon) => setIcon(icon.default));
    }
    fetchFlag();
  }, [countryCode]);

  if (icon === '') return null;

  return <>{icon}</>;
};

export default FlagIcon;
