import React from 'react';

type Props = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const Overlay = ({ isVisible, setIsVisible, ...props }: Props) => (
  <div
    onClick={() => setIsVisible(false)}
    className={`fixed bottom-0 left-0 right-0 top-0 bg-black bg-opacity-30 transition-all duration-500 ${
      isVisible ? 'z-40 flex opacity-100' : 'z--1 hidden opacity-0'
    }`}
    {...props}
  ></div>
);

export default Overlay;
