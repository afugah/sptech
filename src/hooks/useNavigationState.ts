import { useState } from 'react';

export const useNavigationState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('main');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMainItemClick = (key: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(key);
      setIsTransitioning(false);
    }, 150);
  };

  const getMenuAnimationClass = () => {
    if (isTransitioning) {
      return currentLevel === 'main' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';
    }
    return 'translate-x-0 opacity-100';
  };

  return {
    isOpen,
    setIsOpen,
    currentLevel,
    isTransitioning,
    handleMainItemClick,
    getMenuAnimationClass,
  };
};
