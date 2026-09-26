import { EuiLoadingSpinner } from '@elastic/eui';
import { FC } from 'react';
import { LoadingPromptProps } from './types';
import { cn } from '../../utils';

export const LoadingSpinner: FC<LoadingPromptProps> = ({
  size = 'xl',
}) => {

  return (
    <div
      className={cn(
        "flex justify-center items-center w-full col-span-full",
      )}
    >
      <EuiLoadingSpinner size={size}/>
    </div>
  );
};
