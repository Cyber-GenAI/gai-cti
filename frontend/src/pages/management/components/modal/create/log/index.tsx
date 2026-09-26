import { memo } from 'react'
import { EuiLoadingSpinner, EuiModal, EuiModalBody, EuiModalHeader, EuiModalHeaderTitle } from '@elastic/eui'
import { CreateManagementModalForm } from './content/CreateManagementModalForm';

interface ICreateManagementModalProps {
  handleCloseModal: () => void;
  handleSubmit: (data: { name: string; file: File }) => void;
  isLoading: boolean;
}

const createManagementLogModalComponent = ({
  handleCloseModal,
  handleSubmit,
  isLoading
}: ICreateManagementModalProps) => {
  return (
    <EuiModal
      className="!w-[40vw]"
      aria-labelledby="management-create-new-rule-modal"
      onClose={handleCloseModal}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="management-create-new-rule-modal">
          Insert new Log
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody className='!relative'>
        {
          isLoading &&
          <div className='w-full h-full absolute inset-0 z-10 bg-white/85 flex justify-center items-center'>
            <EuiLoadingSpinner size={"xl"} />
          </div>
        }
        <CreateManagementModalForm
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
        />
      </EuiModalBody>
    </EuiModal>
  )
}

export const CreateManagementLogModal = memo(createManagementLogModalComponent)