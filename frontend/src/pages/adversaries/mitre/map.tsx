import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPageBody, EuiPanel, useEuiTheme } from "@elastic/eui";
import jsonData from '../../mitre/pages/constants/matrix.json'
import { MatrixData } from "../../mitre/pages/types";
import { MatrixColumn } from "./common/adversariesMitreColumn";
import { LoadingPrompt } from "../../../components";
import { useNavigate } from "react-router-dom";
import { APTLegendBar, MitreCoverageHeader } from "../../mitre/components";
import { APTColorStyles } from "../../mitre/pages/constants/colorClasses";
import { useAdversaries } from "../../../context/adversaries/adversaries-context";

const AdversariesMitreMapComponent = () => {
  const { tactics, techniques_by_tactics } = jsonData as MatrixData;
  const { mitres, getAdversariesMitre } = useAdversaries()
  const { colorMode } = useEuiTheme();
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
    getAdversariesMitre(true);
  }, [getAdversariesMitre]);

  const getRuleColor = (techniqueId: string): React.CSSProperties => {
    const inGroup1 = (mitres?.data?.[selectedApt] ?? {})[techniqueId] > 0;
    const inGroup2 = (mitres?.data?.['organization'] ?? {})[techniqueId] > 0;

    if (inGroup1 && inGroup2) return APTColorStyles.bothGroup[colorMode === 'LIGHT' ? 'light' : 'dark'];
    if (inGroup1) return APTColorStyles.group1[colorMode === 'LIGHT' ? 'light' : 'dark'];
    if (inGroup2) return APTColorStyles.group2[colorMode === 'LIGHT' ? 'light' : 'dark'];

    return APTColorStyles.unselected[colorMode === 'LIGHT' ? 'light' : 'dark'];
  }

  const getTechniqueDescription = (techniqueId: string): string => {
    const inGroup1 = (mitres?.data?.[selectedApt] ?? {})[techniqueId] > 0;
    const inGroup2 = (mitres?.data?.['organization'] ?? {})[techniqueId] > 0;

    if (inGroup1 && inGroup2) return 'Overlaps';
    if (inGroup1) return 'Selected APT';
    if (inGroup2) return 'Organization';

    return 'Unselected';
  };

  const memoizedAptOptions = useMemo(() => groupOptions.filter((item) => item.label !== 'organization'), [groupOptions])

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" gutterSize="l">
            <EuiFlexItem grow={false}>
              <MitreCoverageHeader headerTitle="Alerts maped to MITRE ATT&CK Matrix" title="adversaries" onBack={handleNavigateBack} />
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
                <LoadingPrompt size="m" /> :
                <EuiPageBody>
                  <EuiFlexGroup direction="column" gutterSize="l">
                    <EuiFlexItem>
                      <EuiFlexGroup direction="column">
                        <EuiFlexItem>
                          <EuiComboBox
                            placeholder="Select APT"
                            singleSelection={{ asPlainText: true }}
                            options={memoizedAptOptions}
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
                        <EuiFlexItem grow={false}>
                          <APTLegendBar />
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

export default memo(AdversariesMitreMapComponent)