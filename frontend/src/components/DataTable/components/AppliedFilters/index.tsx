import {
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiContextMenuPanel,
  EuiDatePicker,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPopover,
  EuiSelect,
  EuiText,
} from "@elastic/eui";
import { memo, useCallback, useMemo, useState } from "react";
import { badge_colors } from "../../../../constants/colors";
import { formatOperator, formatOperatorToLabel } from "../../../../utils";
import { IFilterProps } from "./types";
import { selectedFilterProps } from "../FilterControls/types";
import moment from "moment";

const AppliedFilters = ({
  index,
  filter,
  deleteFilter,
  onSubmit,
  onFilterValueChange,
  onFilterOperatorChange,
}: IFilterProps) => {
  const [shownPopover, setShownPopover] = useState<boolean>(true);

  const renderInputField = useCallback((type: selectedFilterProps['filter']) => {
    switch (type) {
      case "EnumFilter":
      case "TagFilter":
        return (
          <EuiComboBox
            placeholder="Select tags"
            singleSelection={{ asPlainText: true }}
            options={
              filter.filter_options?.map((item) => ({
                label: item,
                value: item,
              })) ?? []
            }
            selectedOptions={(filter.value ?? []).map((val: string) => ({
              label: val,
              value: val,
            }))}
            onChange={(selected) => {
              onFilterValueChange(
                index,
                selected[0].value ?? ''
              );
            }}
          />
        );
      case "DateFilter":
        return (
          <EuiDatePicker
            endDate={moment()}
            value={filter.value?.length ? filter.value[0] : moment().toISOString()}
            maxDate={moment()}
            openToDate={filter.value?.length ? moment(filter.value[0] ?? '') : moment()}
            onSelect={(date) => {
              if (date) {
                const previousDate = moment(date).add(1, 'days').toISOString();
                onFilterValueChange(index, previousDate);
              }
            }}
          />
        );
      default:
        return <EuiFieldText
          placeholder="filtering value"
          value={filter.value}
          onChange={(e) => onFilterValueChange(index, e.target.value)}
        />
    }
  }, [filter.filter_options, filter.value, index, onFilterValueChange])

  const memoizedOperatorOptions = useMemo(
    () =>
      filter.filter_operators?.map((item) => {
        return {
          text: formatOperator(item).label,
          label: formatOperator(item).label,
          value: formatOperator(item).value,
        };
      }),
    [filter.filter_operators]
  );

  const handleOperatorSelectionClose = useCallback(() => {
    if (filter.value) {
      if (!filter.value.length) {
        deleteFilter(filter);
        return;
      }
    } else if (
      !(
        formatOperatorToLabel(filter.operator) === "nil" ||
        formatOperatorToLabel(filter.operator) === "not_nil"
      )
    ) {
      deleteFilter(filter);
    }
    setShownPopover(false);
  }, [setShownPopover, deleteFilter, filter]);

  const submitFilterChanges = useCallback(() => {
    onSubmit();
    setShownPopover(false);
  }, [onSubmit]);

  const memoizedIsNullable = useMemo(() => formatOperatorToLabel(filter.operator) == 'nil' || formatOperatorToLabel(filter.operator) == 'not_nil', [filter.operator])

  return (
    <EuiPopover
      id={"customContextMenuPopoverId"}
      hasArrow={false}
      isOpen={shownPopover}
      button={
        <EuiBadge
          iconOnClick={() => deleteFilter(filter)}
          iconOnClickAriaLabel="Remove filter"
          iconType="cross"
          color={shownPopover ? badge_colors[1] : "default"}
        >
          <div
            className="cursor-pointer p-2"
            onClick={() => setShownPopover(true)}
          >
            <EuiFlexGroup
              direction="row"
              justifyContent="center"
              alignItems="center"
              gutterSize="s"
            >
              <EuiFlexItem>
                <EuiText size="s">
                  <p>{filter.name}</p>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText size="s">
                  <p>{filter.operator}</p>
                </EuiText>
              </EuiFlexItem>
              {
                filter.value &&
                <EuiFlexItem>
                  <EuiText size="s">
                    <p>{filter.value}</p>
                  </EuiText>
                </EuiFlexItem>
              }
            </EuiFlexGroup>
          </div>
        </EuiBadge>
      }
      closePopover={() => handleOperatorSelectionClose()}
      panelPaddingSize="none"
      anchorPosition="downLeft"
    >
      <EuiContextMenuPanel>
        <EuiPanel color="transparent" paddingSize="s">
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem>
              <EuiSelect
                value={filter.operator}
                fullWidth
                options={memoizedOperatorOptions}
                hasNoInitialSelection={true}
                onChange={(option) =>
                  onFilterOperatorChange(index, option.target.value)
                }
              />
            </EuiFlexItem>
            {!memoizedIsNullable && (
              <EuiFlexItem>
                {renderInputField(filter.filter)}
              </EuiFlexItem>
            )}
            <EuiFlexItem>
              <EuiButton
                disabled={memoizedIsNullable ? false : !(filter.value && filter.operator)}
                fill
                onClick={submitFilterChanges}
              >
                submit
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiContextMenuPanel>
    </EuiPopover>
  );
};
export const Filter = memo(AppliedFilters);
