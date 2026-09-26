import React, { memo } from "react";
import { Table } from "../../../../components/DataTable";
import { column } from "./constants";
import { IAlertsTableProps } from "./types";
import { genericTable, genericTableRow } from "../../../../components";

const alertsTableComponent: React.FC<IAlertsTableProps> = ({
  data,
  isLoading,
  selectRow,
}) => {
  return (
    <Table
      columns={column as unknown as genericTable<unknown>["columns"]}
      rows={(data as unknown as genericTableRow<unknown>[]) ?? []}
      total={data?.length ?? 0}
      onClick={selectRow}
      isLoading={isLoading}
      filterable={false}
      hasPagination={false}
      last_row_cursor=""
    />
  );
};

export const AlertsTable = memo(alertsTableComponent);
