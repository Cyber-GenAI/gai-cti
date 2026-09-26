import { FC } from "react";
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { legendItems } from "./constants";

export const LegendBar: FC = () => (
  <EuiPanel paddingSize="m" hasBorder hasShadow={false} className="!mb-4">
    <EuiFlexGroup direction="column" gutterSize="m" responsive={false}>
      <EuiFlexItem grow={false} data-test-subj="legendText">
        <EuiText size="m">
          <p>
            <strong>Legend</strong> (count) will include all rules selected
          </p>
        </EuiText>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiFlexGroup
          alignItems="center"
          gutterSize="m"
          responsive={false}
          wrap
        >
          {legendItems.map((item) => (
            <EuiFlexItem
              key={item.label}
              grow={false}
              className="flex items-center"
            >
              <div
                className={`${item.className} rounded-full w-6 h-6 mr-2 !border !border-gray-300 dark:!border-gray-600`}
              />
              <EuiText size="s">{item.label}</EuiText>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiPanel>
);

