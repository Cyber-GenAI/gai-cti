import { memo, useCallback, useMemo, useState } from "react";
import {
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiModalHeaderTitle,
  EuiDescriptionList,
} from "@elastic/eui";
import { DynamicForm } from "../../../../../../components/Form";
import { managementRuleCreate } from "../../../../../../types/management";
import { useManagement } from "../../../../../../context/management/management-context";
import { renderCellType } from "../../../../../../utils/renderFormater";
import { Toastify } from "../../../../../../utils/toasts";

interface CreateRuleModalProps {
  onClose: () => void;
}

const CreateRuleModalComponent = ({ onClose }: CreateRuleModalProps) => {
  const { management_rule_preview, getManagementRulePreview, submitManagementRule } = useManagement();

  const [step, setStep] = useState<'configuration' | 'preview'>('configuration');
  const [rule, setRule] = useState<managementRuleCreate | undefined>()

  const handleFormSubmit = useCallback(async (data: managementRuleCreate) => {
    const status = await getManagementRulePreview(data)
    if (status) {
      setStep('preview');
      setRule(data)
    }
  }, [getManagementRulePreview])

  const handleConfirm = useCallback(async () => {
    if (!rule)
      return
    const status = await submitManagementRule(rule)
    if (status) {
      Toastify({ type: "success", message: "The Rule Injected successfully."})
      onClose();
    }
  }, [onClose, rule, submitManagementRule])

  const memoizedRulePreview = useMemo(() =>
    management_rule_preview?.data?.map((item) => ({
      title: item.key,
      description: renderCellType(item.type, item.value) as JSX.Element
    })) ?? [], [management_rule_preview]);

  const renderStepModalBody = useMemo(() => {
    switch (step) {
      case 'configuration':
        return (
          <DynamicForm
            isInitialOpen
            fields={[
              {
                key: 'type',
                tag: "rule",
                title: 'Injecting type',
                type: 'select',
                default: 'yaml',
                options: {
                  required: true,
                  items: ['yaml', 'json']
                }
              },
              {
                key: 'code',
                tag: "rule",
                title: 'Code',
                type: 'code',
                options: {
                  required: true,
                  syntax: 'yaml',
                  placeholder: ''
                }
              }
            ]}
            onSubmit={(data) =>
              handleFormSubmit(
                data["rule"].type as string === 'json' ?
                  { rule_ndjson: data["rule"]?.code as string ?? "", rule_yml: null } :
                  { rule_yml: data["rule"].code as string ?? "", rule_ndjson: null })}
          />
        )

      case "preview":
        return (
          <EuiDescriptionList
            type="column"
            align="left"
            columnWidths={["25%", "75%"]}
            rowGutterSize="m"
            listItems={memoizedRulePreview ?? []}
          />
        )
      default:
        return <></>
    }
  }, [step, memoizedRulePreview, handleFormSubmit])


  return (
    <EuiModal onClose={onClose} style={{ width: 600 }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle id="management-create-new-rule-modal">
          Create New Rule
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {renderStepModalBody}
      </EuiModalBody>

      <EuiModalFooter>
        {step === 'preview' && (
          <EuiButton onClick={() => setStep('configuration')} color="text">
            Back
          </EuiButton>
        )}
        {step === 'preview' && (
          <EuiButton fill onClick={handleConfirm}>
            Confirm & Create
          </EuiButton>
        )}
      </EuiModalFooter>
    </EuiModal>
  );
}

export const CreateRuleModal = memo(CreateRuleModalComponent)