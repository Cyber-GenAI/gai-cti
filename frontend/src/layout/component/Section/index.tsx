import { EuiPageSection } from "@elastic/eui";
import { memo } from "react";
import { SectionProps } from "./types";

const sectionComponent = ({
  children,
  centeredContent = true,
  extendedBorder = true,
}: SectionProps) => {
  return (
    <EuiPageSection
      restrictWidth="100%"
      alignment={centeredContent ? "center" : "top"}
      color={extendedBorder ? "plain" : "transparent"}
      grow={centeredContent ? true : false}
    >
      {children}
    </EuiPageSection>
  );
};

export const Section = memo(sectionComponent);
