import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSideNav,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from './components';
import { MenuRoutes } from '../../../routes/routes';
import { useUser } from '../../../context/user/user-context';

const SidebarComponent = () => {
  const [isSideNavOpenOnMobile, setIsSideNavOpenOnMobile] = useState(false);
  const { isAdmin } = useUser();
  const [selectedLink, setSelectedLink] = useState<string>('home');
  const location = useLocation();

  const toggleOpenOnMobile = () => setIsSideNavOpenOnMobile(!isSideNavOpenOnMobile);

  useEffect(() => {
    setSelectedLink(location.pathname.split("/")[1]);
  }, [location]);

  const handleSelectItem = useCallback((route: string) => {
    setSelectedLink(route);
  }, []);

  const mainItems = useMemo(() => {
    return MenuRoutes
      ?.filter(route => !route.subPage && (!route.secure || (route.secure && isAdmin.data)))
      .map(route => {
        const isActive = selectedLink === route.path.split("/")[1];
        return {
          id: htmlIdGenerator(route.title)(),
          name: (
            <Link to={route.path} onClick={() => handleSelectItem(route.path)}>
              <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                <EuiFlexItem grow={1}>
                  <EuiText
                    size="m"
                    color={isActive ? 'primary' : 'default'}
                    className={isActive ? 'font-bold' : ''}
                  >
                    {route.title}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Link>
          ),
        };
      });
  }, [handleSelectItem, isAdmin.data, selectedLink]);

  const adminItems = useMemo(() => {
    return [
      {
        id: htmlIdGenerator('docs')(),
        name: '',
        items: [
          {
            id: htmlIdGenerator('user-guide')(),
            name: (
              <ExternalLink
                title="User Guide"
                href="/user-guide"
              />
            ),
          },
        ],
      },
      ...(isAdmin.data ? [
        {
          id: htmlIdGenerator('admin-tools')(),
          name: 'Admin Tools',
          items: [
            {
              id: htmlIdGenerator('open-cti')(),
              name: (
                <ExternalLink
                  title="Open WebUI"
                  href="https://open-webui.gai-cti.ir/"
                  username="gai-cti@openwebui.com"
                  password="OpenWebUI#12345678"
                />
              ),
            },
            {
              id: htmlIdGenerator('open-cti')(),
              name: (
                <ExternalLink
                  title="Open CTI"
                  href="/open-cti"
                  username="admin@opencti.io"
                  password="opencti12345678"
                />
              ),
            },
            {
              id: htmlIdGenerator('kibana')(),
              name: (
                <ExternalLink
                  title="Kibana"
                  href="/kibana"
                  username="elastic"
                  password="elastic12345678"
                />
              ),
            },
          ],
        }] : []),
    ];
  }, [isAdmin.data]);

  return (
    <EuiFlexGroup
      direction="column"
      className="!h-full !px-2"
      gutterSize="none"
    >
      <EuiFlexItem grow={true}>
        <EuiSideNav
          toggleOpenOnMobile={toggleOpenOnMobile}
          isOpenOnMobile={isSideNavOpenOnMobile}
          items={[
            {
              name: '',
              id: htmlIdGenerator('main')(),
              items: mainItems,
            },
          ]}
          mobileTitle="Navigation"
        />
      </EuiFlexItem>

      {/* Bottom Section: Admin Tools */}
      {isAdmin.data && (
        <EuiFlexItem grow={false}>
          <EuiSideNav
            items={adminItems}
            mobileTitle="Admin Tools"
            className="!mt-auto"
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

export const Sidebar = memo(SidebarComponent);
