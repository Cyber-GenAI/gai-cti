import { FC, useState, Fragment } from "react";
import {
  EuiTable,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableBody,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { LogDetailsFlyout, LogsPagination, LogsTableRow } from "../..";
import { Hit } from "../logsTableRow/types";
import { usePagination } from "../../../hooks/usePagination";

interface LogsTableProps {
  logs: Hit[];
  explainLog: (id: string) => void;
}

export const LogsTable: FC<LogsTableProps> = ({ logs, explainLog }) => {
  const [selectedHit, setSelectedHit] = useState<Hit | null>(null);
  const { paginatedItems, currentPage, setCurrentPage, pageCount } = usePagination(logs, 6);

  return (
    <Fragment>
      <EuiTable>
        <EuiTableHeader>
          <EuiTableHeaderCell width="10%">Actions</EuiTableHeaderCell>
          <EuiTableHeaderCell width="20%">Timestamp</EuiTableHeaderCell>
          <EuiTableHeaderCell width="70%">Source</EuiTableHeaderCell>
        </EuiTableHeader>

        <EuiTableBody>
          {paginatedItems.map((hit, index) => (
            <LogsTableRow
              key={hit._id || index}
              hit={hit}
              onViewDetails={() => setSelectedHit(hit)}
              onExplainLog={() => explainLog(hit._id ?? '')}
            />
          ))}
        </EuiTableBody>
      </EuiTable>

      <EuiSpacer size="m" />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <LogsPagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <LogDetailsFlyout
        selectedHit={JSON.stringify(selectedHit?._source, null, 2)}
        onClose={() => setSelectedHit(null)}
        onExplain={explainLog}
        id={selectedHit?._id ?? ''}
      />
    </Fragment>
  );
};