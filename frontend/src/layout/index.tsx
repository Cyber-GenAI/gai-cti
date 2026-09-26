import {
  EuiCollapsibleNav,
  EuiMarkdownFormat,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPageTemplate,
  EuiPageTemplateProps,
  EuiPanel,
} from "@elastic/eui";
import React, { ReactElement, memo, useCallback, useEffect, useState } from "react";
import Cookies from 'universal-cookie';
import { LoadingPrompt } from "../components";
import { LoadingSpinner } from "../components/LoadingPrompt/spinner";
import { useAssistant } from "../context/assistant/assistant-context";
import { SocketConnectionWrapper } from "../context/socketContext";
import { useUser } from "../context/user/user-context";
import { useFlyout } from "../hooks/useFlyout";
import { AssistantFlyout } from "../pages/assistant";
import { ChangePasswordModal } from "../pages/user-management/components/modal";
import { clearAuthCookie, clearEsTokenCookie } from "../utils/auth";
import { Toastify } from "../utils/toasts";
import { AboutFlyout, Header, Section, Sidebar } from "./component";
import { useInactivityTimeout } from "./hooks/useInactiveTimeout";

interface LayoutProps {
  panelled?: EuiPageTemplateProps["panelled"];
  offset?: EuiPageTemplateProps["offset"];
  grow?: EuiPageTemplateProps["grow"];
  children: ReactElement;
  centeredContent?: boolean;
  extendedBorder?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useUserManagement = (auth: any) => {
  const { getUserStatus, changeUserPassword } = useUser();
  const changePasswordModal = useFlyout(false);

  const handleUserStatus = async () => await getUserStatus();

  const handleChangePassword = async (password: string) => {
    const status = await changeUserPassword(password);
    if (status) {
      Toastify({
        type: "success",
        message: "User password was changed successfully.",
      });
      changePasswordModal.handleCloseFlyout();
    }
  };

  useEffect(() => {
    if (auth?.length) handleUserStatus();
  }, [auth]);

  return { changePasswordModal, handleChangePassword };
};

const Layout: React.FC<LayoutProps> = memo(
  ({
    offset,
    grow,
    children,
    centeredContent = true,
    extendedBorder = true,
  }) => {
    const aboutFlyout = useFlyout(false);
    const assistantFlyout = useFlyout(false);
    const { assistantExplain, closeExplain, isExplainVisible } = useAssistant();
    const { changePasswordModal, handleChangePassword } =
      useUserManagement(new Cookies().get('auth'));

    const [isNavOpen, setIsNavOpen] = useState(true);
    
    const handleLogout = useCallback(() => {
      clearAuthCookie();
      clearEsTokenCookie();
      window.location.href = "/#/auth";
      window.location.reload();
    }, [])

    useInactivityTimeout(handleLogout);

    return (
      <>
        <Header
          isNavOpen={isNavOpen}
          setNavOpen={() => setIsNavOpen(prev => !prev)}
          onAboutClick={aboutFlyout.handleOpenFlyout}
          onLogOutClick={handleLogout}
          onAssistantClick={assistantFlyout.handleOpenFlyout}
          onPasswordChangeClick={changePasswordModal.handleOpenFlyout}
        />

        <EuiPageTemplate
          offset={offset}
          grow={grow}
          restrictWidth={false}
          paddingSize="none"
        >
          <EuiCollapsibleNav
            onClose={() => setIsNavOpen(false)}
            size={200}
            isDocked={isNavOpen}
          >
              <Sidebar />
          </EuiCollapsibleNav>

          <Section centeredContent={centeredContent} extendedBorder={extendedBorder}>
            <SocketConnectionWrapper fallback={<LoadingSpinner size="xl" />}>
              {children}
              <AssistantFlyout
                isVisible={assistantFlyout.isFlyoutVisible}
                onClose={assistantFlyout.handleCloseFlyout}
              />
            </SocketConnectionWrapper>
          </Section>
        </EuiPageTemplate>

        <AboutFlyout
          isVisible={aboutFlyout.isFlyoutVisible}
          onClose={aboutFlyout.handleCloseFlyout}
        />

        {isExplainVisible && (
          <EuiModal className="!max-w-[80vw]" onClose={closeExplain}>
            {assistantExplain.isLoading ? (
              <LoadingPrompt size="xl" />
            ) : (
              assistantExplain.data?.map((explain, index) => (
                <div key={index}>
                  <EuiModalHeader>
                    <EuiModalHeaderTitle>{explain.title}</EuiModalHeaderTitle>
                  </EuiModalHeader>
                  <EuiModalBody>
                    <EuiPanel hasShadow={false} paddingSize="xl" className="!max-h-[65vh] eui-yScrollWithShadows !pb-20">
                      <EuiMarkdownFormat>{String(explain.value)}</EuiMarkdownFormat>
                    </EuiPanel>
                  </EuiModalBody>
                </div>
              ))
            )}
          </EuiModal>
        )}

        {changePasswordModal.isFlyoutVisible && (
          <ChangePasswordModal
            handleCloseModal={changePasswordModal.handleCloseFlyout}
            handleSubmit={handleChangePassword}
            isLoading={false}
            userName=""
          />
        )}
      </>
    );
  }
);

export default Layout;
