import { memo } from 'react'
import { adversarySection } from '../../../../../types/adversaries'
import { EuiEmptyPrompt, EuiFlexItem, EuiHorizontalRule, EuiIcon, EuiPanel, EuiText, EuiTitle, EuiToolTip } from '@elastic/eui';
import { renderCellType } from '../../../../../utils/renderFormater';
import { GoalChart } from '../../../../../components/Charts/GoalChart';

interface AdversaryToolbarProps {
  confidence: number;
  sections: adversarySection[];
  selectedSection: string;
  onSelectSection: (id: string) => void;
}

const AdversaryToolbarComponent = ({
  sections,
  confidence,
  selectedSection,
  onSelectSection,
}: AdversaryToolbarProps) => {
  return (
    <div style={{ gridTemplateColumns: `repeat(${sections.length + 1}, minmax(0, 1fr))` }} className='grid gap-x-4 gap-y-4 h-full items-stretch justify-stretch'>
      {
        sections.map((item, index) => (
          <EuiFlexItem
            key={index}
            onClick={() => onSelectSection(item.title)}
            className="!flex !items-start !justify-start !cursor-pointer"
          >
            <EuiPanel
              paddingSize="m"
              hasBorder={true}
              hasShadow={false}
              color={selectedSection === item.title ? 'primary' : 'plain'}
              className="!flex flex-col !w-full !items-start"
            >
              <EuiToolTip content={item.title}>
                <EuiTitle size="xs">
                  <h2 className="text-left flex items-start gap-4 font-bold text-gray-800">
                    {item.title}
                  </h2>
                </EuiTitle>
              </EuiToolTip>
              <EuiHorizontalRule margin="s" />
              <div className="space-y-3 flex flex-col w-full gap-2">
                {item.information.map((info, idx) => (
                  <div key={idx} className="flex w-full justify-between items-center">
                    <EuiText size="xs" className="!font-bold">
                      {info.key}:
                    </EuiText>
                    <EuiToolTip content={info.value}>
                      <EuiText size="xs" className='!max-w-32 whitespace-nowrap text-ellipsis overflow-hidden'>
                        {renderCellType(info.type, info.value) as JSX.Element}
                      </EuiText>
                    </EuiToolTip>
                  </div>
                ))}
              </div>
            </EuiPanel>
          </EuiFlexItem>
        ))
      }
      <EuiFlexItem
        className="mb-4"
      >
        <EuiPanel
          paddingSize="m"
          hasBorder={true}
          className="bg-white"
        >
          <div className="space-y-3 flex flex-col items-center justify-center gap-2">
            {
              confidence >= 0 ? 
                <GoalChart data={confidence} size={175} /> :
                <EuiEmptyPrompt
                  icon={<EuiIcon size='xxl' type="warning" />}
                  title={<EuiTitle><h2>N/A</h2></EuiTitle>}
                />
            }
          </div>
        </EuiPanel>
      </EuiFlexItem>
    </div>
  )
}

export const AdversaryToolbar = memo(AdversaryToolbarComponent)