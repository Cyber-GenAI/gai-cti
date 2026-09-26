import React from 'react';
import { genericObject } from '../../../../../types/global';
import { Technique } from '../../../pages/types';

export type MatrixColumnProps = {
  tactic: Technique;
  techniques: Technique[];
  getTechniqueColor: (id: string) => React.CSSProperties;
  getTechniqueDescription: (id: string) => string;
  handleOpenTechnique?: (id: string) => void;
  getTechniqueRules?: (id: string) => genericObject<string | string[]>[]
  handleCloseTechnique?: () => void;
  openTechniqueId?: string;
};
