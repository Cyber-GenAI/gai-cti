import { FC } from 'react';
import { EuiPageHeader } from '@elastic/eui';
import { mitreAPTHeadDescription } from './constants';

export const APTHeader: FC = () => (
  <EuiPageHeader
    pageTitle="MITRE ATT&CK APT"
    description={mitreAPTHeadDescription}
  />
);

