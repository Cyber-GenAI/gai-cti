import { EuiFlexGrid, EuiFlexItem, EuiPanel } from '@elastic/eui'
import { memo, useEffect } from 'react'
import { LoadingPrompt } from '../../../../components'
import { useFeeds } from '../../../../context/feeds/feeds-context'
import { renderCardValue } from '../../../../utils/renderFormater'
import { FeedIocCounter } from './FeedIocCounter'

const FeedStatisticsComponent = () => {
  const { feedDashboard, feedDashboardIocCounterOverTime, getFeedDashboard, getFeedDashboardIocCounterOverTime } = useFeeds();

  useEffect(() => {
    getFeedDashboard();
  }, [getFeedDashboard]);

  return (
    <EuiFlexGrid columns={4}>
      <EuiFlexItem>
        {
          feedDashboard.isLoading ? <LoadingPrompt size="l" rows={2} /> :
            <EuiFlexGrid columns={1}>
              <EuiFlexItem>
                <EuiPanel>
                  {renderCardValue('MetricVisual', feedDashboard.data?.total.data.value ?? '', feedDashboard.data?.total.data.title ?? '', feedDashboard.data?.total.data.description)}
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel>
                  {renderCardValue('MetricVisual', feedDashboard.data?.active.data.value ?? '', feedDashboard.data?.active.data.title ?? '')}
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGrid>
        }
      </EuiFlexItem>
      <EuiFlexItem>
        {
          feedDashboard.isLoading ? <LoadingPrompt size="xl" /> :
            <EuiPanel>
              {renderCardValue('PieVisual', feedDashboard.data?.distribution.data.value ?? [], feedDashboard.data?.distribution.data.title ?? '', feedDashboard.data?.distribution.data.description)}
            </EuiPanel>
        }
      </EuiFlexItem>
      <EuiFlexItem className="!col-span-2">
        {
          feedDashboard.isLoading ? <LoadingPrompt size="xl" /> :
            <EuiPanel>
              {renderCardValue('BarVisual', feedDashboard.data?.iocCount.data.value ?? [], feedDashboard.data?.iocCount.data.title ?? '', feedDashboard.data?.iocCount.data.description)}
            </EuiPanel>
        }
      </EuiFlexItem>
      <EuiFlexItem className="!col-span-4">
        <FeedIocCounter
          data={feedDashboardIocCounterOverTime.data}
          getData={getFeedDashboardIocCounterOverTime}
          isLoading={feedDashboardIocCounterOverTime.isLoading}
        />
      </EuiFlexItem>
    </EuiFlexGrid>
  )
}

export const FeedStatistics = memo(FeedStatisticsComponent)