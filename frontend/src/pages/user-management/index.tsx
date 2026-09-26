import { memo, useCallback, useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPagination, EuiPanel } from '@elastic/eui';
import { ManagementHeader } from './components';
import { Table } from '../../components/DataTable';
import { useUser } from '../../context/user/user-context';
import { useFlyout } from '../../hooks/useFlyout';
import { CreateUser } from './components/flyout';
import { userCreate } from '../../types/user';
import { Toastify } from '../../utils/toasts';
import { ChangePasswordModal } from './components/modal';
import { usePagination } from '../logs/hooks/usePagination';
import { page_size } from '../../constants/table';

const UserManagement = () => {
  const [selectedUserName, setSelectedUserName] = useState<string>()

  const { users, getUsers, createUser, deleteUser, changeUserPassword } = useUser();
  const { currentPage, pageCount, paginatedItems, setCurrentPage } = usePagination(users.data?.rows ?? [], page_size);

  const { isFlyoutVisible, handleOpenFlyout, handleCloseFlyout } = useFlyout(false);
  const changePasswordModal = useFlyout(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

const handleCreateUser = useCallback(async (user: userCreate) => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
  const nameRegex = /^[a-zA-Z]{2,30}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!usernameRegex.test(user.username)) {
    Toastify({
      type: "error",
      message: "Invalid username. Must start with a letter and be 3–20 characters (letters, numbers, _ or -)."
    });
    return;
  }

  if (!nameRegex.test(user.fname)) {
    Toastify({
      type: "error",
      message: "Invalid first name. Only letters allowed, 2–30 characters."
    });
    return;
  }

  if (!nameRegex.test(user.lname)) {
    Toastify({
      type: "error",
      message: "Invalid last name. Only letters allowed, 2–30 characters."
    });
    return;
  }

  if (!passwordRegex.test(user.password)) {
    Toastify({
      type: "error",
      message: "Invalid password. Must be at least 8 chars and include uppercase, lowercase, number, and special char."
    });
    return;
  }

  const status = await createUser(user);

  if (status) {
    Toastify({
      type: "success",
      message: `User ${user.username} was created successfully.`
    });
    getUsers();
    handleCloseFlyout();
  }
}, [createUser, getUsers, handleCloseFlyout]);

  const handleDeleteUser = useCallback(async (userName: string) => {
    const status = await deleteUser(userName);

    if (status) {
      Toastify({
        type: "success",
        message: `User ${userName} was Deleted successfully.`
      })
      getUsers();
    }
  }, [deleteUser, getUsers])

  const handleChangePasswordUser = useCallback(async (password: string, userName: string) => {
    const status = await changeUserPassword(password, userName);

    if (status) {
      Toastify({
        type: "success",
        message: `User ${userName} password was Changed successfully.`
      })
      changePasswordModal.handleCloseFlyout()
    }
  }, [changePasswordModal, changeUserPassword])

  const handleTableAction = useCallback(async (id: string, type?: string) => {
    if (!type || type === 'flyout') return;
    if (type.toLowerCase() === "delete")
      handleDeleteUser(id)
    else if (type.toLowerCase() === "change password") {
      changePasswordModal.handleOpenFlyout()
      setSelectedUserName(id)
    }
  }, [changePasswordModal, handleDeleteUser]);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <ManagementHeader onClickCreate={handleOpenFlyout} />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel color="plain">
          <Table
            columns={users?.data?.columns ?? {}}
            rows={paginatedItems ?? []}
            isLoading={users.isLoading}
            onClick={handleTableAction}
            total={users?.data?.total ?? -1}
            last_row_cursor={users?.data?.last_row_cursor ?? ''}
            filterable={users?.data?.filterable ?? false}
            uniqueKey='username'
            searchable
          />
          <EuiPagination
            pageCount={pageCount}
            activePage={currentPage}
            onPageClick={(pageIndex) => setCurrentPage(pageIndex)}
            aria-label="pagination"
            className="!w-full !justify-end !py-2"
          />
        </EuiPanel>
      </EuiFlexItem>

      <CreateUser
        isVisible={isFlyoutVisible}
        onClose={handleCloseFlyout}
        onSubmit={handleCreateUser}
      />

      {changePasswordModal.isFlyoutVisible && (
        <ChangePasswordModal
          handleCloseModal={changePasswordModal.handleCloseFlyout}
          handleSubmit={handleChangePasswordUser}
          isLoading={false}
          userName={selectedUserName ?? ''}
        />)
      }
    </EuiFlexGroup>
  );
};

export default memo(UserManagement);
