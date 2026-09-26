import { redirect } from "react-router-dom";
import { AR_GET_ES_TOKEN } from "../api/routes/utilities";
import Cookies from "universal-cookie";

export async function requireAuth({ request }: { request: Request }) {
  const cookies = new Cookies();

  if (cookies.get("es_token")) {
    return { encoded: cookies.get("es_token") };
  }

  const url = new URL(request.url);
  const redirectTo = new URL("auth", url);
  redirectTo.search = url.search;

  redirectTo.searchParams.set("returnTo", url.pathname + url.search);

  const authB64 = cookies.get("auth");
  if (!authB64) {
    throw redirect(redirectTo.toString());
  }

  try {
    const res = await fetch(AR_GET_ES_TOKEN, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authB64}`,
      },
    });

    if (!res.ok) {
      throw redirect(redirectTo.toString());
    }

    const data = await res.json();
    return data;
  } catch {
    throw redirect(redirectTo.toString());
  }
}