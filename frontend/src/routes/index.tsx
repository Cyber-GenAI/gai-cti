import { RouterProvider } from "react-router-dom";
import { router } from "./hook";
import "@elastic/eui/dist/eui_theme_light.json";

const RoutesList = () => {
  return <RouterProvider router={router} />;
};

export default RoutesList;