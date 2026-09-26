import {
  EuiButton,
  EuiPageHeader,
} from "@elastic/eui";
import { memo } from "react";

interface ManagementHeaderProps {
  onClickCreate: () => void;
}

const ManagementHeaderComponent = ({
  onClickCreate
}: ManagementHeaderProps) => {

  return (
    <EuiPageHeader
      pageTitle={"User Management"}
      description={"The User Management Page is a centralized interface for administrators to manage user accounts. It allows for adding, editing, and removing users, as well as assigning roles and permissions. With features like activity monitoring and security settings, this page ensures efficient user governance and data security."}
      rightSideItems={[
        <EuiButton fill onClick={onClickCreate}>
          Create New
        </EuiButton>
      ]}
    />
  );
};

export const ManagementHeader = memo(ManagementHeaderComponent);
