import { memo, useCallback, useEffect, useState } from "react";
import { useDidMountEffect } from "../../../hooks/useDidMountEffect";
import { EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPageBody, EuiPanel } from "@elastic/eui";
import jsonData from '../../mitre/pages/constants/matrix.json'
import { MatrixData } from "../../mitre/pages/types";
import { MatrixColumn } from "./common/adversariesMitreColumn";
import { useRuleCounts } from "../../mitre/hooks/Coverage";
import { LoadingPrompt } from "../../../components";
import { useNavigate } from "react-router-dom";
import { MitreCoverageHeader } from "../../mitre/components";
import { useAdversaries } from "../../../context/adversaries/adversaries-context";

const AdversariesMitreSpecificityComponent = () => {
  const { tactics, techniques_by_tactics } = jsonData as MatrixData;
  const { mitres, getAdversariesMitre } = useAdversaries()
  const { ruleCounts, getRuleColor, setRuleCountsData } = useRuleCounts(true);
  const [selectedApt, setSelectedApt] = useState<string>("")
  const navigate = useNavigate();

  const groupOptions = Object.keys(mitres?.data ?? {}).map((tactic) => {
    return {
      label: tactic,
      value: tactic
    }
  })

  useEffect(() => {
    getAdversariesMitre(false);
  }, [getAdversariesMitre]);

  useDidMountEffect(() => {
    setRuleCountsData(mitres?.data?.[selectedApt] ?? []);
  }, [mitres.data, selectedApt]);

  const getTechniqueDescription = (techniqueId: string): string => {
    const count = ruleCounts[techniqueId] ?? 0;
    return `specificity: ${count === 0 ? 0 : count.toFixed(1)}`;
  };

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" gutterSize="l">
            <EuiFlexItem grow={false}>
              <MitreCoverageHeader headerTitle="Specificity on MITRE ATT&CK Matrix" title="adversaries" onBack={handleNavigateBack} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiHorizontalRule margin="none" />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} paddingSize="l">
            {
              mitres.isLoading ?
                <LoadingPrompt size="m"/> :
                <EuiPageBody>
                  <EuiFlexGroup direction="column" gutterSize="l">
                    <EuiFlexItem>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <EuiComboBox
                            placeholder="Select APT"
                            singleSelection={{ asPlainText: true }}
                            options={groupOptions}
                            selectedOptions={
                              selectedApt
                                ? [{ label: selectedApt, value: selectedApt }]
                                : []
                            }
                            onChange={(selected) => {
                              setSelectedApt(selected[0]?.value ?? "");
                            }}
                            isClearable
                          />
                        </EuiFlexItem>
                        <EuiFlexItem>

                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiFlexGroup direction="columnReverse">
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
                                />
                              ))}
                            </EuiFlexGroup>
                          </div>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPageBody>
            }
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  )
}

export default memo(AdversariesMitreSpecificityComponent)