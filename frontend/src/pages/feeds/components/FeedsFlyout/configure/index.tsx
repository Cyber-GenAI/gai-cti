import {
  EuiFlexGroup,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiMarkdownFormat,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { DynamicForm } from "../../../../../components/Form";
import { useFlyout } from "../../../../../hooks/useFlyout";
import { GroupedFormData } from "../../../../../components/Form/types";
import { useFeeds } from "../../../../../context/feeds/feeds-context";
import { LoadingPrompt } from "../../../../../components";
import { Toastify } from "../../../../../utils/toasts";

export interface IFlyoutProps {
  isFlyoutVisible: boolean;
  handleCloseFlyout: () => void;
}

const ConfigurationFlyoutComponent = ({
  isFlyoutVisible,
  handleCloseFlyout,
}: IFlyoutProps) => {
  const {
    feedConfigurationFields,
    feedConfigurationConnectors,
    feedMarkdown,
    getFeedConfigurationFields,
    getFeedConfigurationConnectors,
    getFeedConfigurationHelp,
    submitFeedConfigurationFields
  } = useFeeds();
  const [step, setStep] = useState<'connectors' | 'configuration' | 'markdown'>('connectors')
  const markdownModule = useFlyout(false);

  useEffect(() => {
    if (!feedConfigurationConnectors?.data?.length)
      getFeedConfigurationConnectors()
  }, [feedConfigurationConnectors?.data?.length, getFeedConfigurationConnectors])

  const handleFormSubmit = useCallback(async (data: GroupedFormData) => {
    const status = await submitFeedConfigurationFields(data)
    if (status) {
      setStep("markdown")
      Toastify({ type: 'success', message: 'The changes in Feed Sources config applied successfully.' })
    }
  }, [submitFeedConfigurationFields]);

  const handleConnectorsSubmit = useCallback(async (data: GroupedFormData) => {
    const names = Object.keys(data.connectors).filter((item) => data.connectors[item] as boolean === true)
    await getFeedConfigurationFields(names)
    setStep('configuration')
  }, [getFeedConfigurationFields])

  const handleConfigurationHelp = useCallback(async (group: string) => {
    markdownModule.handleOpenFlyout()
    await getFeedConfigurationHelp(group)
  }, [getFeedConfigurationHelp, markdownModule])

  const renderSteps = useMemo(() => {
    switch (step) {
      case 'connectors':
        return (
          <EuiFlexGroup gutterSize="s" direction="column">
            <EuiText>
              This tool helps you generate a Docker Compose YAML configuration for managing OpenCTI external import connectors.

              First, select the connectors you want to activate — some are preselected and highly recommended.
              Next, customize the configuration settings for each chosen connector.

              Once completed, the tool will generate a Docker Compose YAML file that you can place in the configuration directory. Simply restart the system to apply the new settings.
            </EuiText>
            {
              feedConfigurationConnectors.isLoading ? <LoadingPrompt size="xl" /> :
                <DynamicForm
                  fields={feedConfigurationConnectors?.data?.map((connector) => ({
                    key: connector.key,
                    title: connector.title,
                    default: connector.default,
                    ...(connector.is_free ?
                      {
                        options: {
                          labels: ['Free', 'Free']
                        }
                      } :
                      {}
                    ),
                    type: 'check',
                    tag: 'connectors'
                  })) ?? []}
                  submitText="Next"
                  columns={3}
                  isInitialOpen
                  onSubmit={handleConnectorsSubmit}
                />
            }
          </EuiFlexGroup>
        )
      case 'configuration':
        return feedConfigurationFields.isLoading ? <LoadingPrompt size="xl" /> :
          <DynamicForm
            fields={feedConfigurationFields?.data ?? []}
            onSubmit={handleFormSubmit}
            onCancel={() => setStep('connectors')}
            cancelText="Back"
            columns={2}
            onHelp={handleConfigurationHelp}
          />
      case 'markdown':
        return feedMarkdown.isLoading ? <LoadingPrompt size="xl" /> :
          <EuiMarkdownFormat>
            {String(feedMarkdown?.data ?? '')}
          </EuiMarkdownFormat>

      default:
        return <></>
    }
  }, [feedConfigurationConnectors?.data, feedConfigurationConnectors.isLoading, feedConfigurationFields?.data, feedConfigurationFields.isLoading, feedMarkdown?.data, feedMarkdown.isLoading, handleConfigurationHelp, handleConnectorsSubmit, handleFormSubmit, step])


  if (!isFlyoutVisible) return null;

  return (
    <EuiFlyout
      size={800}
      ownFocus
      hideCloseButton
      onClose={() => {
        handleCloseFlyout()
        setStep('connectors')
      }}
    >
      <EuiFlyoutHeader>
        <EuiTitle size="m">
          <h2>Feed Source Configuration Tool</h2>
        </EuiTitle>
        <EuiHorizontalRule margin="xs" />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {renderSteps}
      </EuiFlyoutBody>
      {markdownModule.isFlyoutVisible && (
        <EuiModal className="!max-w-[80vw]" onClose={markdownModule.handleCloseFlyout}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              Configuration Help
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            {
              feedMarkdown.isLoading ? <LoadingPrompt size="xl" /> :
                <EuiMarkdownFormat>
                  {String(feedMarkdown.data)}
                </EuiMarkdownFormat>
            }
          </EuiModalBody>
        </EuiModal>
      )}
    </EuiFlyout>
  );
};

export const ConfigurationFlyout = memo(ConfigurationFlyoutComponent);
