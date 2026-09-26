import { EuiAccordion, EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle } from '@elastic/eui'
import { memo, useEffect } from 'react'
import { useFlyout } from '../../../../hooks/useFlyout'
import { useAdversaries } from '../../../../context/adversaries/adversaries-context'
import { renderCardValue } from '../../../../utils/renderFormater'
import { LoadingPrompt } from '../../../../components'

const AdversariesDashboardComponent = () => {
  const { handleToggleFlyout, isFlyoutVisible } = useFlyout(false)
  const { adversariesDashboard, getAdversariesDashboard } = useAdversaries();

  useEffect(() => {
    getAdversariesDashboard();
  }, [getAdversariesDashboard])

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiAccordion
          id="accordion-adversaries-dashboard"
          buttonElement="div"
          buttonContent={
            <EuiTitle>
              <h3>Advanced Dashboard</h3>
            </EuiTitle>}
          onToggle={handleToggleFlyout}
          initialIsOpen={isFlyoutVisible}
        >
          <EuiFlexItem>
            <EuiHorizontalRule margin="l" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={4}>
              <EuiFlexItem className='!col-span-2'>
                <EuiFlexGrid columns={2}>
                  {
                    adversariesDashboard.isLoading ?
                      <LoadingPrompt columns={2} size='m' /> :
                      <>
                        <EuiFlexItem>
                          {
                            adversariesDashboard.data?.['tracked-sig'] &&
                            <EuiPanel hasBorder hasShadow={false}>
                              {renderCardValue(adversariesDashboard.data?.['tracked-sig'].type, adversariesDashboard.data?.['tracked-sig'].data.value, adversariesDashboard.data?.['tracked-sig'].data.title, adversariesDashboard.data?.['tracked-sig'].data.description)}
                            </EuiPanel>
                          }
                        </EuiFlexItem>
                        <EuiFlexItem>
                          {
                            adversariesDashboard.data?.['tracked-ioc'] &&
                            <EuiPanel hasBorder hasShadow={false}>
                              {renderCardValue(adversariesDashboard.data?.['tracked-ioc'].type, adversariesDashboard.data?.['tracked-ioc'].data.value, adversariesDashboard.data?.['tracked-ioc'].data.title, adversariesDashboard.data?.['tracked-ioc'].data.description)}
                            </EuiPanel>
                          }
                        </EuiFlexItem>
                      </>
                  }
                  {
                    adversariesDashboard.isLoading ?
                      <LoadingPrompt rows={2} size='xl' /> :
                      <>
                        <EuiFlexItem className='!col-span-2'>
                          <EuiPanel className='!h-[35rem]' hasBorder hasShadow={false}>
                            {
                              renderCardValue('ChordVisual', [], 'Similar Adversaries')
                            }
                          </EuiPanel>
                        </EuiFlexItem>
                        <EuiFlexItem className='!col-span-2'>
                          <EuiPanel hasBorder hasShadow={false}>
                            {
                              adversariesDashboard.data?.['rule-per-adv'] &&
                              renderCardValue(adversariesDashboard.data?.['rule-per-adv'].type, adversariesDashboard.data?.['rule-per-adv'].data.value, adversariesDashboard.data?.['rule-per-adv'].data.title, adversariesDashboard.data?.['rule-per-adv'].data.description)
                            }
                          </EuiPanel>
                        </EuiFlexItem>
                      </>
                  }
                </EuiFlexGrid>
              </EuiFlexItem>
              <EuiFlexItem className='!col-span-2'>
                <EuiFlexGrid className='!h-full' columns={1}>
                  {
                    adversariesDashboard.isLoading ?
                      <LoadingPrompt rows={2} size='xl' /> :
                      <>
                        <EuiFlexItem>
                          <EuiPanel hasBorder hasShadow={false}>
                            {
                              adversariesDashboard.data?.specificity &&
                              renderCardValue(adversariesDashboard.data?.specificity.type, adversariesDashboard.data?.specificity.data.value, adversariesDashboard.data?.specificity.data.title, adversariesDashboard.data?.specificity.data.description)
                            }
                          </EuiPanel>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiPanel hasBorder hasShadow={false}>
                            {
                              adversariesDashboard.data?.['ioc-per-adv'] &&
                              renderCardValue(adversariesDashboard.data?.['ioc-per-adv'].type, adversariesDashboard.data?.['ioc-per-adv'].data.value, adversariesDashboard.data?.['ioc-per-adv'].data.title, adversariesDashboard.data?.['ioc-per-adv'].data.description)
                            }
                          </EuiPanel>
                        </EuiFlexItem>
                      </>
                  }
                </EuiFlexGrid>
              </EuiFlexItem>
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiAccordion>
      </EuiFlexGroup>
    </EuiPanel>
  )
}

export const AdversariesDashboard = memo(AdversariesDashboardComponent)