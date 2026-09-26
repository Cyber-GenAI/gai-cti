import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPageSection, EuiPagination, EuiPanel, EuiSearchBar, EuiSpacer, EuiTab, EuiTabs } from '@elastic/eui';
import { EuiSearchBarOnChangeArgs } from '@elastic/eui/src/components/search_bar/search_bar';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useAssistant } from '../../context/assistant/assistant-context';
import { useRules } from '../../context/rules/rules-context';
import { useDidMountEffect } from '../../hooks/useDidMountEffect';
import { useFlyout } from '../../hooks/useFlyout';
import { useUrlState } from '../../hooks/useUrlState';
import { Toastify } from '../../utils/toasts';
import { RuleDetailFlyout, RulesTable } from './components';
import { RulesDashboard } from './components/RulesDashboard';
import { RulesHeader } from './components/RulesHeader';
import { usePagination } from './hooks/usePagination';

const Rules = () => {
  const { getAssistantExplain } = useAssistant();
  const { rule_pages, rules, getRules, getRulePages, getRulesDashboard, deleteRule, editRuleInterval, runRuleManually } = useRules();
  const { currentPage, totalPage, setPageConfig, handlePageChange } = usePagination();
  const { isFlyoutVisible, handleCloseFlyout, handleOpenFlyout } = useFlyout(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [selectedTab, setSelectedTab] = useUrlState('tab', '');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getRulePages(), getRules()]);
    };

    if (!rule_pages?.data?.length) {
      fetchData();
    }
  }, [rule_pages?.data?.length, getRulePages, getRules]);

  useDidMountEffect(() => {
    if (rules.data) {
      setPageConfig(rules.data.page, rules.data.perPage, rules.data.total);
    }
  }, [rules.data?.page, rules.data?.perPage, rules.data?.total, setPageConfig]);

  useEffect(() => {
    getRules();
  }, [getRules]);

  useDidMountEffect(() => {
    getRules({
      currentPage,
      filter: selectedTab,
      searchTerm,
    });
  }, [currentPage, searchTerm, selectedTab, getRules]);

  const handleRuleTableAction = useCallback(
    async (id: string, type?: string) => {
      if (type === 'flyout') {
        const selectedRuleId = rules.data?.data.find((item) => item.id === id)?.id as string ?? '';
        if (selectedRuleId) {
          setSelectedRuleId(selectedRuleId);
          handleOpenFlyout();
        }
      } else if (type === 'manual-run') {
        const status = await runRuleManually(id);
        if (status) {
          Toastify({ type: 'success', message: 'The selected rule ran successfully.' });
        }
      } else if (type === 'explain') {
        getAssistantExplain('rules', id);
      } else if (type === 'delete') {
        const status = await deleteRule(id);
        if (status) {
          Toastify({ type: 'success', message: 'The selected rule was deleted successfully.' });
          getRules({
            currentPage,
            filter: selectedTab,
            searchTerm,
          })
          getRulesDashboard()
        }
      }
    },
    [currentPage, deleteRule, getAssistantExplain, getRules, getRulesDashboard, handleOpenFlyout, rules.data?.data, runRuleManually, searchTerm, selectedTab]
  );

  const handleRulePageChange = useCallback(
    (tab: string) => {
      setSelectedTab(tab);
      handlePageChange(1);
    },
    [handlePageChange, setSelectedTab]
  );

  const handleSearchInput = useCallback(
    (event: EuiSearchBarOnChangeArgs) => {
      setSearchTerm(event.queryText);
      handlePageChange(1);
    },
    [handlePageChange]
  );

  const handleEditInterval = useCallback(async (id: string, interval: string) => {
    const status = await editRuleInterval(id, interval);
    if (status) {
      getRules();
      Toastify({
        type: "success",
        message: "Selected Rule interval has been updated."
      })
    }
    return status;
  }, [editRuleInterval, getRules])

  const renderTabs = useMemo(() => {
    return rule_pages?.data?.map((tab) => (
      <EuiTab
        key={tab.tag}
        onClick={() => handleRulePageChange(tab.tag)}
        isSelected={tab.tag === selectedTab}
      >
        {tab.name}
      </EuiTab>
    ));
  }, [handleRulePageChange, rule_pages?.data, selectedTab]);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <RulesHeader />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPageSection className="!h-full min-h-[80vh]" paddingSize="none">
          <RulesDashboard />
          <EuiSpacer />
          <EuiPanel>
            <EuiFlexGroup direction="column" gutterSize="l">
              <EuiFlexItem>
                <EuiTabs>{renderTabs}</EuiTabs>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup direction="column">
                  <EuiFlexItem>
                    <EuiSearchBar onChange={handleSearchInput} />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <RulesTable
                      data={rules.data?.data}
                      isLoading={rules.isLoading}
                      selectRule={handleRuleTableAction}
                    />
                    <EuiPagination
                      pageCount={totalPage}
                      activePage={currentPage - 1}
                      onPageClick={(pageIndex) => handlePageChange(pageIndex + 1)}
                      aria-label="pagination"
                      className="!w-full !justify-end !py-2"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
          {!!selectedRuleId?.length && (
            <RuleDetailFlyout
              id={selectedRuleId}
              onClose={handleCloseFlyout}
              isVisible={isFlyoutVisible}
              onEditInterval={handleEditInterval}
            />
          )}
        </EuiPageSection>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default memo(Rules);