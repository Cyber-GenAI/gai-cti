import { FC } from 'react';
import { EuiPageHeader } from '@elastic/eui';
import { mitreCoverageHeadDescription } from './constants';

export const CoverageHeader: FC = () => (
  <EuiPageHeader
    pageTitle="MITRE ATT&CK Coverage"
    description={mitreCoverageHeadDescription}
  />
);

