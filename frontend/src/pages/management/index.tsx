import { memo, useCallback, useEffect } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPagination, EuiPanel } from '@elastic/eui';
import { ManagementHeader } from './components';
import { Table } from '../../components/DataTable';
import { useFlyout } from '../../hooks/useFlyout';
import { CreateManagementLogModal } from './components/modal/create/log';
import { CreateRuleModal } from './components/modal/create/rule';
import { Toastify } from '../../utils/toasts';
import { compressFile } from '../../utils/compressFile';
import { IOCFlyout } from './components/flyout';
import { useSocket } from '../../context/socketContext';
import { useManagement } from '../../context/management/management-context';
import { AR_MANAGEMENT_CREATE_LOG } from '../../api/routes/management';
import { managementApiActions, managementTypes } from '../../types/management';
import Cookies from 'universal-cookie';
import { usePagination } from '../logs/hooks/usePagination';
import { page_size } from '../../constants/table';
import { useAssistant } from '../../context/assistant/assistant-context';
import { ManagementExplainLlmModal } from './components/modal/assistant/explain';

const Management = () => {
  const {
    management_table,
    getManagementTable,
    generalActions,
    deleteType
  } = useManagement();
  const { getExplainLlms, setExplainLlms } = useAssistant();

  const {
    currentPage,
    pageCount,
    paginatedItems,
    setCurrentPage
  } = usePagination(management_table.data?.rows ?? [], page_size);
  
  const { socket } = useSocket();
  const cookies = new Cookies();
  
  const injectedIOCFlyout = useFlyout(false);
  const injectRuleFlyout = useFlyout(false);
  const injectLogFlyout = useFlyout(false);

  const explainLlmFlyout = useFlyout(false);
    
  useEffect(() => {
    getExplainLlms();
  }, [getExplainLlms])

  useEffect(() => {
    getManagementTable();
  }, [getManagementTable]);

  const handleSetExplainLlm = useCallback(async (llm: string) => {
    const status = await setExplainLlms(llm)
    if (status) {
      Toastify({ type: 'success', message: `${llm} was selected as the Explain LLM successfully.` })
      explainLlmFlyout.handleCloseFlyout()
    }
  }, [explainLlmFlyout, setExplainLlms])

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        getManagementTable(parsedData);
      } catch (err) {
        console.error('Failed to parse table data:', err);
      }
    };

    socket.on('update_mng_main_table', handleUpdate);
    return () => {
      socket.off('update_mng_main_table', handleUpdate);
    };
  }, [getManagementTable, socket]);

  const handleTableAction = useCallback(async (id: string, type?: string) => {
    if (!type || type === 'flyout') return;
    const callType = management_table.data?.rows?.find((item) => item.id === id)?.type;
    const status = await generalActions({ id, action: type as managementApiActions, type: callType as managementTypes })
    if (status)
      Toastify({ type: 'success', message: ' Action started successfully.' })
  }, [generalActions, management_table.data?.rows]);

  const handleDeleteType = useCallback(async (type: managementTypes) => {
    const status = await deleteType(type)
    if (status)
      Toastify({ type: 'success', message: ' Selected type deleted successfully.' })
  }, [deleteType])

  const handleCloseCreateModal = useCallback(() => {
    if (!management_table.isLoading) {
      injectLogFlyout.handleCloseFlyout();
      injectRuleFlyout.handleCloseFlyout();
    }
  }, [injectLogFlyout, injectRuleFlyout, management_table.isLoading]);

  const handleSubmit = async ({ name, file }: { name: string; file: File }) => {
    const cookieAuth = cookies.get('auth');

    if (!file) {
      Toastify({ type: 'error', message: 'Please select a file first.' });
      return;
    }
    try {
      const compressedFile = await compressFile(file);

      const formData = new FormData();
      formData.append('uploaded_file', compressedFile);

      const res = await fetch(`${AR_MANAGEMENT_CREATE_LOG}?index_name_suffix=${name}`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Authorization': `Basic ${cookieAuth}`
        },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail ?? 'Something went wrong!');

      Toastify({ type: 'success', message: 'Your file has been successfully uploaded.' });
      injectLogFlyout.handleCloseFlyout();
    } catch (err) {
      Toastify({ type: 'error', message: String(err) });
    }
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <ManagementHeader
          onNewRule={injectRuleFlyout.handleOpenFlyout}
          onNewLog={injectLogFlyout.handleOpenFlyout}
          onManageLlm={explainLlmFlyout.handleOpenFlyout}
          onInjectedIocClick={injectedIOCFlyout.handleOpenFlyout}
          moreActions={[
            { label: "Clear All Rules", onClick: () => handleDeleteType('rule') },
            { label: "Clear All Logs", onClick: () => handleDeleteType('log') },
            { label: "Clear All Alerts", onClick: () => handleDeleteType('alert') },
          ]}
          />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel color="plain">
          <Table
            columns={management_table?.data?.columns ?? {}}
            rows={paginatedItems ?? []}
            isLoading={management_table.isLoading && management_table.data === null}
            onClick={handleTableAction}
            total={management_table?.data?.total ?? -1}
            last_row_cursor={management_table?.data?.last_row_cursor ?? ''}
            filterable={false}
            searchable
          />
          <EuiPagination
            pageCount={pageCount}
            activePage={currentPage}
            onPageClick={(pageIndex) => setCurrentPage(pageIndex)}
            aria-label="pagination"
            className="!w-full !justify-end !py-2"
          />
        </EuiPanel>
      </EuiFlexItem>

      {injectLogFlyout.isFlyoutVisible && (
        <CreateManagementLogModal
          handleCloseModal={handleCloseCreateModal}
          handleSubmit={handleSubmit}
          isLoading={management_table.isLoading}
        />
      )}
      {injectRuleFlyout.isFlyoutVisible && (
        <CreateRuleModal onClose={handleCloseCreateModal}/>
      )}

      {explainLlmFlyout.isFlyoutVisible && (
        <ManagementExplainLlmModal
          handleCloseModal={explainLlmFlyout.handleCloseFlyout}
          handleSubmit={handleSetExplainLlm}
        />
      )}

      <IOCFlyout
        isVisible={injectedIOCFlyout.isFlyoutVisible}
        onClose={injectedIOCFlyout.handleCloseFlyout}
      />
    </EuiFlexGroup>
  );
};

export default memo(Management);
