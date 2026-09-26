import { EuiSkeletonRectangle } from '@elastic/eui';
import { FC } from 'react';
import { LoadingPromptProps } from './types';
import { cn } from '../../utils';

export const LoadingPrompt: FC<LoadingPromptProps> = ({
  size = 'xl',
  columns = 1,
  rows = 1
}) => {

  const height_sizing: Record<LoadingPromptProps['size'], string> = {
    s: '!h-[5rem]',
    m: '!h-[10rem]',
    l: '!h-[14rem]',
    xl: '!h-[30rem]',
  };

  return (
    <div
      className={cn(
        "grid gap-4 w-full col-span-full",
        `grid-cols-${columns}`
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * columns }).map((_, idx) => (
        <EuiSkeletonRectangle
          key={idx}
          className={cn("!w-full !col-span-1", height_sizing[size])}
        />
      ))}
    </div>
  );
};
