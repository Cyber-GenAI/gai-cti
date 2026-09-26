import React from 'react';
import { Technique } from '../../../pages/types';

export type TechniqueCardProps = {
  technique: Technique;
  id: string;
  getTechniqueColor: (id: string) => React.CSSProperties;
  getTechniqueDescription: (id: string) => string;
  handleOpenTechnique?: (id: string) => void;
  handleCloseTechnique?: () => void;
  isTechniqueOpen?: boolean;
};
