import { memo, useEffect } from "react";
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useUser } from "../../../../context/user/user-context";
import { LoadingPrompt } from "../../../../components";
import { DynamicForm } from "../../../../components/Form";
import { userCreate } from "../../../../types/user";

interface CreateUserProps {
  onClose: () => void,
  onSubmit: (data: userCreate) => void,
  isVisible: boolean,
}

const CreateUserComponent = ({
  onClose,
  onSubmit,
  isVisible,
}: CreateUserProps) => {
  const { userForm, getUserForm } = useUser();
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "CreateUser",
  });

  useEffect(() => {
    if (isVisible) {
      getUserForm()
    }
  }, [getUserForm, isVisible])

  let flyout;
  if (isVisible) {
    flyout = (
      <EuiFlyout
        ownFocus
        hideCloseButton
        onClose={onClose}
        aria-labelledby={simpleFlyoutTitleId}
      >
        <EuiFlyoutHeader>
          <EuiTitle size="m">
            <h2>User Creation</h2>
          </EuiTitle>
          <EuiHorizontalRule margin="s" />
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {
            userForm.isLoading ? <LoadingPrompt size="xl" /> :
              <DynamicForm
                fields={userForm?.data?.map((item) => ({...item, tag: "user"})) ?? []}
                submitText="Submit"
                columns={1}
                isInitialOpen
                onSubmit={(data) => onSubmit(data.user as userCreate)}
              />
          }
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return <>{flyout}</>;
};

export const CreateUser = memo(CreateUserComponent);
