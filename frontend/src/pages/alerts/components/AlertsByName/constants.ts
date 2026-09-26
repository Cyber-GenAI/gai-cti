import { EuiBasicTableColumn } from "@elastic/eui";
import { keyedBucket } from "../../../../types/third-party";

export const columns: Array<EuiBasicTableColumn<keyedBucket>> = [
  {
    field: "key",
    name: "Rule Name",
    width: "70%",
  },
  {
    field: "doc_count",
    name: "Count",
    align: "center",
    width: "15%",
  },
];
