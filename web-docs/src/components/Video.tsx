import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type VideoProps = {
  src: string;
  width?: number | string;
};

export default function Video({ src, width = 800 }: VideoProps) {
  const { siteConfig } = useDocusaurusContext();

  const baseUrl = siteConfig.customFields.videoBaseUrl as string;

  return (
    <video
      src={`${baseUrl}/${src}`}
      controls
      width={width}
      style={{ borderRadius: '12px' }}
    />
  );
}
