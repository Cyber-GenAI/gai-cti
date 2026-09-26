import { EuiFlexGroup, EuiFlexItem, EuiImage, EuiLoadingChart, EuiPageTemplate, EuiPanel, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { memo, useCallback, useEffect } from 'react';
import { Section } from '../../layout/component';
import { useNavigate } from 'react-router-dom';
import { getSystemAvailable } from '../../services/system';

const BootComponent = () => {
  const navigate = useNavigate();

  const handleIsSystemAvailable = useCallback(async () => {
    const status = await getSystemAvailable(true);
    if (status || import.meta.env.DEV) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    handleIsSystemAvailable();
    const intervalId = setInterval(() => {
      handleIsSystemAvailable();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [handleIsSystemAvailable]);

  return (
    <EuiPageTemplate panelled={true} grow={true}>
      <Section centeredContent={true} extendedBorder={true}>
        <EuiPanel hasShadow={false}>
          <EuiFlexGroup gutterSize='xl' justifyContent='center' alignItems='center' direction='column'>
            <EuiFlexItem>
              <EuiImage
                size={200}
                alt="logo"
                src="http://www.itrc.ac.ir/themes/irandrupalsignal/images/itrc-logo-footer.png"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTitle>
                <h1>Waiting for GAI-CTI to boot</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize='s' direction='column' alignItems='center'>
                <EuiFlexItem>
                  <EuiText>
                    <p>HTTP 502</p>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiSpacer />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText>
                    <p>it can take up to few minutes for GAI-CTI to boot completely</p>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText>
                    <p>this page will automatically reload 5 seconds.</p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiLoadingChart />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </Section>
    </EuiPageTemplate>
  );
}

export const Boot = memo(BootComponent);
