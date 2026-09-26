import { FC } from 'react';
import {
  EuiTableRow,
  EuiTableRowCell,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { LogsTableRowProps } from './types';
import { renderDottedJson } from '../../../../../utils/renderFormater';

export const LogsTableRow: FC<LogsTableRowProps> = ({ hit, onViewDetails, onExplainLog }) => {
  const { timestamp, dottedJson } = renderDottedJson(hit._source)

  return (
    <EuiTableRow>
      <EuiTableRowCell>
        <EuiFlexGroup gutterSize='s'>
          <EuiFlexItem>
            <EuiButtonIcon
              iconType="expand"
              aria-label="View details"
              onClick={onViewDetails}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButtonIcon
              color='success'
              iconType="sparkles"
              aria-label="Explain log"
              onClick={onExplainLog}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiTableRowCell>
      <EuiTableRowCell>{timestamp}</EuiTableRowCell>

      <EuiTableRowCell>
        <div className="line-clamp-3 overflow-hidden">
          {dottedJson}
        </div>
      </EuiTableRowCell>
    </EuiTableRow>
  );
};