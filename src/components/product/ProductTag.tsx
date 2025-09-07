'use client';

// import colorString from 'color-string';
// import { isTextWhite } from '@/src/util/color';

interface Tag {
  backgroundColor: string;
  textColor: string;
  title: string;
}

interface IProductTagProps {
  tag: Tag;
}

export const ProductTag: React.FC<IProductTagProps> = (props) => {
  const { tag } = props;

  // const parsedColor = colorString.get(color.toLowerCase());
  // if (!parsedColor) return null;

  // const isWhite = isTextWhite(parsedColor.value);

  return (
    <div
      className={'relative left-0 top-0 px-3 py-[0.3rem] pr-8 text-xxs font-bold uppercase tracking-wide'}
      style={{
        clipPath: 'polygon(0% 0%, calc(100% - 0.7rem) 0%, calc(100% - 1.2rem) 50%, calc(100% - 0.7rem) 100%, 0% 100%)',
        backgroundColor: tag.backgroundColor || 'black',
        color: tag.textColor || 'white',
        width: 'fit-content',
      }}
    >
      {tag.title}
    </div>

    // <span
    //   className={classNames(
    //     'pointer-events-none rounded-3xl px-3 py-2 text-center text-xs uppercase leading-none tracking-wide',
    //   )}
    //   style={{ backgroundColor: tag.backgroundColor, color: tag.textColor }}
    // >
    //   {tag.title}
    // </span>
  );
};
