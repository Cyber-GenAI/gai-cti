import { EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import React, { memo } from "react";
import { ITopAlertsFieldComponent } from "./types";

const topAlertsFieldComponent: React.FC<ITopAlertsFieldComponent> = ({
  title,
  percentage,
  description,
  color,
}) => {
  return (
    <div className="w-full h-12 flex flex-col justify-center items-start gap-0.5">
      <EuiFlexGroup className="!w-full" justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiText size="s">
            <p>{title}</p>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <p>{percentage.toFixed(2)}%</p>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className="w-full h-3 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 relative flex justify-start items-start">
        <div
          className="w-full h-full rounded"
          style={{ backgroundColor: color, width: percentage + "%" }}
        />
      </div>
      {description && (
        <EuiText size="s">
          <p>{description}</p>
        </EuiText>
      )}
    </div>
  );
};

export const TopAlertsField = memo(topAlertsFieldComponent);
