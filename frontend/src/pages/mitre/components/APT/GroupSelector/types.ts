export interface GroupSelectorProps {
  selectedGroup1: string;
  selectedGroup2: string;
  setSelectedGroup1: (val: string) => void;
  setSelectedGroup2: (val: string) => void;
  groupOptions: { value: string; text: string }[];
};