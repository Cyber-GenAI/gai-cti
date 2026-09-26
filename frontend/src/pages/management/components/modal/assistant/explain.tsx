import {
  EuiButton,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSelect
} from '@elastic/eui'
import { memo, useEffect, useMemo, useState } from 'react'
import { LoadingPrompt } from '../../../../../components'
import { useAssistant } from '../../../../../context/assistant/assistant-context'

interface ICreateManagementModalProps {
  handleCloseModal: () => void
  handleSubmit: (data: string) => void
}

const ManagementExplainLlmModalComponent = ({
  handleCloseModal,
  handleSubmit,
}: ICreateManagementModalProps) => {
  const { availableLlms, explainLlm, getAvailableLlms } = useAssistant()

  const [selectedLlm, setSelectedLlm] = useState<string>(explainLlm.data ?? '')

  const isLoading = useMemo(() => availableLlms.isLoading || explainLlm.isLoading, [availableLlms.isLoading, explainLlm.isLoading])

  useEffect(() => {
    if (!availableLlms.data) {
      getAvailableLlms()
    }
  }, [availableLlms.data, getAvailableLlms])

  useEffect(() => {
    if (explainLlm.data) {
      setSelectedLlm(explainLlm.data)
    }
  }, [explainLlm])

  const availableLlmsOptions = useMemo(
    () =>
      availableLlms.data?.map((llm) => ({
        value: llm,
        text: llm,
      })) ?? [],
    [availableLlms.data]
  )

  const onSubmit = () => {
    if (!selectedLlm) return
    handleSubmit(selectedLlm)
  }

  return (
    <EuiModal
      className="!w-[40vw]"
      aria-labelledby="management-explain-llm-modal"
      onClose={handleCloseModal}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="management-explain-llm-modal">
          Select your Explain LLM
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody className="!relative">
        {isLoading ? (
          <LoadingPrompt size='s' />
        ) :
          <EuiForm component="form">
            <EuiFormRow label="Explain LLM">
              <EuiSelect
                options={availableLlmsOptions}
                value={selectedLlm}
                onChange={(e) => setSelectedLlm(e.target.value)}
                hasNoInitialSelection={!selectedLlm}
                disabled={isLoading}
              />
            </EuiFormRow>
          </EuiForm>
        }

      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton color="text" onClick={handleCloseModal}>
          Cancel
        </EuiButton>

        <EuiButton
          fill
          onClick={onSubmit}
          isDisabled={!selectedLlm || isLoading}
        >
          Apply change
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}

export const ManagementExplainLlmModal = memo(ManagementExplainLlmModalComponent)
