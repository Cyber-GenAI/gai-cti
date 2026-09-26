import { memo, ReactNode, useCallback, useEffect } from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiPanel, EuiTitle } from '@elastic/eui'
import { renderCellType } from '../../../../utils/renderFormater';
import { Toastify } from '../../../../utils/toasts';
import { useAdversaries } from '../../../../context/adversaries/adversaries-context';

interface AdversaryScheduleModalProps {
  isOpen: boolean
  handleCloseModal: () => void;
}

const AdversaryScheduleModalComponent = ({
  isOpen,
  handleCloseModal,
}: AdversaryScheduleModalProps) => {
  const { adversarySchedule, getAdversarySchedule, runAdversarySchedule } = useAdversaries();

  const handleFetchData = useCallback(async () => {
    await getAdversarySchedule()
  }, [getAdversarySchedule])

  useEffect(() => {
    if (isOpen) {
      handleFetchData()
    }
  }, [handleFetchData, isOpen]);

  const handleRunSchedule = useCallback(async () => {
    const status = await runAdversarySchedule();
    if (status) {
      handleCloseModal()
      Toastify({ type: 'success', message: 'The schedule has been processed successfully' });
    }
  }, [handleCloseModal, runAdversarySchedule])

  const currentState = adversarySchedule.data?.find(i => i.key === 'Current State')?.value;

  return (
    <EuiModal
      className="!w-[40vw]"
      aria-labelledby="management-create-new-rule-modal"
      onClose={handleCloseModal}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="management-create-new-rule-modal">
          Adversaries Schedule
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody className='!relative'>
        {
          adversarySchedule.isLoading ?
            <div className='w-full h-full flex justify-center items-center'>
              <EuiLoadingSpinner size={"xl"} />
            </div> :

            <EuiPanel color='subdued'>
              <EuiFlexGroup direction='column'>
                {
                  adversarySchedule.data?.map((bullet, index) => (
                    <EuiFlexItem key={index}>
                      <EuiFlexGroup gutterSize='s'>
                        {
                          bullet.type !== 'warn_sign' &&
                          <EuiFlexItem grow={false}>
                            <EuiTitle size='xxs'>
                              <h5>
                                {bullet.key}:
                              </h5>
                            </EuiTitle>
                          </EuiFlexItem>
                        }
                        <EuiFlexItem grow={false}>
                          {renderCellType(bullet.type, bullet.value) as ReactNode}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  ))
                }
              </EuiFlexGroup>
            </EuiPanel>
        }
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton disabled={currentState === 'Running' || adversarySchedule.isLoading} onClick={handleRunSchedule}>
          Run Schedule
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};

export const AdversaryScheduleModal = memo(AdversaryScheduleModalComponent)