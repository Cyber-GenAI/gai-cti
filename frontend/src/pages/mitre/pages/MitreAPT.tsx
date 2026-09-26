import { FC, memo } from "react";
import {
  EuiPanel,
  EuiPageBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from "@elastic/eui";
import jsonData from "./constants/matrix.json";
import { MatrixData } from "./types";
import { useGroupSelections } from "../hooks/APT";
import { GroupSelector, APTLegendBar, MatrixColumn } from "../components";

const MitreComponent: FC = () => {
  const { tactics, techniques_by_tactics, groups_with_techniques } =
    jsonData as MatrixData;
  const {
    selectedGroup1,
    selectedGroup2,
    setSelectedGroup1,
    setSelectedGroup2,
    groupOptions,
    getTechniqueColor,
    getTechniqueDescription,
  } = useGroupSelections(groups_with_techniques);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel paddingSize="l">
          <EuiPageBody>
            <EuiFlexGroup direction="column" gutterSize="l">
              <EuiFlexItem>
                <GroupSelector
                  selectedGroup1={selectedGroup1}
                  selectedGroup2={selectedGroup2}
                  setSelectedGroup1={setSelectedGroup1}
                  setSelectedGroup2={setSelectedGroup2}
                  groupOptions={groupOptions}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <APTLegendBar />
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
                            getTechniqueColor={getTechniqueColor}
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
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default memo(MitreComponent);
