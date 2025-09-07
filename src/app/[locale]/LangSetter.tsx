'use client';

import React from 'react';

interface LangSetterProps {
  lang: string;
}

const LangSetter: React.FC<LangSetterProps> = ({ lang }) => {
  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
};

export default LangSetter;
