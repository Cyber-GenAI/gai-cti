import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle, EuiText, EuiHorizontalRule, EuiToolTip } from '@elastic/eui'
import { memo } from 'react'
import { renderCellType } from '../../../../utils/renderFormater'
import { homeStatistic } from '../../../../types/home'
import { LoadingPrompt } from '../../../../components'

interface IHomeStatisticsProps {
  statistics: homeStatistic[]
  isLoading: boolean
}

const homeStatisticsComponent = ({
  statistics,
  isLoading
}: IHomeStatisticsProps) => {

  return (
    <EuiFlexGroup
      direction="row"
      gutterSize="l"
      wrap={true}
      className="!w-full px-4"
    >
      {isLoading ? (
        <LoadingPrompt columns={4} size="l" />
      ) : (
        statistics?.map((item, index) => (
          <EuiFlexItem
            key={index}
            className="mb-4"
          >
            <EuiPanel>
              <EuiTitle size="s">
                <h2 className="text-center font-bold text-gray-800">{item.title}</h2>
              </EuiTitle>
              <EuiHorizontalRule margin="s" />
              <div className="space-y-3 flex flex-col gap-2">
                {item.information.map((info, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <EuiText size="xs" className="!font-bold">
                      {info.key}:
                    </EuiText>
                    <EuiToolTip content={info.value}>
                      <EuiText size="xs" className='!max-w-36 whitespace-nowrap text-ellipsis overflow-hidden'>
                        {renderCellType(info.type, info.value) as JSX.Element}
                      </EuiText>
                    </EuiToolTip>
                  </div>
                ))}
              </div>
            </EuiPanel>
          </EuiFlexItem>
        ))
      )}
    </EuiFlexGroup>
  )
}

export const HomeStatistics = memo(homeStatisticsComponent)