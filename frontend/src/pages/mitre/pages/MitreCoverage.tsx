import { FC, memo, useCallback, useEffect, useState } from "react";
import { EuiPanel, EuiPageBody, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import {
  CoverageLegendBar,
  MatrixColumn,
  MitreCoverageHeader,
} from "../components";
import jsonData from "./constants/matrix.json";
import { MatrixData } from "./types";
import { useRuleCounts } from "../hooks/Coverage";
import { useNavigate } from "react-router-dom";
import { useDidMountEffect } from "../../../hooks/useDidMountEffect";
import { LoadingPrompt } from "../../../components";
import { useRules } from "../../../context/rules/rules-context";

const MitreCoverage: FC = () => {
  const { tactics, techniques_by_tactics } = jsonData as MatrixData;
  const { ruleCounts, getRuleColor, setRuleCountsData } = useRuleCounts(false);
  const { mitre_coverage, getMitreCoverage } = useRules();
  const [ openTechniqueId, setOpenTechniqueId ] = useState<string>("")
  const navigate = useNavigate();

  useEffect(() => {
    getMitreCoverage();
  }, [getMitreCoverage]);

  useDidMountEffect(() => {
    setRuleCountsData(mitre_coverage.data ?? {});
  }, [mitre_coverage]);

  const handleCloseTechnique = useCallback(() => setOpenTechniqueId(""), [])
  const handleOpenTechnique = useCallback((id: string) => setOpenTechniqueId(id), [])
  
  const getTechniqueDescription = (techniqueId: string): string => {
    const count = ruleCounts[techniqueId] ?? 0;
    return `${count} rules`;
  };

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <EuiPanel paddingSize="l">
      <EuiPageBody>
        <EuiFlexGroup direction="column" gutterSize="l">
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="spaceBetween" gutterSize="l">
              <EuiFlexItem grow={false}>
                <MitreCoverageHeader headerTitle="Rule Coverage in MITRE ATT&CK Matrix" title="rules" onBack={handleNavigateBack} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <CoverageLegendBar />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="columnReverse">
              {mitre_coverage.isLoading ? (
                <LoadingPrompt size="xl"/>
              ) : (
                <EuiFlexItem>
                  <div className="w-full pb-20 eui-xScrollWithShadows">
                    <EuiFlexGroup
                      gutterSize="l"
                      responsive={false}
                      alignItems="flexStart"
                    >
                      {tactics.map((tactic) => (
                        <MatrixColumn
                          key={tactic.id}
                          tactic={tactic}
                          techniques={techniques_by_tactics[tactic.id] || []}
                          getTechniqueColor={getRuleColor}
                          getTechniqueDescription={getTechniqueDescription}
                          handleOpenTechnique={handleOpenTechnique}
                          handleCloseTechnique={handleCloseTechnique}
                          openTechniqueId={openTechniqueId}
                        />
                      ))}
                    </EuiFlexGroup>
                  </div>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </EuiPanel>
  );
};

export default memo(MitreCoverage);
