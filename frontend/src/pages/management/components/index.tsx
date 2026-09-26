import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiPopover,
} from "@elastic/eui";
import { memo, useState } from "react";
import { MANAGER_HEADER_DESCRIPTION, MANAGER_HEADER_TITLE } from "./constants";

interface ManagementHeaderProps {
  onNewRule: () => void;
  onNewLog: () => void;
  onManageLlm: () => void;
  onInjectedIocClick: () => void;
  moreActions: { label: string; onClick: () => void }[];
}

const ManagementHeaderComponent = ({
  onNewRule,
  onNewLog,
  onManageLlm,
  onInjectedIocClick,
  moreActions,
}: ManagementHeaderProps) => {
  const [isInsertOpen, setIsInsertOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const toggleInsert = () => setIsInsertOpen((prev) => !prev);
  const closeInsert = () => setIsInsertOpen(false);

  const toggleMore = () => setIsMoreOpen((prev) => !prev);
  const closeMore = () => setIsMoreOpen(false);

  return (
    <EuiPageHeader
      pageTitle={MANAGER_HEADER_TITLE}
      description={MANAGER_HEADER_DESCRIPTION}
      rightSideItems={[
        <EuiPopover
          key="insert"
          button={
            <EuiButton fill onClick={toggleInsert}>
              Insert New
            </EuiButton>
          }
          isOpen={isInsertOpen}
          closePopover={closeInsert}
          anchorPosition="downRight"
          panelPaddingSize="s"
        >
          <EuiFlexGroup
            direction="column"
            gutterSize="s"
            style={{ width: 180 }}
          >
            <EuiFlexItem>
              <EuiButton
                size="s"
                fullWidth
                onClick={() => {
                  closeInsert();
                  onNewRule();
                }}
              >
                New Rule
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton
                size="s"
                fullWidth
                onClick={() => {
                  closeInsert();
                  onNewLog();
                }}
              >
                New Log
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPopover>,
        <EuiButton onClick={onInjectedIocClick}>
            Show Injected IOC
        </EuiButton>,
        <EuiPopover
          key="more"
          button={<EuiButton onClick={toggleMore}>Bulk Actions</EuiButton>}
          isOpen={isMoreOpen}
          closePopover={closeMore}
          anchorPosition="downRight"
          panelPaddingSize="s"
        >
          <EuiFlexGroup
            direction="column"
            gutterSize="s"
            style={{ width: 180 }}
          >
            {moreActions.map(({ label, onClick }, idx) => (
              <EuiFlexItem key={idx}>
                <EuiButton
                  size="s"
                  fullWidth
                  color={"primary"}
                  onClick={() => {
                    closeMore();
                    onClick();
                  }}
                >
                  {label}
                </EuiButton>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        </EuiPopover>,
        <EuiButton onClick={onManageLlm}>
          Manage explain LLM
        </EuiButton>,
      ]}
    />
  );
};

export const ManagementHeader = memo(ManagementHeaderComponent);
