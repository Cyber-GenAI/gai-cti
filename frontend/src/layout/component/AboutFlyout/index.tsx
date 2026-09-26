import React, { memo } from "react";
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiText,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { IAboutFlyoutComponentProps } from "./types";

const AboutFlyoutComponent: React.FC<IAboutFlyoutComponentProps> = ({
  onClose,
  isVisible,
}) => {
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "simpleFlyoutTitle",
  });

  let flyout;
  if (isVisible) {
    flyout = (
      <EuiFlyout
        ownFocus
      hideCloseButton
        onClose={onClose}
        aria-labelledby={simpleFlyoutTitleId}
      >
        <EuiFlyoutHeader>
          <EuiTitle size="m">
            <h2>About</h2>
          </EuiTitle>
          <EuiHorizontalRule margin="s" />
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText>
            <p>
              GAI-CTI is an advanced Threat Intelligence platform developed by
              Amnafzar Gostar-e Sharif in collaboration with and commissioned by
              ITRC (IRAN Telecommunication Research Center).
              <br />
              <br />
              Combining SIEM capabilities, Cyber Threat Intelligence (CTI), and
              Generative AI, GAI-CTI empowers security analysts to detect,
              analyze, and respond to threats faster and more accurately. The
              platform provides automated summaries of security events, threat
              context, and attack scenarios, helping SOC teams make informed
              decisions in real-time.
              <br />
              <br />
              Designed for organizations facing advanced cyber threats, GAI-CTI
              offers a local, intelligent, and scalable solution for proactive
              cyber defense.
            </p>
          </EuiText>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return <>{flyout}</>;
};

export const AboutFlyout = memo(AboutFlyoutComponent);
