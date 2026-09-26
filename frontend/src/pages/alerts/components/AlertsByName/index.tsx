import {
  EuiPanel,
  EuiTitle,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { columns } from "./constants";
import { keyedBucket } from "../../../../types/third-party";

interface IAlertsByNameTableProps {
  buckets: keyedBucket[]
}

export const AlertsByNameTable = ({ buckets }: IAlertsByNameTableProps) => {

  return (
    <EuiPanel hasBorder hasShadow={false}>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 className="text-base font-semibold">Alerts by Name</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem className="!max-h-64 eui-yScrollWithShadows">
          <EuiBasicTable items={buckets} columns={columns} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

