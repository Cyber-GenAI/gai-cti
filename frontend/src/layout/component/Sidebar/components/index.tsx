import {
  EuiButtonIcon,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPopover,
  EuiText,
} from "@elastic/eui";
import React, { memo, useCallback, useState } from "react";
import { IExternalLinkProps } from "./types";

const ExternalLinkComponent: React.FC<IExternalLinkProps> = ({
  title,
  href,
  username,
  password,
}) => {
  const [isPopOverOpen, setIsPopOverOpen] = useState<boolean>(false);

  const closePopover = useCallback(() => {
    setIsPopOverOpen(false);
  }, []);

  const openPopover = useCallback(() => {
    setIsPopOverOpen(true);
  }, []);

  return (
    <EuiFlexItem className="w-full">
      <EuiFlexGroup
        direction="row"
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="s"
      >
        <EuiFlexItem className="w-full">
          <EuiLink href={href} target="_blank" external>
            {title}
          </EuiLink>
        </EuiFlexItem>
        {username && password && (
          <EuiFlexItem grow={false}>
            <EuiPopover
              button={
                <EuiButtonIcon
                  onClick={openPopover}
                  iconType="help"
                  aria-label={"help"}
                />
              }
              isOpen={isPopOverOpen}
              closePopover={closePopover}
              anchorPosition="upCenter"
            >
              <EuiFlexGroup direction="column" gutterSize="s">
                <EuiFlexItem>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiText size="s">
                        <p>username: {username}</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCopy textToCopy={username}>
                        {(copy) => (
                          <EuiButtonIcon
                            iconType="copyClipboard"
                            onClick={copy}
                            aria-label={"copy"}
                          />
                        )}
                      </EuiCopy>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiText size="s">
                        <p>password: {password}</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCopy textToCopy={password}>
                        {(copy) => (
                          <EuiButtonIcon
                            iconType="copyClipboard"
                            onClick={copy}
                            aria-label={"copy"}
                          />
                        )}
                      </EuiCopy>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPopover>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiFlexItem>
  );
};

export const ExternalLink = memo(ExternalLinkComponent);
