import { FC } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiBadge, useEuiTheme } from "@elastic/eui";
import { APTColorStyles } from "../../../pages/constants/colorClasses";

export const LegendBar: FC = () => {
  const { group1, group2, bothGroup, unselected } = APTColorStyles;
  const { colorMode } = useEuiTheme();

  return (
    <EuiFlexGroup gutterSize="s" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiBadge style={group1[colorMode === 'LIGHT' ? 'light' : 'dark']}>selected APT</EuiBadge>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiBadge style={group2[colorMode === 'LIGHT' ? 'light' : 'dark']}>Organization</EuiBadge>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiBadge style={bothGroup[colorMode === 'LIGHT' ? 'light' : 'dark']}>Overlaps</EuiBadge>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiBadge style={unselected[colorMode === 'LIGHT' ? 'light' : 'dark']}>Unselected</EuiBadge>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
