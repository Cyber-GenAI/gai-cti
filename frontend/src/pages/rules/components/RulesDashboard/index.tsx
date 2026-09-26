import { EuiAccordion, EuiFlexGrid, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import { useRules } from '../../../../context/rules/rules-context';
import { useFlyout } from '../../../../hooks/useFlyout';
import { LoadingPrompt } from '../../../../components';
import { renderCardValue } from '../../../../utils/renderFormater';
import { memo, useEffect } from 'react';

const RulesDashboardComponent = () => {
  const { rulesDashboard, getRulesDashboard } = useRules();
  const { isFlyoutVisible, handleToggleFlyout } = useFlyout(false);

  useEffect(() => {
    if (!rulesDashboard.data) {
      getRulesDashboard()
    }
  }, [getRulesDashboard, rulesDashboard.data])

  return (
    <>
      {rulesDashboard.isLoading ? (
        <LoadingPrompt size="l" columns={4} />
      ) : (
        <EuiFlexGrid columns={4}>
          <EuiFlexItem>
            {rulesDashboard.data?.['total-count'] && (
              <EuiPanel>
                {renderCardValue(
                  rulesDashboard.data?.['total-count'].type,
                  rulesDashboard.data?.['total-count'].data.value,
                  rulesDashboard.data?.['total-count'].data.title,
                  rulesDashboard.data?.['total-count'].data.description
                )}
              </EuiPanel>
            )}
          </EuiFlexItem>
          <EuiFlexItem>
            {rulesDashboard.data?.['sigma-count'] && (
              <EuiPanel>
                {renderCardValue(
                  rulesDashboard.data?.['sigma-count'].type,
                  rulesDashboard.data?.['sigma-count'].data.value,
                  rulesDashboard.data?.['sigma-count'].data.title,
                  rulesDashboard.data?.['sigma-count'].data.description
                )}
              </EuiPanel>
            )}
          </EuiFlexItem>
          <EuiFlexItem>
            {rulesDashboard.data?.['ioc-count'] && (
              <EuiPanel>
                {renderCardValue(
                  rulesDashboard.data?.['ioc-count'].type,
                  rulesDashboard.data?.['ioc-count'].data.value,
                  rulesDashboard.data?.['ioc-count'].data.title,
                  rulesDashboard.data?.['ioc-count'].data.description
                )}
              </EuiPanel>
            )}
          </EuiFlexItem>
          <EuiFlexItem>
            {rulesDashboard.data?.['custom-count'] && (
              <EuiPanel>
                {renderCardValue(
                  rulesDashboard.data?.['custom-count'].type,
                  rulesDashboard.data?.['custom-count'].data.value,
                  rulesDashboard.data?.['custom-count'].data.title,
                  rulesDashboard.data?.['custom-count'].data.description
                )}
              </EuiPanel>
            )}
          </EuiFlexItem>
        </EuiFlexGrid>
      )}
      <EuiSpacer />
      <EuiPanel>
        <EuiAccordion
          id="rules-advanced-dashboard"
          buttonElement="div"
          buttonContent={
            <EuiTitle>
              <h3>Advanced Dashboard</h3>
            </EuiTitle>
          }
          onToggle={handleToggleFlyout}
          initialIsOpen={isFlyoutVisible}
        >
          <EuiSpacer />
          {rulesDashboard.isLoading ? (
            <LoadingPrompt columns={2} size="xl" />
          ) : (
            <EuiFlexGrid columns={4}>
              <EuiFlexItem className="!col-span-1">
                {rulesDashboard.data?.severity && (
                  <EuiPanel hasBorder hasShadow={false}>
                    {renderCardValue(
                      rulesDashboard.data?.severity.type,
                      rulesDashboard.data?.severity.data.value,
                      rulesDashboard.data?.severity.data.title,
                      rulesDashboard.data?.severity.data.description
                    )}
                  </EuiPanel>
                )}
              </EuiFlexItem>
              <EuiFlexItem className="!col-span-3">
                {rulesDashboard.data?.['risk-distribution'] && (
                  <EuiPanel hasBorder hasShadow={false}>
                    {renderCardValue(
                      rulesDashboard.data?.['risk-distribution'].type,
                      rulesDashboard.data?.['risk-distribution'].data.value,
                      rulesDashboard.data?.['risk-distribution'].data.title,
                      rulesDashboard.data?.['risk-distribution'].data.description
                    )}
                  </EuiPanel>
                )}
              </EuiFlexItem>
              <EuiFlexItem className="!col-span-4">
                {rulesDashboard.data?.['tags-treemap'] && (
                  <EuiPanel hasBorder hasShadow={false}>
                    {renderCardValue(
                      rulesDashboard.data?.['tags-treemap'].type,
                      rulesDashboard.data?.['tags-treemap'].data.value,
                      rulesDashboard.data?.['tags-treemap'].data.title,
                      rulesDashboard.data?.['tags-treemap'].data.title
                    )}
                  </EuiPanel>
                )}
              </EuiFlexItem>
            </EuiFlexGrid>
          )}
        </EuiAccordion>
      </EuiPanel>
    </>
  );
};

export const RulesDashboard = memo(RulesDashboardComponent);