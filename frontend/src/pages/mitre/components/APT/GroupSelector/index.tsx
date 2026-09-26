import { FC } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSelect } from '@elastic/eui';
import { GroupSelectorProps } from './types';
export const GroupSelector: FC<GroupSelectorProps> = ({
  selectedGroup1,
  selectedGroup2,
  setSelectedGroup1,
  setSelectedGroup2,
  groupOptions,
}) => (
  <EuiFlexGroup gutterSize="m">
    <EuiFlexItem grow={false}>
      <EuiSelect
        options={[{ value: '', text: 'Select Group 1' }, ...groupOptions]}
        value={selectedGroup1}
        onChange={(e) => setSelectedGroup1(e.target.value)}
      />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiSelect
        options={[{ value: '', text: 'Select Group 2' }, ...groupOptions]}
        value={selectedGroup2}
        onChange={(e) => setSelectedGroup2(e.target.value)}
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);
