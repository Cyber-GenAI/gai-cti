import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiSkeletonText, EuiText, EuiTitle } from '@elastic/eui'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAdversaries } from '../../../../context/adversaries/adversaries-context'
import { AdversaryToolbar } from './components/toolbar'
import { LoadingPrompt } from '../../../../components'
import { AdversaryTable } from './components/table'
import { useAssistant } from '../../../../context/assistant/assistant-context'

interface AdversaryProps {
  selectedAdversary: string
  onClickAdversariesDetail: (path: string) => void;
}

const AdversaryComponent = ({
  selectedAdversary,
  onClickAdversariesDetail
}: AdversaryProps) => {
  const [selectedSection, setSelectedSection] = useState<string>('')
  const { adversary, getAdversaryData } = useAdversaries();
  const { getAssistantExplain } = useAssistant();

  useEffect(() => {
    if (selectedAdversary.length) {
      getAdversaryData(selectedAdversary)
    }
  }, [getAdversaryData, selectedAdversary])

  useEffect(() => {
    if (adversary.data?.sections?.[0]) {
      setSelectedSection(adversary.data.sections[0].title)
    }
  }, [adversary?.data?.sections])

  const handleExplainAdversary = useCallback(() => {
    if (selectedAdversary)
      getAssistantExplain('adversary', selectedAdversary)
  }, [selectedAdversary, getAssistantExplain])

  const handleSelectSection = useCallback((id: string) => {
    setSelectedSection(id)
  }, [])

  const selectedSectionMemoized = useMemo(() => adversary.data?.sections.find((item) => item.title === selectedSection), [adversary.data?.sections, selectedSection])

  return (
    <EuiFlexGroup style={{ height: "100%" }} direction='column'>
      <EuiFlexItem>
        <EuiFlexGroup direction='column'>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent='spaceBetween' alignItems='center'>
              <EuiFlexItem>
                <EuiSkeletonText lines={1} isLoading={adversary.isLoading}>
                  <EuiTitle>
                    <h2>{adversary.data?.name}</h2>
                  </EuiTitle>
                </EuiSkeletonText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton disabled={adversary.isLoading} onClick={handleExplainAdversary} color="success" iconType="sparkles">
                  Explain
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSkeletonText lines={4} isLoading={adversary.isLoading}>
              <EuiText size='s'>{adversary.data?.description}</EuiText>
            </EuiSkeletonText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin='none' />
      <EuiFlexGroup className='eui-yScroll' direction='column'>
        <EuiFlexItem grow={false}>
          {
            adversary.isLoading || !selectedSection.length ?
              <LoadingPrompt size='l' columns={5} /> :
              <AdversaryToolbar
                confidence={adversary.data?.confidence ?? -1}
                sections={adversary.data?.sections ?? []}
                onSelectSection={handleSelectSection}
                selectedSection={selectedSection}
              />
          }
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {
            !selectedSectionMemoized ?
              <LoadingPrompt size='xl' /> :
              <AdversaryTable
                onClickAdversariesDetail={onClickAdversariesDetail}
                section={selectedSectionMemoized}
              />
          }
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexGroup>
  )
}

export const Adversary = memo(AdversaryComponent)