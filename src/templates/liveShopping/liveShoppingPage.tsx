'use client';

import { StoryblokComponent } from '@storyblok/react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'use-intl';
import { LoadMore } from '@/src/components/ui/LoadMore/LoadMore';
import { type LiveShopping } from '@/src/types/framework/storyblok-components';

interface IProps {
  story: {
    name: string;
    content: LiveShopping;
  } | null;
}

const LiveShoppingPage: React.FC<IProps> = ({ story }) => {
  const t = useTranslations('');
  const [liveShoppingCardsPage, setLiveShoppingCardsPage] = useState(1);
  const onLoadMore = () => {
    setLiveShoppingCardsPage((prevState) => prevState + 1);
  };
  const isLoadMoreVisible = useMemo(() => {
    return story?.content.liveShoppingCards && story?.content.liveShoppingCards?.length > 6 * liveShoppingCardsPage;
  }, [liveShoppingCardsPage, story?.content.liveShoppingCards]);
  return (
    <div className={'flex flex-col gap-y-16 bg-seashell pt-20'}>
      <div className={'mx-7 flex flex-col md:mx-0'}>
        {story &&
          story?.content.liveShoppingBanner?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
      </div>
      <div className={'grid grid-cols-2 gap-x-6 gap-y-10 pb-20 md:container md:gap-x-20 md:gap-y-24 lg:grid-cols-3'}>
        {story &&
          story?.content.liveShoppingCards
            ?.slice(0, 6 * liveShoppingCardsPage)
            ?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
      </div>
      {isLoadMoreVisible && (
        <LoadMore onLoadMore={onLoadMore} title={t('product.list.load-more')} className={'uppercase tracking-widest'} />
      )}
    </div>
  );
};

export default LiveShoppingPage;
