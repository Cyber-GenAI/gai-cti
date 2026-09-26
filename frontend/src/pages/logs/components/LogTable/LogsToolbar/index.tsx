import { FC } from 'react';
import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiSelect, EuiText } from '@elastic/eui';
import { LogsToolbarProps } from './types';

export const LogsToolbar: FC<LogsToolbarProps> = ({
  indexPatterns,
  selectedIndex,
  totalCount,
  setSelectedIndex,
}) => {
  return (
    <EuiFlexGroup
      alignItems="center"
      justifyContent="spaceBetween"
      gutterSize="m"
      className="!mb-5"
    >
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent='center' alignItems='center'>
          <EuiFlexItem grow={false}>
            <EuiText>
              <p>Log index: </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSelect
              options={indexPatterns.map((idx) => ({
                value: idx.name,
                text: idx.name
              }))}
              value={selectedIndex}
              onChange={e => setSelectedIndex(e.target.value)}
              aria-label="Index pattern selector"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiText>
          <p>
            Total count of <strong>{selectedIndex}</strong> is : <EuiBadge>{totalCount}</EuiBadge>
          </p>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

