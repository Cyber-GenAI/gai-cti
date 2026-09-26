import { genericTableColumn } from "../../../../../../components";

export const column: Record<string, genericTableColumn> = {
  id: {
    name: "ID",
    type: "hidden",
  },
  "_source.@timestamp": {
    name: "Timestamp",
    type: "date",
  },
  "_source": {
    name: "Source",
    type: "json",
  },
};
