import { createRoot } from 'react-dom/client'
import './index.css'
import { EuiProvider } from '@elastic/eui'
import '@elastic/charts/dist/theme_light.css';
import { ToastContainer } from 'react-toastify'
import { CookiesProvider } from 'react-cookie'
import { UtilitiesProvider } from './context/utilities/utilities-context.tsx'
import { ManagementProvider } from './context/management/management-context.tsx'
import { HomeProvider } from './context/home/home-context.tsx'
import { FeedsProvider } from './context/feeds/feeds-context.tsx'
import { ThreatIntelligenceProvider } from './context/threat-intelligence/threat-intelligence-context.tsx'
import { AdversariesProvider } from './context/adversaries/adversaries-context.tsx'
import { AlertProvider } from './context/alert/alert-context.tsx'
import { RulesProvider } from './context/rules/rules-context.tsx'
import { LogsProvider } from './context/logs/logs-context.tsx'
import { AssistantProvider } from './context/assistant/assistant-context.tsx'
import { UserProvider } from './context/user/user-context.tsx'
import RoutesList from './routes/index.tsx'
import './assets/icons';

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <EuiProvider>
      <UtilitiesProvider>
        <AssistantProvider>
          <UserProvider>
            <HomeProvider>
              <ManagementProvider>
                <ThreatIntelligenceProvider>
                  <FeedsProvider>
                    <AdversariesProvider>
                      <AlertProvider>
                        <LogsProvider>
                          <RulesProvider>
                            <ToastContainer />
                            <RoutesList />
                          </RulesProvider>
                        </LogsProvider>
                      </AlertProvider>
                    </AdversariesProvider>
                  </FeedsProvider>
                </ThreatIntelligenceProvider>
              </ManagementProvider>
            </HomeProvider>
          </UserProvider>
        </AssistantProvider>
      </UtilitiesProvider>
    </EuiProvider>
  </CookiesProvider>
)
