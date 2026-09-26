import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiMarkdownFormat, EuiPanel, EuiTitle } from '@elastic/eui'
import { memo } from 'react'
import { LoadingPrompt } from '../../../../../components'
import { alertAssistant } from '../../../../../types/alerts'
import { useFlyout } from '../../../../../hooks/useFlyout'

interface AlertDetailStatisticsProps {
  assistant: alertAssistant
  isLoading: boolean
}

const AlertDetailStatisticsComponent = ({
  assistant,
  isLoading
}: AlertDetailStatisticsProps) => {
  const { handleToggleFlyout, isFlyoutVisible } = useFlyout(false)

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiAccordion
          id="accordion-alert-assistant-summery"
          buttonElement="div"
          buttonContent={
            <EuiTitle>
              <h3>AI assistant</h3>
            </EuiTitle>}
          onToggle={handleToggleFlyout}
          initialIsOpen={isFlyoutVisible}
        >
          <EuiFlexItem>
            <EuiHorizontalRule margin="l" />
          </EuiFlexItem>
          <EuiFlexItem>
            {
              isLoading ? <LoadingPrompt size='xl' rows={3} /> :
                <EuiFlexGroup wrap>
                  {
                    assistant.map((item) => (
                      <EuiFlexItem grow={false}>
                        <EuiPanel color="subdued">
                          <EuiTitle size="xs">
                            <h2>{item.title}</h2>
                          </EuiTitle>
                          <EuiHorizontalRule margin="s" />
                          <EuiMarkdownFormat>
                            {item.value}
                          </EuiMarkdownFormat>
                        </EuiPanel>
                      </EuiFlexItem>
                    ))
                  }
                </EuiFlexGroup>
            }
          </EuiFlexItem>
        </EuiAccordion>
      </EuiFlexGroup>
    </EuiPanel>
  )
}

export const AlertDetailStatistics = memo(AlertDetailStatisticsComponent)