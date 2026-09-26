import { PartialTheme } from "@elastic/charts";
import { EuiFlexGroup, EuiFlexItem, HorizontalAlignment } from "@elastic/eui";
import { genericObject } from "../../../../types/global";
import { severities } from "../../../../types/third-party";
export const severityConfig: Record<severities, genericObject<string>> = {
  critical: {
    className: "bg-red-800",
    color: "#780000",
  },
  high: {
    className: "bg-red-500",
    color: "#ef4444",
  },
  medium: {
    className: "bg-yellow-500",
    color: "#fcbf49",
  },
  low: {
    className: "bg-green-500",
    color: "#22c55e",
  },
  default: {
    className: "bg-gray-300",
    color: "#d1d5db",
  },
};

export const themeOverrides: PartialTheme = {
  partition: {
    emptySizeRatio: 0.6,
    fillLabel: {
      textColor: "#ffffff",
    },
  },
};
export const columns = [
  {
    field: "key",
    name: "Severity Level",
    render: (key: string) => (
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <span
            className={`!w-2 !h-2 !rounded-full ${severityConfig[key as keyof typeof severityConfig]?.className ||
              severityConfig.default.className
              }`}
          />
        </EuiFlexItem>
        <EuiFlexItem>{key}</EuiFlexItem>
      </EuiFlexGroup>
    ),
  },
  {
    field: "doc_count",
    width: "35%",
    name: "Count",
    align: "center" as HorizontalAlignment,
  },
];
