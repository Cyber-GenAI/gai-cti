import { EuiDescriptionList, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiSkeletonText, EuiTitle } from '@elastic/eui'
import { memo } from 'react'
import ServiceMap from '../../../../../components/Maps'

interface IAlertDetailThreatProps {
  ti: {
    title: string;
    description: JSX.Element;
  }[];
  map: {
    id: string;
    description: string;
    lat: number;
    lng: number;
    name: string;
  }[];
  isLoading: boolean
}

const alertDetailThreatComponent = ({
  isLoading,
  map,
  ti,
}: IAlertDetailThreatProps) => {
  return (
    <EuiFlexItem>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel>
            <EuiFlexGroup direction="column">
              <EuiFlexItem>
                <EuiTitle>
                  <h2>Threat Intelligence</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiHorizontalRule margin="none" />
              </EuiFlexItem>
              <EuiFlexItem className="!max-h-[40vh] eui-yScrollWithShadows">
                <EuiPanel color="subdued">
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiSkeletonText isLoading={isLoading} lines={10} size='relative'>
                        <EuiDescriptionList
                          type="column"
                          align="left"
                          columnWidths={["25%", "75%"]}
                          rowGutterSize="m"
                          listItems={ti ?? []}
                        />
                      </EuiSkeletonText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiFlexGroup direction="column">
              <EuiFlexItem>
                <EuiTitle>
                  <h2>Threat Mapping</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiHorizontalRule margin="none" />
              </EuiFlexItem>
              <EuiFlexItem className="!max-h-[40vh] eui-yScrollWithShadows">
                <ServiceMap dotSize='l' serviceNodes={map} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  )
}

export const AlertDetailThreat = memo(alertDetailThreatComponent)