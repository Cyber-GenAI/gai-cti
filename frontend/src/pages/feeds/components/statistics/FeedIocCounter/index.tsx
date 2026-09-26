import { EuiButton, EuiDatePicker, EuiDatePickerRange, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel } from '@elastic/eui'
import moment, { Moment } from 'moment'
import { memo, useCallback, useEffect, useState } from 'react'
import { LoadingPrompt } from '../../../../../components'
import { feedDashboardIocCounterOverTimeParams, feedIocCountOverTime } from '../../../../../types/feeds'
import { renderCardValue } from '../../../../../utils/renderFormater'

interface FeedIocCounterProps {
  isLoading: boolean
  data: feedIocCountOverTime | null
  getData: (params: feedDashboardIocCounterOverTimeParams) => void
}

const FeedIocCounterComponent = ({
  data,
  isLoading,
  getData
}: FeedIocCounterProps) => {
  const [startDate, setStartDate] = useState<Moment | null>(
    moment().subtract(30, "days")
  );
  const [endDate, setEndDate] = useState<Moment | null>(moment());

  useEffect(() => {
    applyDateRange();
  }, []);

  const applyDateRange = useCallback(() => {
    if (!startDate || !endDate) return;

    getData({
      from: startDate.format("YYYY-MM-DDTHH:mm:ss"),
      to: endDate.format("YYYY-MM-DDTHH:mm:ss"),
    });
  }, [startDate, endDate, getData]);


  return (
    <EuiPanel className="!w-full !h-[31.5rem] !col-span-4">
      <EuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="s"
        responsive={false}
      >
        <EuiFlexItem grow={false}>
          <strong>
            {data?.data?.title ?? ''}
          </strong>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
            <EuiFlexItem>
              <EuiDatePickerRange
                startDateControl={
                  <EuiDatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat={"YYYY/MM/DD"}
                    aria-label="Start date"
                    showTimeSelect={false}
                    maxDate={endDate ?? undefined}
                  />
                }
                endDateControl={
                  <EuiDatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat={"YYYY/MM/DD"}
                    aria-label="End date"
                    showTimeSelect={false}
                    minDate={startDate ?? undefined}
                  />
                }
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                fill
                onClick={applyDateRange}
                isDisabled={!startDate || !endDate}
              >
                Apply
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>


      <EuiHorizontalRule margin="s" />

      {isLoading ? (
        <LoadingPrompt size="xl" />
      ) : data !== null && (
        <div className='h-[24rem]'>
          {renderCardValue(
              "HeatmapVisual",
              data?.data?.value ?? [],
              "",
              data?.data?.description,
              undefined,
              true
            )}
        </div>
      )}
    </EuiPanel>
  )
}

export const FeedIocCounter = memo(FeedIocCounterComponent)