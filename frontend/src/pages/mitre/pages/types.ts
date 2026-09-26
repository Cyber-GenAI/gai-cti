export type Technique = {
  name: string;
  id: string;
};
export type Tactic = Technique;
export interface GroupWithTechniques extends Technique {
  techniques: string[];
}
export interface TechniquesByTactics {
  [key: string]: Technique[];
}
export interface MatrixData {
  tactics: Tactic[];
  techniques_by_tactics: TechniquesByTactics;
  groups_with_techniques: GroupWithTechniques[];
}
