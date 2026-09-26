import { EuiLink } from "@elastic/eui";
import { Link } from "react-router-dom";

const NOT_FOUND_TITLE = "Not Found 404";
const NOT_FOUND_DESCRIPTION =
  "Oops! The page you're looking for doesn't exist.";
const NOT_FOUND_ACTION = "Go back home";
export const NotFoundPrompt = {
  title: <h2>{NOT_FOUND_TITLE}</h2>,
  body: <p>{NOT_FOUND_DESCRIPTION}</p>,
  actions: [
    <Link to={"/"}>
      <EuiLink>{NOT_FOUND_ACTION}</EuiLink>
    </Link>,
  ],
};
