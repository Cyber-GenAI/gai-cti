import { useState, useMemo } from "react";
import { GroupWithTechniques } from "../../pages/types";
import { APTColorStyles } from "../../pages/constants/colorClasses";
import { useEuiTheme } from "@elastic/eui";

export const useGroupSelections = (groups: GroupWithTechniques[]) => {
  const [selectedGroup1, setSelectedGroup1] = useState<string>("");
  const [selectedGroup2, setSelectedGroup2] = useState<string>("");
  const { colorMode } = useEuiTheme();

  const groupOptions = useMemo(
    () =>
      groups.map((group) => ({
        value: group.id,
        text: group.name,
      })),
    [groups]
  );

  const selectedTechniques1 = useMemo(
    () => groups.find((g) => g.id === selectedGroup1)?.techniques || [],
    [groups, selectedGroup1]
  );

  const selectedTechniques2 = useMemo(
    () => groups.find((g) => g.id === selectedGroup2)?.techniques || [],
    [groups, selectedGroup2]
  );

  const getTechniqueColor = useMemo(
    () => (techniqueId: string) => {
      const inGroup1 = selectedTechniques1.includes(techniqueId);
      const inGroup2 = selectedTechniques2.includes(techniqueId);

      if (inGroup1 && inGroup2) return (APTColorStyles.bothGroup[colorMode === 'LIGHT' ? 'light' : 'dark']);
      if (inGroup1) return (APTColorStyles.group1[colorMode === 'LIGHT' ? 'light' : 'dark']);
      if (inGroup2) return (APTColorStyles.group2[colorMode === 'LIGHT' ? 'light' : 'dark']);
      return (APTColorStyles.unselected[colorMode === 'LIGHT' ? 'light' : 'dark']);
    },
    [colorMode, selectedTechniques1, selectedTechniques2]
  );

  const getTechniqueDescription = (techniqueId: string): string => {
    return techniqueId;
  };

  return {
    selectedGroup1,
    setSelectedGroup1,
    selectedGroup2,
    setSelectedGroup2,
    groupOptions,
    getTechniqueColor,
    getTechniqueDescription,
  };
};
