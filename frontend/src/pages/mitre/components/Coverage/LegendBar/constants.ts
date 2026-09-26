
import { coverageColorClasses } from "../../../pages/constants/colorClasses";
import { LegendItem } from "./types";

const { noRule, rule1_3, rule3_7, rule7_10, moreThan10Rules } = coverageColorClasses;

export const legendItems: LegendItem[] = [
  { label: "0 rules", className: noRule },
  { label: "1-3 rules", className: rule1_3 },
  { label: "4-7 rules", className: rule3_7 },
  { label: "8-10 rules", className: rule7_10 },
  { label: ">10 rules", className: moreThan10Rules },
];
