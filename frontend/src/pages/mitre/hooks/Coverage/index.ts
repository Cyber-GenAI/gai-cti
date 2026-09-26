import { useMemo, useState } from "react";
import { coverageColorClasses } from "../../pages/constants/colorClasses";
import { RuleCounts } from "./types";

export const useRuleCounts = (isAdversaries: boolean) => {
  const [ruleCountsData, setRuleCountsData] = useState({});
  const ruleCounts: RuleCounts = useMemo(() => ruleCountsData, [ruleCountsData]);

  const getRuleColor = (tacticId: string): React.CSSProperties => {
    const count = ruleCounts[tacticId] ?? 0;

    if (isAdversaries) {
      // For adversaries, count is between 0 and 1
      const opacity = Math.round(Number(count.toFixed(1)) * 100) / 100; // Get opacity between 0 and 1
      return {
        backgroundColor: `rgba(20, 184, 166, ${opacity})`
      } // Example for teal color
    } else {
      // For non-adversaries, handle different count ranges
      if (count === 0) return {
        backgroundColor: coverageColorClasses.noRule
      } // No rules
      if (count <= 3) return {
        backgroundColor: `rgba(20, 184, 166, 0.1)`
      } // Light teal for 1-3
      if (count <= 7) return {
        backgroundColor: `rgba(20, 184, 166, 0.5)`
      } // Medium teal for 4-7
      if (count <= 10) return {
        backgroundColor: `rgba(20, 184, 166, 0.7)`
      } // Darker teal for 8-10
      return {
        backgroundColor: `rgba(20, 184, 166, 1)`
      } // Full teal for more than 10
    }
  };

  return { ruleCounts, getRuleColor, setRuleCountsData };
};