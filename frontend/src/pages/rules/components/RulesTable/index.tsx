import React, { memo, useMemo } from "react";
import { Table } from "../../../../components/DataTable";
import { RulesDisplay } from "./constants";
import { genericTable, genericTableRow } from "../../../../components";
import { rule } from "../../../../types/rules";

export interface IRulesTableProps {
  data?: rule[];
  isLoading: boolean;
  selectRule: (id: string, type?: string) => void;
}


const RulesTableComponent: React.FC<IRulesTableProps> = ({
  data,
  isLoading,
  selectRule,
}) => {
  const rows = useMemo(
    () =>
      data?.map((item) => {
        return {
          ...item,
          actions: ["manual-run", "explain", "delete"],
        };
      }),
    [data]
  );
  return (
    <Table
      columns={RulesDisplay as unknown as genericTable<unknown>["columns"]}
      rows={(rows as unknown as genericTableRow<unknown>[]) ?? []}
      total={data?.length ?? 0}
      onClick={selectRule}
      isLoading={isLoading}
      filterable={false}
      last_row_cursor=""
    />
  );
};

export const RulesTable = memo(RulesTableComponent);
