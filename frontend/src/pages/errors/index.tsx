import { EuiPageTemplate } from "@elastic/eui";
import { NotFoundPrompt } from "./constant";

const NotFound = () => {
  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt {...NotFoundPrompt} />
    </EuiPageTemplate>
  );
};

export default NotFound;
