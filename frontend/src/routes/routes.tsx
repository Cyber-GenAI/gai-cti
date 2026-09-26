import { ReactElement, Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";

import Layout from "../layout";
import { Boot } from "../pages/boot";
import { Authentication } from "../pages/authenticate";

const Home = lazy(() => import("../pages/home"));
const Ti = lazy(() => import("../pages/threat-intelligence"));
const NotFound = lazy(() => import("../pages/errors"));
const Feeds = lazy(() => import("../pages/feeds"));
const Rules = lazy(() => import("../pages/rules"));
const LogsComponent = lazy(() => import("../pages/logs"));
const Management = lazy(() => import("../pages/management"));
const Alerts = lazy(() => import("../pages/alerts"));
const AlertDetail = lazy(() => import("../pages/alerts/alertsDetail/alertsDetail"));
const MitreCoverage = lazy(() => import("../pages/mitre/pages/MitreCoverage"));
const Adversaries = lazy(() => import("../pages/adversaries"));
const AdversariesMitreSpecificity = lazy(() => import("../pages/adversaries/mitre/specificity"));
const AdversariesMitreMap = lazy(() => import("../pages/adversaries/mitre/map"));
const UserManagement = lazy(() => import("../pages/user-management"));

export interface Route {
  path: string;
  title?: string;
  element: ReactElement;
  children?: Route[];
  subPage?: boolean;
  secure?: boolean;
}

const RootLayout = () => (
  <Suspense>
    <Layout grow panelled centeredContent={false}>
      <Outlet />
    </Layout>
  </Suspense>
);

export const MenuRoutes: Route[] = [
  { path: "/", title: "Home", element: <Home />, subPage: false },
  { path: "/adversaries", title: "Adversaries", element: <Adversaries />, subPage: false },
  { path: "/adversaries/mitre/map", title: "Adversaries MITRE Map", element: <AdversariesMitreMap />, subPage: true },
  { path: "/adversaries/mitre/specificity", title: "Adversaries MITRE Specificity", element: <AdversariesMitreSpecificity />, subPage: true },
  { path: "/alerts", title: "Alerts", element: <Alerts />, subPage: false },
  { path: "/alerts/:id", title: "Alerts Detail", element: <AlertDetail />, subPage: true },
  { path: "/rules", title: "Rules", element: <Rules />, subPage: false },
  { path: "/logs", title: "Logs", element: <LogsComponent />, subPage: false },
  { path: "/rules/coverage", title: "MITRE Coverage", element: <MitreCoverage />, subPage: true },
  { path: "/threat-intelligence", title: "Threat Intelligence", element: <Ti />, subPage: false },
  { path: "/feeds", title: "Feed Sources", element: <Feeds />, subPage: false },
  { path: "/management", title: "Management", element: <Management />, subPage: false },
  { path: "/user-management", title: "User Management", element: <UserManagement />, subPage: false, secure: true },
]

export const Routes: Route[] = [
  {
    path: "system-not-available",
    title: "Boot",
    element: (
      <Suspense>
        <Boot />
      </Suspense>
    ),
    subPage: false,
  },
  {
    path: "/",
    title: "",
    element: <Outlet />,
    subPage: false,
    children: [
      {
        path: "",
        element: <Outlet />,
        title: "boot",
        children: [
          {
            path: "auth",
            title: "Authenticate",
            element: (
              <Suspense>
                <Authentication />
              </Suspense>
            ),
            subPage: false,
          },
          {
            path: "",
            element: <RootLayout />,
            title: 'auth',
            children: MenuRoutes,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    title: "Not found",
    element: (
      <Suspense>
        <NotFound />
      </Suspense>
    ),
    subPage: false,
  },
];