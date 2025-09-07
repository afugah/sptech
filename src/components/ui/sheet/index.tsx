import { X } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { SheetContent, SheetHeader, SheetTitle } from '@/src/components/shadcn/sheet-custom';
export function SheetComponent({
  setOpenSheet,
  title,
  children,
}: {
  setOpenSheet: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <SheetContent className={' bg-alabaster p-0 lg:max-w-[560px]'}>
      <ScrollArea className={'h-full p-0'}>
        <div className={'h-full p-6 px-7 '}>
          <SheetHeader className={'space-y-3'}>
            <div className={'flex w-full items-center justify-between  px-1'}>
              <SheetTitle className={'w-full font-serif text-[1.8rem] font-normal uppercase'}>{title}</SheetTitle>
              <Button
                role={'button'}
                type={'button'}
                aria-label={'Close side bar menu'}
                onClick={() => setOpenSheet(false)}
                variant={'custom'}
                className={' pr-1  [&_svg]:size-8'}
              >
                {/* <CloseIcon role={'button'} className={'pointer z-50 h-6 w-6 '} onClick={() => setIsOpen(false)} /> */}
                <X strokeWidth={1} className={'pointer  text-gray-400  '} size={0} />
              </Button>
            </div>
          </SheetHeader>
          {children}
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
