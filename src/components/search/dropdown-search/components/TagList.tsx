import React from 'react';
import TagButton from './TagButton';

interface TagListProps {
  tags: string[];
  onTagClick: (tag: string) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onTagClick }) => {
  return (
    <div className={'wrap justify-left flex flex-wrap gap-2'}>
      {tags.map((tag, index) => (
        <TagButton key={index} label={tag} onClick={() => onTagClick(tag)} />
      ))}
    </div>
  );
};

export default TagList;
