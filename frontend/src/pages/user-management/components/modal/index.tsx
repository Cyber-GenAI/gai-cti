import { memo, useCallback, useState } from 'react'
import { EuiButton, EuiFieldPassword, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiModal, EuiModalBody, EuiModalHeader, EuiModalHeaderTitle } from '@elastic/eui'
import { LoadingPrompt } from '../../../../components';
import { Toastify } from '../../../../utils/toasts';

interface ChangePasswordModalProps {
  handleCloseModal: () => void;
  handleSubmit: (newPassword: string, userName: string) => void;
  isLoading: boolean;
  userName: string
}

const ChangePasswordModalComponent = ({
  handleCloseModal,
  handleSubmit,
  isLoading,
  userName
}: ChangePasswordModalProps) => {
  const [password, setPassword] = useState<string>();

  const handleChangePassword = useCallback(() => {
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(password)) {
        Toastify({
          type: "error",
          message: "Invalid password. Must be at least 8 chars and include uppercase, lowercase, number, and special char."
        });
        return;
      }

      handleSubmit(password, userName)
    }
  }, [handleSubmit, password, userName])

  return (
    <EuiModal
      className="!w-[30vw]"
      aria-labelledby="management-create-new-rule-modal"
      onClose={handleCloseModal}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="management-create-new-rule-modal">
          Change User {userName} Password
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody className='!relative'>
        {
          isLoading ? <LoadingPrompt size='xl' /> :
            <EuiFlexGroup direction='column'>
              <EuiFormRow label="New Password">
                <EuiFieldPassword
                  fullWidth
                  placeholder='Enter your new Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </EuiFormRow>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiButton onClick={handleCloseModal}>Cancel</EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton fill disabled={!password?.length} onClick={handleChangePassword}>Submit</EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexGroup>
        }
      </EuiModalBody>
    </EuiModal>
  )
}

export const ChangePasswordModal = memo(ChangePasswordModalComponent)