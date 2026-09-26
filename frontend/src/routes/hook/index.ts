/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createHashRouter,
  LoaderFunctionArgs,
  redirect,
} from "react-router-dom";
import { Route, Routes } from "../routes";
import { getSystemAvailable } from "../../services/system";
import { requireAuth } from "../../services/auth";
import Cookies from "universal-cookie";

function enhanceRoute(route: Route, parentSecure = false): any {
  const secure = route.secure ?? parentSecure;
  const enhanced: any = { ...route };

  if (enhanced.path === "" && enhanced.title === "boot") {
    enhanced.loader = async () => {
      const available = await getSystemAvailable();
      if (!available) throw redirect("/system-not-available");
      return null;
    };
  }

  if (enhanced.path === "" && enhanced.title === "auth" && !enhanced.loader) {
    enhanced.loader = async (args: LoaderFunctionArgs) => {
      if (!new Cookies().get('es_token')?.length)
        return await requireAuth(args);
    };
  }

  if (enhanced.children) {
    enhanced.children = enhanced.children.map((c: any) =>
      enhanceRoute(c, secure)
    );
  }

  return enhanced;
}

export const router = createHashRouter(
  Routes.map((r) => enhanceRoute(r))
);