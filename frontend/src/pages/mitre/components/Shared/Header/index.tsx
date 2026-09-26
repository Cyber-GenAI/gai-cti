import { FC, memo } from "react";
import { EuiPageHeader } from "@elastic/eui";
import { MitreHeaderProps } from "./types";
const mitreHeader: FC<MitreHeaderProps> = ({ description }) => (
  <EuiPageHeader pageTitle="Mitre Attack page" description={description} />
);

export const MitreHeader = memo(mitreHeader);
