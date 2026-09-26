import { memo } from "react";
import { EuiText } from "@elastic/eui";
import { IMetricChart } from "./types";

const metricChart_c = ({ title, value, size = 300 }: IMetricChart) => {
  return (
    <div style={{ height: `${size / 1.75}px` }} className="costume_metric">
      <EuiText size="s">
        <p>{title}</p>
      </EuiText>
      <div className="w-full flex justify-end">
        <EuiText>
          <h1>{value}</h1>
        </EuiText>
      </div>
    </div>
  );
};

export const MetricChart = memo(metricChart_c);
