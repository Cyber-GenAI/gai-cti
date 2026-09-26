import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSelect,
  EuiSelectOption,
} from "@elastic/eui";
import { memo, useCallback, useMemo, useState } from "react";

import { Filter } from "../AppliedFilters";
import { IFiltersProps, selectedFilterProps } from "./types";
import { tableColumnFilters } from "../../../../types/table";
import { IPaginationProps } from "../Pagination/types";
import { Pagination } from "../Pagination";

const FiltersComponent = ({
  filters,
  onSelectFilter,
  pageCount,
  handleMoveNext,
  handleMovePrev,
  length,

}: IFiltersProps & IPaginationProps & { total: number, page_size: number, hasPagination: boolean }) => {
  const [selectedFilters, setSelectedFilters] = useState<selectedFilterProps[]>([]);

  const comboConvertedFilters: EuiSelectOption[] = useMemo(
    () =>
      filters.map((filter) => {
        return {
          label: filter.name,
          value: filter.name,
          text: filter.name,
        };
      }),
    [filters]
  );

  const filterSelection = useCallback(
    (value: string) => {
      const foundFilter = filters.find((item) => item.name === value);
      if (foundFilter) {
        setSelectedFilters((prev) => [
          ...prev,
          foundFilter as unknown as selectedFilterProps,
        ]);
      }
    },
    [filters, setSelectedFilters]
  );

  const filterSubmit = useCallback(
    (initialFilters?: selectedFilterProps[]) => {
      if (initialFilters) {
        onSelectFilter({
          filters: initialFilters.map((item) => {
            return {
              field: item.name,
              values: item.value,
              operator: item.operator,
              _type: item.filter as tableColumnFilters,
            };
          }),
          cursor: "",
        });
      } else {
        onSelectFilter({
          filters: selectedFilters.map((item) => {
            return {
              field: item.name,
              values: item.value,
              operator: item.operator,
              _type: item.filter as tableColumnFilters,
            };
          }),
          cursor: "",
        });
      }
    },
    [onSelectFilter, selectedFilters]
  );

  const filterDelete = useCallback(
    (filter: selectedFilterProps) => {
      setSelectedFilters((prev) => prev.filter((item) => item !== filter));
      filterSubmit(selectedFilters.filter((item) => item !== filter));
    },
    [filterSubmit, selectedFilters]
  );

  const onFilterValueChange = useCallback(
    (index: number, value: string) => {
      const tempFilters: selectedFilterProps[] = [...selectedFilters];
      tempFilters[index].value = [value];
      setSelectedFilters(tempFilters);
    },
    [selectedFilters]
  );

  const onFilterOperatorChange = useCallback(
    (index: number, value: string) => {
      const tempFilters: selectedFilterProps[] = [...selectedFilters];
      tempFilters[index].operator = value;
      setSelectedFilters(tempFilters);
    },
    [selectedFilters]
  );

  const filterClear = useCallback(() => {
    setSelectedFilters([]);
    onSelectFilter({
      filters: [],
      cursor: "",
    });
  }, [onSelectFilter]);

  return (
    <EuiFlexGroup
      direction="column"
      alignItems="stretch"
      justifyContent="center"
      gutterSize="s"
    >
      <EuiFlexItem grow>
        <EuiFlexGroup
          gutterSize="s"
          justifyContent="center"
          alignItems="center"
        >
          <EuiFlexItem grow={false}>
            <EuiIcon type="filterInclude" />
          </EuiFlexItem>
          <EuiFlexItem grow={9}>
            <EuiSelect
              options={comboConvertedFilters}
              hasNoInitialSelection={true}
              fullWidth
              aria-placeholder="placeholder"
              value={undefined}
              onChange={(e) => filterSelection(e.target.value)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButton disabled={!selectedFilters.length} onClick={filterClear}>
              Clear filters
            </EuiButton>
          </EuiFlexItem>
          <Pagination
              handleMoveNext={handleMoveNext}
              handleMovePrev={handleMovePrev}
              pageCount={pageCount}
              length={length}
            />
        </EuiFlexGroup>
      </EuiFlexItem>
      {!!selectedFilters.length && (
        <EuiFlexItem>
          <EuiFlexGroup
            wrap
            alignItems="flexStart"
            justifyContent="flexStart"
            gutterSize="m"
          >
            {selectedFilters.map((filter, index) => (
              <EuiFlexItem grow={false} key={index}>
                <Filter
                  index={index}
                  filter={filter}
                  deleteFilter={filterDelete}
                  onSubmit={filterSubmit}
                  onFilterValueChange={onFilterValueChange}
                  onFilterOperatorChange={onFilterOperatorChange}
                />
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

export const Filters = memo(FiltersComponent);
