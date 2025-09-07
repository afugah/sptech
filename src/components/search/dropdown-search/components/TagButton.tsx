import React from 'react';
import { Tag } from '@/src/components/ui/TagList';

interface TagButtonProps {
  label: string;
  onClick: () => void;
}

const TagButton: React.FC<TagButtonProps> = ({ label, onClick }) => {
  return (
    <button type={'button'} onClick={onClick}>
      <Tag>{label}</Tag>
    </button>
  );
};

export default TagButton;
