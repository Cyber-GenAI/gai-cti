import { FC } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiToolTip } from "@elastic/eui";
import { TechniqueCard } from "..";
import { MatrixColumnProps } from "./types";

export const MatrixColumn: FC<MatrixColumnProps> = ({
  tactic,
  techniques,
  openTechniqueId,
  handleCloseTechnique,
  handleOpenTechnique,
  getTechniqueColor,
  getTechniqueDescription,
}) => (
  <EuiFlexItem
    grow={false}
    className="flex justify-center items-center min-w-3xs"
  >
    <EuiPanel paddingSize="m" color="plain" hasShadow={false}>
      <EuiFlexGroup direction="column">
        <EuiToolTip content={tactic.id}>
          <EuiFlexItem>
            <div className="h-25 flex flex-col gap-1 !pl-3 justify-between !py-3 items-start text-left !border-b !border-gray-300 rounded-lg !bg-gray-50 dark:!bg-gray-900">
              <div className="text-xl !font-semibold text-gray-800 dark:text-gray-200">
                {tactic.name}
              </div>
              <div className="text-xs !font-medium text-teal-700 dark:text-teal-400">
                {techniques.length} techniques
              </div>
            </div>
          </EuiFlexItem>
        </EuiToolTip>
        <EuiFlexItem>
          <div className="flex flex-col gap-4">
            {techniques.map((technique) => (
              <TechniqueCard
                key={`${tactic.id}/${technique.id}`}
                technique={technique}
                id={`${tactic.id}/${technique.id}`}
                getTechniqueColor={getTechniqueColor}
                getTechniqueDescription={getTechniqueDescription}
                handleCloseTechnique={() => handleCloseTechnique && handleCloseTechnique()}
                handleOpenTechnique={(id) => handleOpenTechnique && handleOpenTechnique(id)}
                isTechniqueOpen={openTechniqueId === `${tactic.id}/${technique.id}`}
              />
            ))}
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  </EuiFlexItem>
);
