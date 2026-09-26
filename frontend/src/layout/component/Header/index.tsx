import React, { memo, useCallback, useEffect } from "react";
import {
  EuiAvatar,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeader,
  EuiHeaderLinks,
  EuiHeaderSectionItem,
  EuiHorizontalRule,
  EuiImage,
  EuiPanel,
  EuiPopover,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { IHeaderComponentProps } from "./types";
import { PopConfirm } from "../../../components/PopConfirm";
import { useFlyout } from "../../../hooks/useFlyout";
import { useUser } from "../../../context/user/user-context";

const HeaderComponent: React.FC<IHeaderComponentProps> = ({
  isNavOpen,
  setNavOpen,
  onAboutClick,
  onLogOutClick,
  onAssistantClick,
  onPasswordChangeClick
}) => {
  const { isFlyoutVisible, handleCloseFlyout, handleOpenFlyout } = useFlyout(false);
  const { isAdmin, user, getUser } = useUser();

  useEffect(() => {
    getUser();
  }, [getUser])

  const handleLogOut = useCallback(() => {
    onLogOutClick();
    handleCloseFlyout();
  }, [handleCloseFlyout, onLogOutClick])

  const handleChangePassword = useCallback(() => {
    onPasswordChangeClick();
    handleCloseFlyout();
  }, [handleCloseFlyout, onPasswordChangeClick])

  const items = [
    ...(
      !isAdmin.data ? [
        <EuiContextMenuItem key="edit">
          <EuiButtonEmpty size="xs" onClick={handleChangePassword} iconType="pencil" color="primary">
            Change Password
          </EuiButtonEmpty>
        </EuiContextMenuItem>
      ] : []
    ),
    <EuiContextMenuItem className="!w-full" key="exit">
      <PopConfirm
        onConfirm={handleLogOut}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to log in again to access your account."
        type="danger"
        trigger={
          <EuiButtonEmpty size="xs" className="!w-full" iconType="exit" color="danger">
            Log Out
          </EuiButtonEmpty>
        }
      />
    </EuiContextMenuItem>,
  ];

  return (
    <EuiHeader position="fixed">
      <EuiHeaderSectionItem>
        <EuiFlexGroup gutterSize="m" alignItems="center" direction="row">
          <EuiFlexItem grow={false}>
            <div className="hidden lg:block">
              <EuiButtonIcon
                iconType={isNavOpen ? "menuLeft" : "menuRight"}
                aria-label="Toggle navigation"
                color="text"
                onClick={setNavOpen}
              />
            </div>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiImage
              size={100}
              alt="logo"
              src="http://www.itrc.ac.ir/themes/irandrupalsignal/images/itrc-logo-footer.png"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={4}>
            <EuiTitle>
              <EuiText>
                <h2>GAI-CTI</h2>
              </EuiText>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiHeaderSectionItem>

      <EuiHeaderSectionItem>
        <EuiHeaderLinks>
          <EuiButtonEmpty color="success" onClick={onAssistantClick} iconType="sparkles">
            AI Assistant
          </EuiButtonEmpty>
          <EuiButtonEmpty onClick={onAboutClick} iconType="help">
            About
          </EuiButtonEmpty>
          <div className="h-3/4 w-0.5 bg-gray-300 dark:bg-gray-700" />
          <EuiPopover
            button={<EuiButtonIcon className="!mr-2" onClick={handleOpenFlyout} display="base" iconType="user" />}
            isOpen={isFlyoutVisible}
            closePopover={handleCloseFlyout}
            panelPaddingSize="none"
            anchorPosition="upCenter"
          >
            <EuiPanel className="!w-52" hasShadow={false}>
              <EuiFlexGroup gutterSize="s" direction="column">
                <EuiFlexItem>
                  <EuiFlexGroup gutterSize="s" justifyContent="flexStart" alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiAvatar name={user.data?.username ?? ''} />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="xxxs">
                        <h4>
                          {user.data?.username}
                        </h4>
                      </EuiTitle>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="xs">
                    {
                      isAdmin.data ? 'You are logged in as Administrator' : `${user.data?.fname} ${user.data?.lname}`
                    }
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiHorizontalRule margin="none" />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
            <EuiContextMenuPanel size="s" items={items} />
          </EuiPopover>
        </EuiHeaderLinks>
      </EuiHeaderSectionItem>
    </EuiHeader>
  );
};

export const Header = memo(HeaderComponent);
