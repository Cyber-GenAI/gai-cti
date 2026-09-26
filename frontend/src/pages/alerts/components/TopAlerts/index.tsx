import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiTitle,
  EuiSelectOption
} from "@elastic/eui";

import { TopAlertsField } from "./components";
import { keyedBucket } from "../../../../types/third-party";
import { badge_colors } from "../../../../constants/colors";

interface TopAlertsProps {
  selectedField: string
  buckets: keyedBucket[];
  sourceOptions: EuiSelectOption[];
  onChangeField: (field: string) => void;
}

export const TopAlerts = ({
  buckets,
  selectedField,
  sourceOptions,
  onChangeField
}: TopAlertsProps) => {
  const total = buckets.reduce(
    (sum: number, { doc_count }) => sum + doc_count,
    0
  );

  return (
    <EuiPanel hasBorder hasShadow={false}>
      <EuiFlexGroup direction="column" gutterSize="xs">
        <EuiFlexItem>
          <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
            <EuiFlexItem>
              <EuiTitle size="xs">
                <h3>Top Alerts</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSelect
                id="dataSourceSelect"
                options={sourceOptions}
                value={selectedField}
                onChange={(e) => {
                  const value = e.target.value;
                  if (typeof value === "string") {
                    onChangeField(value)
                  }
                }}
                compressed
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {
            !buckets.length ?
              <div className="w-full h-24 flex justify-center items-center">
                <p>
                  no item found
                </p>
              </div>
              :
              <EuiFlexGroup className="!max-h-64 eui-yScrollWithShadows" direction="column" gutterSize="s">
                {
                  buckets.map((item, index) =>
                    <TopAlertsField
                      title={item.key}
                      color={badge_colors[index % badge_colors.length]}
                      percentage={total > 0 ? (item.doc_count / total) * 100 : 0}
                      key={index}
                    />
                  )
                }
              </EuiFlexGroup>
          }
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};


