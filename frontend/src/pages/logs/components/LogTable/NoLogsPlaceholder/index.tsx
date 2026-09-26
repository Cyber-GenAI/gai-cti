import React from 'react';
import { EuiEmptyPrompt, EuiPanel, EuiIcon, EuiText } from '@elastic/eui';
import { noLogsText, noLogsTitle } from './constants';

export const NoLogsPlaceholder: React.FC = () => (
  <EuiPanel hasShadow={false} hasBorder={true} paddingSize="xl" color="subdued" grow={true} className='!py-24'>
    <EuiEmptyPrompt
      icon={<EuiIcon type="faceSad" size="xxl" />}
      title={<h3>{noLogsTitle}</h3>}
      body={
        <EuiText color="accent">
          <p>{noLogsText}</p>
        </EuiText>
      }
    />
  </EuiPanel>
);