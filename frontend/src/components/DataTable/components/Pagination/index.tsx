import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { memo } from "react";
import { IPaginationProps } from "./types";
import { formatNumber } from "../../../../utils";

const paginationComponent = ({
  pageCount,
  handleMoveNext,
  handleMovePrev,
  length,
}: IPaginationProps) => {
  const currentPage = length;
  const pageSize = 20;

  return (
      <EuiFlexGroup
        className="!w-15 h-full"
        justifyContent="flexEnd"
      >
        <EuiFlexItem className="!h-full" grow={false}>
          <EuiFlexGroup
            className="!border !border-gray-200 !h-full !dark:border-gray-700 !rounded-lg"
            gutterSize="s"
            alignItems="center"
          >
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                size="s"
                onClick={handleMovePrev}
                isDisabled={currentPage === 0}
                iconType="arrowLeft"
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <span>
                {
                  pageCount === 0 ?
                    <>
                      <strong>0-0</strong> / 0
                    </> :
                    <>
                      <strong>{(currentPage * pageSize) + 1}-{(currentPage * pageSize) + pageSize + 1}</strong> / {formatNumber(pageCount * pageSize)}
                    </>
                }
              </span>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                size="s"
                onClick={handleMoveNext}
                isDisabled={currentPage === pageCount}
                iconType="arrowRight"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
  );
};

export const Pagination = memo(paginationComponent);
