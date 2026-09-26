# GAT-CTI Frontend - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [State Management](#state-management)
7. [Routing & Navigation](#routing--navigation)
8. [API Integration](#api-integration)
9. [Components](#components)
10. [Pages & Features](#pages--features)
11. [Type System](#type-system)
12. [Utilities & Helpers](#utilities--helpers)
13. [Hooks](#hooks)
14. [Constants & Configuration](#constants--configuration)
15. [Authentication & Security](#authentication--security)
16. [Real-time Communication](#real-time-communication)
17. [Data Visualization](#data-visualization)
18. [Development Workflow](#development-workflow)
19. [Deployment](#deployment)
20. [External Integrations](#external-integrations)

---

## Project Overview

**GAT-CTI Frontend** is a comprehensive Cyber Threat Intelligence (CTI) management platform built with React 18 and TypeScript. The application provides security analysts with tools to:

- Monitor and analyze security alerts
- Manage detection rules
- Track threat intelligence indicators
- Analyze adversary behavior and MITRE ATT&CK techniques
- Search and analyze logs from Elasticsearch
- Manage threat intelligence feeds
- Interact with an AI assistant for threat analysis

### Key Features
- Real-time alert monitoring and analysis
- MITRE ATT&CK framework integration
- Elasticsearch/Kibana integration for log analysis
- OpenCTI integration for threat intelligence
- AI-powered assistant for threat analysis
- Interactive data visualizations and dashboards
- User management and role-based access control
- WebSocket-based real-time updates


---

## Technology Stack

### Core Technologies
- **React 18** - UI framework with concurrent features
- **TypeScript 5.7** - Type-safe JavaScript
- **Vite 6** - Fast build tool and dev server
- **React Router 7** - Client-side routing with hash routing

### UI Framework & Styling
- **Elastic EUI 99.3** - Enterprise UI component library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Emotion CSS** - CSS-in-JS library
- **@tailwindcss/vite** - Tailwind integration for Vite

### Data Visualization
- **@elastic/charts 69.1** - Elastic's charting library
- **@nivo/*** - Comprehensive charting library
  - Calendar heatmaps
  - Chord diagrams
  - Network graphs
  - Parallel coordinates
  - Treemaps
  - Heatmaps
- **Leaflet 4.2** - Interactive maps
- **React-Leaflet 4.2** - React bindings for Leaflet
- **Sigma 3.0** - Graph visualization
- **Graphology** - Graph data structure library

### State Management
- **React Context API** - Global state management
- **useReducer** - Complex state logic
- **React Cookie** - Cookie management

### Real-time Communication
- **Socket.IO Client 4.8** - WebSocket communication

### Utilities
- **Day.js 1.11** - Date manipulation
- **Moment.js 2.30** - Date/time handling
- **Moment-timezone 0.5** - Timezone support
- **Crypto-js 4.2** - Cryptographic functions
- **Pako 2.1** - Compression/decompression
- **fflate 0.8** - Fast compression
- **tar-js 0.3** - TAR archive handling

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint 8** - TypeScript-specific linting
- **Vite Plugin React 4** - React support for Vite

### Deployment
- **Docker** - Containerization
- **Node 22 Alpine** - Lightweight Node.js runtime
- **serve** - Static file server for production


---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React App)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  Components  │  │    Pages     │      │
│  │  (EUI/CSS)   │  │   (Reusable) │  │  (Features)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │         State Management (Context + Reducer)         │   │
│  │  - 12 Feature-Specific Context Providers            │   │
│  │  - Centralized State with useReducer                │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Layer   │  │   Hooks      │  │  Utilities   │      │
│  │  (request)   │  │  (Custom)    │  │  (Helpers)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Backend API │  │ Elasticsearch│  │    Kibana    │      │
│  │  (FastAPI)   │  │   (Logs)     │  │ (Dashboards) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   OpenCTI    │  │  Socket.IO   │                         │
│  │  (Threat TI) │  │  (Real-time) │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

#### 1. Context + Reducer Pattern
All state management follows a consistent pattern:
- **Context Provider** wraps the application
- **useReducer** manages complex state logic
- **Custom hooks** expose state and actions
- **Memoization** prevents unnecessary re-renders

#### 2. Component Composition
- **Atomic Design** principles for component hierarchy
- **Lazy Loading** for page components
- **Suspense Boundaries** for loading states
- **Reusable Components** for common UI patterns

#### 3. API Request Pattern
- **Centralized request utility** with auth handling
- **Automatic error handling** with toast notifications
- **Request cancellation** support via AbortSignal
- **Response validation** with TypeScript type guards

#### 4. Loading State Management
- **Consistent loading states** across all features
- **Optimistic updates** where appropriate
- **Error boundaries** for graceful error handling


---

## Getting Started

### Prerequisites
- Node.js 22 or higher
- Yarn package manager
- Docker (for containerized development)

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_ROOT=http://localhost:8088
VITE_KIBANA_API_ROOT=http://localhost:5601/kibana
VITE_ELASTIC_API_ROOT=http://localhost:9200
VITE_SOCKET_IO_ROOT=http://localhost:8088
```

### Installation

```bash
# Install dependencies
yarn install --frozen-lockfile

# Start development server
yarn dev

# Start development server with network access
yarn host

# Build for production
yarn build

# Preview production build
yarn preview

# Run linter
yarn lint
```

### Development with DevContainer

The project includes a DevContainer configuration for VS Code:

```bash
# Open in VS Code
code .

# Reopen in Container (Command Palette: "Dev Containers: Reopen in Container")
```

**DevContainer Features:**
- Automatic dependency installation
- Port forwarding for backend services
- Pre-configured VS Code extensions:
  - Code Spell Checker
  - GitLens
  - Tailwind CSS IntelliSense
  - ES7 React/Redux snippets

**Forwarded Ports:**
- `5173` - Frontend dev server
- `8088` - Backend API
- `5601` - Kibana
- `9200` - Elasticsearch
- `8080` - OpenCTI

### Access URLs

**Development:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8088`
- Swagger Docs: `http://localhost:8088/docs`
- Kibana: `http://localhost:5601/kibana`
- Elasticsearch: `http://localhost:9200`
- OpenCTI: `http://localhost:8080/open-cti`

**Staging:**
- Production: `http://gai-cti.amnafzar.ir/`

### Default Credentials

**OpenCTI:**
- Username: `admin@opencti.io`
- Password: `opencti12345678`

**Kibana:**
- Username: `elastic`
- Password: `elastic12345678`


---

## Project Structure

```
frontend/
├── .devcontainer/              # DevContainer configuration
│   ├── devcontainer.json       # VS Code DevContainer settings
│   └── docker-compose.devcontainer.yml
├── src/
│   ├── api/                    # API integration layer
│   │   ├── routes/             # API endpoint definitions
│   │   │   ├── adversaries/    # Adversary endpoints
│   │   │   ├── alert/          # Alert endpoints
│   │   │   ├── assistant/      # AI assistant endpoints
│   │   │   ├── feed/           # Feed endpoints
│   │   │   ├── home/           # Dashboard endpoints
│   │   │   ├── log/            # Log endpoints
│   │   │   ├── management/     # Management endpoints
│   │   │   ├── rule/           # Rule endpoints
│   │   │   ├── third-party/    # Third-party integrations
│   │   │   ├── threat-intelligence/ # TI endpoints
│   │   │   ├── user/           # User endpoints
│   │   │   ├── utilities/      # Utility endpoints
│   │   │   └── index.ts        # API root configuration
│   │   └── utils/              # API utilities
│   │       ├── buildQuery.ts   # Query string builder
│   │       └── request.ts      # HTTP request wrapper
│   ├── assets/                 # Static assets
│   │   └── icons.js            # Icon definitions
│   ├── components/             # Reusable components
│   │   ├── Charts/             # Chart components
│   │   │   ├── AreaChart/
│   │   │   ├── BarChart/
│   │   │   ├── GoalChart/
│   │   │   ├── MetricChart/
│   │   │   ├── PieChart/
│   │   │   ├── RangeBarChart/
│   │   │   ├── StackedBarChart/
│   │   │   ├── TreeMapChart/
│   │   │   └── nivo/           # Nivo chart components
│   │   │       ├── CalenderHeatmap/
│   │   │       ├── ChordDiagram/
│   │   │       ├── Heatmap/
│   │   │       ├── NetworkGraph/
│   │   │       ├── ParallelCoordinates/
│   │   │       └── mock/       # Mock data
│   │   ├── DataTable/          # Table component
│   │   │   ├── components/     # Table sub-components
│   │   │   ├── hooks/          # Table hooks
│   │   │   └── renders/        # Cell renderers
│   │   ├── Form/               # Form components
│   │   ├── LoadingPrompt/      # Loading indicators
│   │   ├── Maps/               # Map components
│   │   └── PopConfirm/         # Confirmation dialogs
│   ├── constants/              # Application constants
│   │   ├── colors.ts           # Color palette
│   │   ├── feeds/              # Feed constants
│   │   ├── global.ts           # Global constants
│   │   ├── logs/               # Log constants
│   │   └── table.ts            # Table constants
│   ├── context/                # Context providers
│   │   ├── adversaries/        # Adversary context
│   │   ├── alert/              # Alert context
│   │   ├── assistant/          # Assistant context
│   │   ├── feeds/              # Feeds context
│   │   ├── home/               # Home context
│   │   ├── logs/               # Logs context
│   │   ├── management/         # Management context
│   │   ├── rules/              # Rules context
│   │   ├── threat-intelligence/ # TI context
│   │   ├── user/               # User context
│   │   ├── utilities/          # Utilities context
│   │   └── socketContext.tsx   # WebSocket context
│   ├── hooks/                  # Custom hooks
│   │   ├── useDidMountEffect.tsx
│   │   ├── useFlyout.tsx
│   │   └── useUrlState.tsx
│   ├── layout/                 # Layout components
│   │   ├── component/          # Layout sub-components
│   │   ├── hooks/              # Layout hooks
│   │   └── index.tsx           # Main layout
│   ├── pages/                  # Page components
│   │   ├── adversaries/        # Adversary pages
│   │   ├── alerts/             # Alert pages
│   │   ├── assistant/          # Assistant pages
│   │   ├── authenticate/       # Auth pages
│   │   ├── boot/               # Boot page
│   │   ├── errors/             # Error pages
│   │   ├── feeds/              # Feed pages
│   │   ├── home/               # Home page
│   │   ├── logs/               # Log pages
│   │   ├── management/         # Management pages
│   │   ├── mitre/              # MITRE pages
│   │   ├── rules/              # Rule pages
│   │   ├── threat-intelligence/ # TI pages
│   │   └── user-management/    # User management pages
│   ├── reducer/                # State reducers
│   │   ├── adversaries/
│   │   ├── alert/
│   │   ├── assistant/
│   │   ├── feeds/
│   │   ├── home/
│   │   ├── logs/
│   │   ├── management/
│   │   ├── rules/
│   │   ├── threat-intelligence/
│   │   ├── user/
│   │   └── utilities/
│   ├── routes/                 # Routing configuration
│   │   ├── hook/               # Router hooks
│   │   ├── index.tsx           # Route provider
│   │   └── routes.tsx          # Route definitions
│   ├── services/               # Service layer
│   │   ├── auth.ts             # Auth service
│   │   └── system.ts           # System service
│   ├── types/                  # TypeScript types
│   │   ├── adversaries/
│   │   ├── alerts/
│   │   ├── assistant/
│   │   ├── auth/
│   │   ├── feeds/
│   │   ├── home/
│   │   ├── logs/
│   │   ├── management/
│   │   ├── rules/
│   │   ├── table/
│   │   ├── third-party/
│   │   ├── threat-intelligence/
│   │   ├── user/
│   │   ├── utilities/
│   │   ├── visuals/
│   │   ├── eui.d.ts            # EUI type extensions
│   │   ├── global.d.ts         # Global types
│   │   └── nivo-parallel-coordinates.d.ts
│   ├── utils/                  # Utility functions
│   │   ├── auth.ts             # Auth utilities
│   │   ├── compressFile.ts     # File compression
│   │   ├── index.ts            # General utilities
│   │   ├── navigation.ts       # Navigation helpers
│   │   ├── renderFormater.tsx  # Form renderers
│   │   └── toasts.tsx          # Toast notifications
│   ├── index.css               # Global styles
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type definitions
├── .dockerignore               # Docker ignore file
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── Dockerfile                  # Docker configuration
├── README.md                   # Project README
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json                # Package dependencies
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── vite.config.ts              # Vite configuration
└── yarn.lock                   # Yarn lock file
```


---

## State Management

### Context Provider Architecture

The application uses React Context API with useReducer for state management. Each feature has its own context provider following a consistent pattern.

### Context Providers (12 Total)

#### 1. UtilitiesProvider
**Location:** `src/context/utilities/utilities-context.tsx`

**Purpose:** System-level utilities and Elasticsearch authentication

**State:**
```typescript
{
  es_token: genericContext<string>
  system_available: genericContext<boolean>
}
```

**Actions:**
- `getESToken()` - Fetch Elasticsearch token
- `getSystemAvailable()` - Check system availability

---

#### 2. UserProvider
**Location:** `src/context/user/user-context.tsx`

**Purpose:** User management and authentication

**State:**
```typescript
{
  user: genericContext<user>
  users: genericContext<userTable>
  userForm: genericContext<userForm>
  isAdmin: boolean
}
```

**Actions:**
- `getUser()` - Get current user
- `getUsers()` - Get all users
- `createUser(data)` - Create new user
- `deleteUser(id)` - Delete user
- `changeUserPassword(password)` - Change password
- `getUserStatus()` - Get user status

---

#### 3. HomeProvider
**Location:** `src/context/home/home-context.tsx`

**Purpose:** Dashboard overview data

**State:**
```typescript
{
  dashboard: genericContext<homeDashboard>
}
```

**Actions:**
- `getDashboard()` - Fetch dashboard metrics

---

#### 4. ThreatIntelligenceProvider
**Location:** `src/context/threat-intelligence/threat-intelligence-context.tsx`

**Purpose:** Threat intelligence data management

**State:**
```typescript
{
  threatTable: genericContext<threatIntelligenceTable>
  threatMetadata: genericContext<fieldWithType[]>
  threatTIDashboard: genericContext<threatTIDashboard>
  threatMalwareDashboard: genericContext<threatMalwareDashboard>
  threatIPDashboard: genericContext<threatIPDashboard>
}
```

**Actions:**
- `getThreatTable(params)` - Fetch threat table with filters
- `getThreatMetadata()` - Get table metadata
- `getThreatTIDashboard()` - Get TI dashboard
- `getThreatMalwareDashboard()` - Get malware dashboard
- `getThreatIPDashboard()` - Get IP dashboard
- `editThreatConfidenceField(id, confidence)` - Edit confidence level

**Features:**
- Cursor-based pagination
- Advanced filtering
- Confidence level editing

---

#### 5. FeedsProvider
**Location:** `src/context/feeds/feeds-context.tsx`

**Purpose:** Feed source management

**State:**
```typescript
{
  feedsTable: genericContext<feedTable>
  feedsSecondTable: genericContext<feedTable>
  feedDetail: genericContext<feedDetail>
  feedDashboard: genericContext<feedDashboard>
  feedConfigurationConnectors: genericContext<feedConfigurationConnector[]>
  feedConfigurationFields: genericContext<feedConfigurationField[]>
  feedMarkdown: genericContext<string>
  feedOrganizationsMap: genericContext<genericMap[]>
}
```

**Actions:**
- `getFeedTable(params)` - Fetch feed table
- `getFeedDetail(id)` - Get feed details
- `getFeedDashboard()` - Get feed dashboard
- `getFeedConfigurationConnectors()` - Get connectors
- `getFeedConfigurationFields()` - Get configuration fields
- `editFeedConfidenceField(id, confidence)` - Edit confidence
- `editFeedReliabilityField(id, reliability)` - Edit reliability
- `submitFeedConfigurationFields(data)` - Submit configuration
- `cleanUpConnectors()` - Clean up connectors

**Features:**
- Reliability levels (A-F)
- Connector management
- Configuration submission

---

#### 6. AdversariesProvider
**Location:** `src/context/adversaries/adversaries-context.tsx`

**Purpose:** Adversary tracking and MITRE mapping

**State:**
```typescript
{
  adversaries: genericContext<adversary[]>
  adversary: genericContext<adversaryData>
  adversarySchedule: genericContext<adversarySchedule>
  adversariesDashboard: genericContext<adversariesDashboard>
  adversariesDetail: genericContext<adversariesDetail>
  mitres: genericContext<adversaryMitre[]>
}
```

**Actions:**
- `getAdversaries()` - Get all adversaries
- `getAdversaryData(id)` - Get adversary details
- `getAdversariesMitre(params)` - Get MITRE mappings
- `getAdversarySchedule(id)` - Get schedule
- `getAdversariesDashboard()` - Get dashboard
- `runAdversarySchedule(id)` - Run schedule

**Features:**
- MITRE ATT&CK integration
- Adversary scheduling
- Confidence tracking

---

#### 7. AlertProvider
**Location:** `src/context/alert/alert-context.tsx`

**Purpose:** Alert monitoring and analysis

**State:**
```typescript
{
  alerts_table: genericContext<alertTable>
  alerts_grouped: genericContext<alertGrouped[]>
  severity_levels: genericContext<kibanaDashboardBucketResponse>
  alerts_by_name: genericContext<kibanaDashboardBucketResponse>
  top_alerts: genericContext<kibanaDashboardBucketResponse>
  alert_detail: genericContext<alertDetail>
  alert_assistant: genericContext<alertAssistant>
  dateRange: DateRange
}
```

**Actions:**
- `getAlertsTable(params)` - Fetch alerts table
- `getAlertsGrouped(params)` - Get grouped alerts
- `getDashboard()` - Get dashboard data (severity, by name, top alerts)
- `getTopAlerts(params)` - Get top alerts
- `getAlertDetail(id)` - Get alert details
- `getAlertAssistant(id)` - Get AI assistant analysis
- `setDateRange(range)` - Set date filter

**Features:**
- Kibana integration
- Date range filtering
- Alert grouping
- Severity analysis
- AI assistant integration

---

#### 8. RulesProvider
**Location:** `src/context/rules/rules-context.tsx`

**Purpose:** Detection rule management

**State:**
```typescript
{
  rules: genericContext<rules>
  rule_pages: genericContext<number>
  mitre_coverage: genericContext<mitreCoverage[]>
  technique_rules: genericContext<ruleTechnique[]>
  rulesDashboard: genericContext<rulesDashboard>
  ruleDetail: genericContext<ruleDetail>
}
```

**Actions:**
- `getRules(params)` - Get rules with pagination
- `getRulePages()` - Get total pages
- `getMitreCoverage()` - Get MITRE coverage
- `getTechniqueRules(techniqueId)` - Get rules for technique
- `getRulesDashboard()` - Get dashboard
- `getRuleDetail(id)` - Get rule details
- `deleteRule(id)` - Delete rule
- `editRuleInterval(id, interval)` - Edit interval
- `runRuleManually(id)` - Run rule manually

**Features:**
- MITRE coverage analysis
- Rule scheduling
- Manual execution

---

#### 9. LogsProvider
**Location:** `src/context/logs/logs-context.tsx`

**Purpose:** Elasticsearch log querying

**State:**
```typescript
{
  logs: genericContext<logs>
  logDistributionDashboard: genericContext<logDistributionDashboard>
  logIndexDashboard: genericContext<logIndexDashboard>
  index_pattern: genericContext<string>
}
```

**Actions:**
- `getLogs(query)` - Query logs from Elasticsearch
- `getLogDistributionDashboard()` - Get distribution dashboard
- `getLogIndexDashboard()` - Get index dashboard
- `getIndexPattern()` - Get index pattern

**Features:**
- Elasticsearch DSL queries
- Index pattern management
- Log distribution analysis

---

#### 10. ManagementProvider
**Location:** `src/context/management/management-context.tsx`

**Purpose:** IOC and rule management

**State:**
```typescript
{
  management_table: genericContext<managementTable>
  injected_iocs: genericContext<managementInjectedIocs>
  management_rule_preview: genericContext<string>
}
```

**Actions:**
- `getManagementTable(params)` - Get management table
- `getInjectedIocs()` - Get injected IOCs
- `getManagementRulePreview(data)` - Preview rule
- `submitManagementRule(data)` - Submit rule
- `generalActions(action, data)` - General actions
- `deleteType(type, id)` - Delete by type

---

#### 11. AssistantProvider
**Location:** `src/context/assistant/assistant-context.tsx`

**Purpose:** AI assistant integration

**State:**
```typescript
{
  messages: Message[]
  assistantExplain: genericContext<assistantExplain[]>
  llm: string
  availableLlms: genericContext<string[]>
  isExplainVisible: boolean
}
```

**Actions:**
- `getAssistantExplain(query)` - Get AI explanation
- `getHelp(message)` - Get AI help
- `setMessages(messages)` - Update messages
- `setLlm(llm)` - Set LLM model
- `getAvailableLlms()` - Get available models
- `closeExplain()` - Close explanation modal

**Features:**
- Multi-LLM support
- Explanation modal
- Message history

---

#### 12. SocketConnectionWrapper
**Location:** `src/context/socketContext.tsx`

**Purpose:** WebSocket connection management

**State:**
```typescript
{
  socket: Socket | null
  connected: boolean
  sessionId: string | undefined
}
```

**Features:**
- Auto-reconnection
- Auth token passing
- Session management
- Connection status tracking

### Reducer Pattern

All reducers follow this consistent pattern:

```typescript
type State = {
  [key: string]: genericContext<T>
}

type Action = 
  | { type: "SET_KEY", payload: { key: string, data: T } }
  | { type: "SET_ISLOADING", payload: { key: string, state: boolean } }
  | { type: "CLEAR_KEY", payload: { key: string } }

function Reducer(state: State, action: Action): State {
  switch(action.type) {
    case "SET_KEY":
      return {
        ...state,
        [action.payload.key]: {
          data: action.payload.data,
          isLoading: false
        }
      }
    case "SET_ISLOADING":
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          isLoading: action.payload.state
        }
      }
    case "CLEAR_KEY":
      return {
        ...state,
        [action.payload.key]: {
          data: null,
          isLoading: false
        }
      }
    default:
      return state
  }
}
```

### Context Usage Example

```typescript
// In a component
import { useAlert } from '../context/alert/alert-context';

function AlertsPage() {
  const { alerts_table, getAlertsTable, setDateRange } = useAlert();

  useEffect(() => {
    getAlertsTable({ page: 1, limit: 20 });
  }, []);

  if (alerts_table.isLoading) {
    return <LoadingPrompt />;
  }

  return (
    <div>
      {alerts_table.data?.items.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```


---

## Routing & Navigation

### Router Configuration

The application uses React Router 7 with hash routing for client-side navigation.

**Router Setup:** `src/routes/hook/index.ts`

```typescript
export const router = createHashRouter(
  Routes.map((r) => enhanceRoute(r))
);
```

### Route Enhancement

Routes are enhanced with loaders for:
- **System availability check** - Redirects to boot page if system unavailable
- **Authentication check** - Redirects to auth page if not authenticated

```typescript
function enhanceRoute(route: Route, parentSecure = false): any {
  // System availability check
  if (route.path === "" && route.title === "boot") {
    route.loader = async () => {
      const available = await getSystemAvailable();
      if (!available) throw redirect("/system-not-available");
      return null;
    };
  }

  // Authentication check
  if (route.path === "" && route.title === "auth") {
    route.loader = async (args) => {
      if (!new Cookies().get('es_token')?.length)
        return await requireAuth(args);
    };
  }

  return route;
}
```

### Route Definitions

**Main Routes:** `src/routes/routes.tsx`

| Route | Component | Title | Secure | Sub-Page |
|-------|-----------|-------|--------|----------|
| `/` | Home | Home | No | No |
| `/adversaries` | Adversaries | Adversaries | No | No |
| `/adversaries/mitre/map` | AdversariesMitreMap | Adversaries MITRE Map | No | Yes |
| `/adversaries/mitre/specificity` | AdversariesMitreSpecificity | Adversaries MITRE Specificity | No | Yes |
| `/alerts` | Alerts | Alerts | No | No |
| `/alerts/:id` | AlertDetail | Alerts Detail | No | Yes |
| `/rules` | Rules | Rules | No | No |
| `/rules/coverage` | MitreCoverage | MITRE Coverage | No | Yes |
| `/logs` | Logs | Logs | No | No |
| `/threat-intelligence` | ThreatIntelligence | Threat Intelligence | No | No |
| `/feeds` | Feeds | Feed Sources | No | No |
| `/management` | Management | Management | No | No |
| `/user-management` | UserManagement | User Management | Yes | No |
| `/auth` | Authentication | Authenticate | No | No |
| `/system-not-available` | Boot | Boot | No | No |
| `*` | NotFound | Not found | No | No |

### Lazy Loading

All page components are lazy-loaded for better performance:

```typescript
const Home = lazy(() => import("../pages/home"));
const Alerts = lazy(() => import("../pages/alerts"));
const Rules = lazy(() => import("../pages/rules"));
// ... etc
```

### Navigation Utilities

**Navigation Helper:** `src/utils/navigation.ts`

```typescript
export const navigateTo = (path: string) => {
  if (navigateFn) {
    navigateFn(path);
  } else {
    window.location.href = path;
  }
};
```

### Layout Structure

```
┌─────────────────────────────────────────┐
│              Header                      │
│  [Menu] [Logo] [User] [Assistant]       │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │     Main Content             │
│          │                              │
│ - Home   │  ┌────────────────────────┐  │
│ - Alerts │  │                        │  │
│ - Rules  │  │   Page Component       │  │
│ - Logs   │  │                        │  │
│ - ...    │  │                        │  │
│          │  └────────────────────────┘  │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Route Guards

**Authentication Guard:** `src/services/auth.ts`

```typescript
export async function requireAuth({ request }: { request: Request }) {
  const cookies = new Cookies();

  // Check for ES token
  if (cookies.get("es_token")) {
    return { encoded: cookies.get("es_token") };
  }

  // Redirect to auth if no token
  const url = new URL(request.url);
  const redirectTo = new URL("auth", url);
  redirectTo.searchParams.set("returnTo", url.pathname + url.search);

  const authB64 = cookies.get("auth");
  if (!authB64) {
    throw redirect(redirectTo.toString());
  }

  // Fetch ES token
  try {
    const res = await fetch(AR_GET_ES_TOKEN, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Basic ${authB64}`,
      },
    });

    if (!res.ok) {
      throw redirect(redirectTo.toString());
    }

    return await res.json();
  } catch {
    throw redirect(redirectTo.toString());
  }
}
```

**System Availability Guard:** `src/services/system.ts`

```typescript
export async function getSystemAvailable(refetch = false): Promise<boolean> {
  if (_available !== null && !refetch) return _available;

  try {
    const res = await fetch(AR_GET_SYSTEM_AVAILABLE, { method: "GET" });
    _available = res.ok;
  } catch {
    _available = false;
  }

  return _available;
}
```


---

## API Integration

### API Configuration

**Environment Variables:** `src/api/routes/index.ts`

```typescript
export const API_ROOT = import.meta.env.VITE_API_ROOT;
export const KIBANA_API_ROOT = import.meta.env.VITE_KIBANA_API_ROOT;
export const ELASTIC_API_ROOT = import.meta.env.VITE_ELASTIC_API_ROOT;
export const WEBSOCKET_API_ROOT = import.meta.env.VITE_SOCKET_IO_ROOT;
```

### Request Utility

**Centralized HTTP Client:** `src/api/utils/request.ts`

```typescript
async function request<T>({
  url: string,
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: unknown,
  validate?: (data: any) => data is T,
  config?: RequestInit,
  signal?: AbortSignal,
  silence?: boolean
}): Promise<T>
```

**Features:**
- Automatic auth header injection from cookies
- Error handling with toast notifications
- 401 redirect to auth page
- Response validation support
- Silent mode for non-critical requests
- Request cancellation via AbortSignal

**Example Usage:**

```typescript
import { request } from '../api/utils/request';

// Simple GET request
const data = await request<AlertTable>({
  url: `${API_ROOT}/alerts`,
  method: 'GET'
});

// POST request with data
const result = await request<CreateUserResponse>({
  url: `${API_ROOT}/users`,
  method: 'POST',
  data: { username: 'john', password: 'secret' }
});

// Request with cancellation
const controller = new AbortController();
const data = await request<Logs>({
  url: `${API_ROOT}/logs`,
  signal: controller.signal
});

// Silent request (no error toast)
const data = await request<SystemStatus>({
  url: `${API_ROOT}/status`,
  silence: true
});
```

### Query String Builder

**Utility:** `src/api/utils/buildQuery.ts`

```typescript
export function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, String(params[key]));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
```

**Example:**

```typescript
const query = buildQuery({ page: 1, limit: 20, status: 'active' });
// Returns: "?page=1&limit=20&status=active"
```

### API Endpoint Modules

#### Adversaries API
**Location:** `src/api/routes/adversaries/`

- `GET /adversaries` - List adversaries
- `GET /adversaries/:id` - Get adversary details
- `GET /adversaries/mitre` - Get MITRE mappings
- `GET /adversaries/:id/schedule` - Get schedule
- `POST /adversaries/:id/schedule/run` - Run schedule
- `GET /adversaries/dashboard` - Get dashboard

#### Alert API
**Location:** `src/api/routes/alert/`

- `GET /kibana/alerts` - List alerts from Kibana
- `GET /kibana/alerts/grouped` - Get grouped alerts
- `GET /kibana/alerts/dashboard` - Get dashboard data
- `GET /kibana/alerts/:id` - Get alert details
- `GET /alerts/:id/assistant` - Get AI assistant analysis

#### Assistant API
**Location:** `src/api/routes/assistant/`

- `POST /assistant/explain` - Get AI explanation
- `POST /assistant/help` - Get AI help
- `GET /assistant/llms` - Get available LLMs
- `POST /assistant/llm` - Set LLM model

#### Feed API
**Location:** `src/api/routes/feed/`

- `GET /feeds` - List feeds
- `GET /feeds/:id` - Get feed details
- `GET /feeds/dashboard` - Get dashboard
- `GET /feeds/connectors` - Get connectors
- `GET /feeds/configuration` - Get configuration
- `POST /feeds/configuration` - Submit configuration
- `PATCH /feeds/:id/confidence` - Edit confidence
- `PATCH /feeds/:id/reliability` - Edit reliability
- `POST /feeds/connectors/cleanup` - Clean up connectors

#### Home API
**Location:** `src/api/routes/home/`

- `GET /dashboard` - Get home dashboard

#### Log API
**Location:** `src/api/routes/log/`

- `POST /logs/query` - Query logs from Elasticsearch
- `GET /logs/distribution` - Get distribution dashboard
- `GET /logs/index` - Get index dashboard
- `GET /logs/index-pattern` - Get index pattern

#### Management API
**Location:** `src/api/routes/management/`

- `GET /management` - Get management table
- `GET /management/iocs` - Get injected IOCs
- `POST /management/rule/preview` - Preview rule
- `POST /management/rule` - Submit rule
- `POST /management/action` - General actions
- `DELETE /management/:type/:id` - Delete by type

#### Rule API
**Location:** `src/api/routes/rule/`

- `GET /rules` - List rules
- `GET /rules/pages` - Get total pages
- `GET /rules/:id` - Get rule details
- `GET /rules/mitre/coverage` - Get MITRE coverage
- `GET /rules/mitre/:techniqueId` - Get rules for technique
- `GET /rules/dashboard` - Get dashboard
- `DELETE /rules/:id` - Delete rule
- `PATCH /rules/:id/interval` - Edit interval
- `POST /rules/:id/run` - Run rule manually

#### Threat Intelligence API
**Location:** `src/api/routes/threat-intelligence/`

- `GET /threat-intelligence` - Get threat table
- `GET /threat-intelligence/metadata` - Get metadata
- `GET /threat-intelligence/dashboard/ti` - Get TI dashboard
- `GET /threat-intelligence/dashboard/malware` - Get malware dashboard
- `GET /threat-intelligence/dashboard/ip` - Get IP dashboard
- `PATCH /threat-intelligence/:id/confidence` - Edit confidence

#### User API
**Location:** `src/api/routes/user/`

- `GET /users` - List users
- `GET /users/me` - Get current user
- `POST /users` - Create user
- `DELETE /users/:id` - Delete user
- `POST /users/password` - Change password
- `GET /users/status` - Get user status

#### Utilities API
**Location:** `src/api/routes/utilities/`

- `GET /utilities/es-token` - Get Elasticsearch token
- `GET /utilities/system-available` - Check system availability

### Error Handling

**API Error Response:**

```typescript
type ApiResponseError = {
  detail: [
    {
      loc: unknown,
      msg: string,
      type: string
    }
  ]
}
```

**Error Handling Flow:**

1. Request fails or returns non-2xx status
2. Error is caught in request utility
3. If 401: Clear cookies and redirect to auth
4. If other error: Show toast notification (unless silent mode)
5. Throw error for component to handle

### Response Compression

**Kibana responses are compressed with pako:**

```typescript
import { decodeCompressedBase64 } from '../utils';

const compressed = await request<string>({
  url: `${KIBANA_API_ROOT}/dashboard`
});

const data = decodeCompressedBase64<DashboardData>(compressed);
```


---

## Components

### Reusable Component Library

#### Charts (`src/components/Charts/`)

**MetricChart**
- Displays single metric value
- Props: `IMetricChart`
- Use case: KPIs, counts, percentages

**PieChart**
- Circular chart for proportions
- Data: `PieSlice[]`
- Use case: Category distributions

**BarChart**
- Vertical/horizontal bar charts
- Data: `BarSlice`
- Use case: Comparisons

**AreaChart**
- Area chart for trends
- Use case: Time series data

**GoalChart**
- Progress towards goal
- Use case: Completion tracking

**RangeBarChart**
- Bar chart with ranges
- Data: `RangedBarDatum[]`
- Use case: Min/max values

**StackedBarChart**
- Stacked bar chart
- Data: `StackedBarDatum[]`
- Use case: Multi-category comparisons

**TreeMapChart**
- Hierarchical data visualization
- Use case: Nested categories

**Nivo Charts:**
- `CalendarHeatmap` - Calendar-based heatmap
- `ChordDiagram` - Relationship visualization
- `Heatmap` - 2D heatmap
- `NetworkGraph` - Graph visualization with Sigma.js
- `ParallelCoordinates` - Multi-dimensional data

---

#### DataTable (`src/components/DataTable/`)

**Generic table component with advanced features:**

**Props:** `ITableProps`

```typescript
interface ITableProps {
  columns: genericTableColumn[]
  data: genericTableRow[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
  filters?: Filter[]
  onFilterChange?: (filters: Filter[]) => void
  actions?: tableActions[]
  onAction?: (action: tableActions, row: genericTableRow) => void
}
```

**Features:**
- Sorting
- Filtering (text, number, enum, tag, date)
- Pagination
- Row actions (edit, delete, star, inject, etc.)
- Custom cell renderers
- Loading states

**Column Types:**
- `text` - Plain text
- `long_text` - Truncated text with tooltip
- `number` - Numeric values
- `date` - Formatted dates
- `score` - Score/rating display
- `labels` - Tag/badge display
- `length` - Array length
- `health` - Health status indicator
- `bool` - Boolean checkbox
- `editable_text` - Inline editable text
- `editable_reliability` - Reliability level editor
- `external_references` - External links
- `action` - Action buttons
- `json` - JSON viewer
- `warn_sign` - Warning indicator

**Sub-components:**
- `AppliedFilters` - Display active filters
- `FilterControls` - Filter UI controls
- `Pagination` - Pagination controls

**Example:**

```typescript
<DataTable
  columns={[
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'count', label: 'Count', type: 'number', filterable: true },
    { key: 'created', label: 'Created', type: 'date' },
    { key: 'actions', label: 'Actions', type: 'action' }
  ]}
  data={items}
  loading={isLoading}
  pagination={{
    page: 1,
    limit: 20,
    total: 100,
    onPageChange: (page) => fetchData(page)
  }}
  actions={['edit', 'delete']}
  onAction={(action, row) => handleAction(action, row)}
/>
```

---

#### Form (`src/components/Form/`)

**Form component for configuration:**

**Props:** `GroupedFormData`

```typescript
interface GroupedFormData {
  groups: FormGroup[]
}

interface FormGroup {
  title: string
  fields: InputField[]
}

interface InputField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea'
  value: any
  options?: { label: string, value: any }[]
  required?: boolean
  disabled?: boolean
}
```

**Features:**
- Grouped fields
- Validation
- Multiple input types
- Dynamic field rendering

---

#### LoadingPrompt (`src/components/LoadingPrompt/`)

**Loading indicator component:**

**Props:** `LoadingPromptProps`

```typescript
interface LoadingPromptProps {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
  message?: string
}
```

**Components:**
- `LoadingPrompt` - Full loading overlay
- `LoadingSpinner` - Spinner only

**Example:**

```typescript
{isLoading ? (
  <LoadingPrompt size="xl" message="Loading data..." />
) : (
  <DataDisplay data={data} />
)}
```

---

#### Maps (`src/components/Maps/`)

**Leaflet-based map component:**

**Features:**
- Interactive maps
- Marker clustering
- Custom markers
- Popup information

**Data:** `genericMap[]`

```typescript
interface genericMap<T = string> {
  latitude: number
  longitude: number
  label: T
  description: string
}
```

---

#### PopConfirm (`src/components/PopConfirm/`)

**Confirmation dialog component:**

**Features:**
- Confirm/cancel actions
- Custom messages
- Async action support

**Example:**

```typescript
<PopConfirm
  title="Delete User"
  message="Are you sure you want to delete this user?"
  onConfirm={() => deleteUser(id)}
  onCancel={() => closeDialog()}
/>
```

---

### Component Composition Pattern

**Example: Alert Card Component**

```typescript
import { EuiCard, EuiBadge } from '@elastic/eui';
import { formatDate } from '../utils';

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  return (
    <EuiCard
      title={alert.name}
      description={alert.description}
      onClick={onClick}
      footer={
        <>
          <EuiBadge color={getSeverityColor(alert.severity)}>
            {alert.severity}
          </EuiBadge>
          <span>{formatDate(alert.timestamp)}</span>
        </>
      }
    />
  );
};
```


---

## Pages & Features

### Home Page (`/`)
**Location:** `src/pages/home/`

**Purpose:** Dashboard overview with key metrics

**Features:**
- System health indicators
- Alert summary
- Rule coverage metrics
- Threat intelligence statistics
- Recent activity feed

**Components:**
- `HomeHeader` - Page header with filters
- `Statistics` - Dashboard cards

---

### Adversaries (`/adversaries`)
**Location:** `src/pages/adversaries/`

**Purpose:** Track threat actors and adversary groups

**Features:**
- Adversary list with search/filter
- Adversary details with sections
- MITRE ATT&CK technique mapping
- Confidence scoring
- Warning signs
- Schedule management

**Sub-pages:**
- `/adversaries/mitre/map` - MITRE ATT&CK heatmap visualization
- `/adversaries/mitre/specificity` - Technique specificity analysis

**Components:**
- `AdversariesHeader` - Page header
- `AdversariesDashboard` - Dashboard view
- `AdversaryTable` - Adversary list
- `AdversaryDetail` - Detail view
- `AdversaryModal` - Create/edit modal
- `AdversaryFlyout` - Side panel details

---

### Alerts (`/alerts`)
**Location:** `src/pages/alerts/`

**Purpose:** Monitor and analyze security alerts

**Features:**
- Alert table with filtering
- Grouped alerts view
- Severity level analysis
- Top alerts dashboard
- Date range filtering
- Alert detail view
- AI assistant analysis

**Sub-pages:**
- `/alerts/:id` - Alert detail page with logs, rules, statistics, threats

**Components:**
- `AlertsHeader` - Page header with date picker
- `AlertsTable` - Alert list
- `AlertsGrouped` - Grouped view
- `SeverityLevels` - Severity distribution
- `TopAlerts` - Top alerts widget
- `AlertsByName` - Alerts by name chart
- `AlertDetailHeader` - Detail page header
- `AlertDetailLogs` - Associated logs
- `AlertDetailRules` - Triggered rules
- `AlertDetailStatistics` - Statistics
- `AlertDetailThreats` - Related threats

**Tabs:**
- Overview
- Logs
- Rules
- Statistics
- Threats

---

### Rules (`/rules`)
**Location:** `src/pages/rules/`

**Purpose:** Manage detection rules

**Features:**
- Rule list with pagination
- Rule details
- MITRE coverage analysis
- Rule scheduling
- Manual rule execution
- Rule deletion
- Interval editing

**Sub-pages:**
- `/rules/coverage` - MITRE ATT&CK coverage heatmap

**Components:**
- `RulesHeader` - Page header
- `RulesDashboard` - Dashboard metrics
- `RulesTable` - Rule list
- `RulesFlyout` - Rule details flyout

---

### Logs (`/logs`)
**Location:** `src/pages/logs/`

**Purpose:** Search and analyze logs from Elasticsearch

**Features:**
- Elasticsearch query builder
- Log table with pagination
- Log detail view
- Index pattern selection
- Time range filtering
- Field filtering
- Log distribution dashboard
- Index dashboard

**Components:**
- `OpenctiLogsHeader` - Page header
- `LogsToolbar` - Query builder toolbar
- `LogsTable` - Log list
- `LogsTableRow` - Log row with expand
- `LogsPagination` - Pagination controls
- `LogDetailsFlyout` - Log details flyout
- `NoLogsPlaceholder` - Empty state

**Utilities:**
- `flattenObject` - Flatten nested log objects
- `logsUtils` - Log formatting utilities
- `timeRange` - Time range helpers

---

### Threat Intelligence (`/threat-intelligence`)
**Location:** `src/pages/threat-intelligence/`

**Purpose:** Manage threat intelligence indicators

**Features:**
- Threat indicator table
- Cursor-based pagination
- Advanced filtering
- Confidence editing
- TI dashboard
- Malware dashboard
- IP dashboard
- Metadata management

**Components:**
- `TIHeader` - Page header
- `TITable` - Threat indicator table
- `TIFlyout` - Indicator details flyout
- `Statistics` - Dashboard widgets
  - `tiDashboard` - TI metrics
  - `malwareDashboard` - Malware analysis
  - `ipDashboard` - IP analysis

---

### Feeds (`/feeds`)
**Location:** `src/pages/feeds/`

**Purpose:** Manage threat intelligence feed sources

**Features:**
- Feed source list
- Connector management
- Configuration management
- Reliability levels (A-F)
- Confidence editing
- Feed dashboard
- Organization map
- Markdown documentation

**Components:**
- `FeedsHeader` - Page header
- `FeedTables` - Feed tables
  - `Connectors` - Connector table
  - `Organization` - Organization table
- `FeedsFlyout` - Feed details flyout

---

### Management (`/management`)
**Location:** `src/pages/management/`

**Purpose:** Manage IOCs and rules

**Features:**
- Management table
- IOC injection
- Rule preview
- Rule submission
- General actions
- Type-based deletion

**Components:**
- `ManagementHeader` - Page header
- `ManagementTable` - Management table
- `ManagementModal` - Create/edit modal
  - `CreateManagementModalForm` - Form component
- `ManagementFlyout` - Details flyout

---

### User Management (`/user-management`)
**Location:** `src/pages/user-management/`

**Purpose:** Manage users and permissions (Admin only)

**Features:**
- User list
- User creation
- User deletion
- Password management
- Role assignment
- User status

**Components:**
- `UserManagementHeader` - Page header
- `UserManagementTable` - User table
- `UserManagementModal` - Create/edit modal
- `ChangePasswordModal` - Password change modal
- `UserManagementFlyout` - User details flyout

**Security:**
- Marked as `secure: true` in routes
- Admin-only access

---

### MITRE Pages (`/rules/coverage`, `/adversaries/mitre/*`)
**Location:** `src/pages/mitre/`

**Purpose:** MITRE ATT&CK framework visualization

**Features:**
- Coverage heatmap
- APT group mapping
- Technique specificity
- Interactive matrix
- Technique details
- Rule mapping

**Components:**
- `MitreCoverage` - Coverage page
- `MitreAPT` - APT mapping page
- `Shared/MitreColumn` - Matrix column
- `Shared/TechniqueCard` - Technique card
- `Shared/MitrePanelHeader` - Panel header
- `Coverage/LegendBar` - Coverage legend
- `APT/GroupSelector` - APT group selector
- `APT/LegendBar` - APT legend

---

### Authentication (`/auth`)
**Location:** `src/pages/authenticate/`

**Purpose:** User authentication

**Features:**
- Login form
- Basic auth
- Cookie management
- Redirect after login

---

### Boot Page (`/system-not-available`)
**Location:** `src/pages/boot/`

**Purpose:** System availability check

**Features:**
- System status display
- Retry mechanism
- Loading indicator

---

### Error Page (`*`)
**Location:** `src/pages/errors/`

**Purpose:** 404 and error handling

**Features:**
- 404 page
- Error message display
- Navigation back to home

---

### Assistant Flyout
**Location:** `src/pages/assistant/`

**Purpose:** AI assistant interface

**Features:**
- Chat interface
- Message history
- LLM selection
- Explanation modal
- Real-time responses via WebSocket

**Components:**
- `AssistantFlyout` - Main flyout
- `Messaging` - Chat interface
- `MessagingInput` - Message input


---

## Type System

### Global Types (`src/types/global.d.ts`)

**API Response Status:**
```typescript
type apiResponseStatus = 'success' | 'failed' | 'pending'
```

**Generic Context:**
```typescript
interface genericContext<T> {
  data: T | null
  isLoading: boolean
}
```

**Generic Object:**
```typescript
interface genericObject<T> {
  [key: string]: T
}
```

**Field with Type:**
```typescript
interface fieldWithType<T = string> {
  key: string
  value: T
  type: tableColumnTypes
}
```

**Visualization Types:**
```typescript
type statisticsCardTypes = "MetricVisual" | "PieVisual" | "BarVisual" | "TableVisual"

type MetricVisual = string
type PieVisual = PieSlice[]
type BarVisual = genericTable<string[] | number>
type TableVisual = BarSlice

interface PieSlice {
  name: string
  percent: number
}

interface BarSlice {
  x_title: string
  y_title: string
  x_accessor: string
  y_accessors: string[]
  data: genericObject<string | number>[]
}

interface StackedBarDatum {
  x: number | string
  y: number | null
  group: string
}

interface RangedBarDatum {
  name: string
  min: number
  max: number
}
```

**Visual Card:**
```typescript
type visualCard = {
  [K in statisticsCardTypes]: {
    type: K
    data: {
      title: string
      description: string
      value: statisticsCardValue[K]
    }
  }
}[statisticsCardTypes]
```

**Map Data:**
```typescript
interface genericMap<T = string> {
  latitude: number
  longitude: number
  label: T
  description: string
}
```

**Base Date Data:**
```typescript
type baseDateData = {
  createdAt: string
  updatedAt: string
}
```

---

### Table Types (`src/types/table/index.ts`)

**Column Types:**
```typescript
type tableColumnTypes = 
  | "text" 
  | "long_text" 
  | "number" 
  | "date" 
  | "score" 
  | "labels" 
  | "length" 
  | "health" 
  | "hidden" 
  | "bool" 
  | "editable_text" 
  | "editable_reliability" 
  | "external_references" 
  | "action" 
  | "json" 
  | "warn_sign"
```

**Filter Types:**
```typescript
type tableColumnFilters = 
  | "TextFilter" 
  | "NumberFilter" 
  | "EnumFilter" 
  | "TagFilter" 
  | "DateFilter"
```

**Action Types:**
```typescript
type tableActions = 
  | "edit" 
  | "delete" 
  | "star" 
  | "cancel" 
  | "inject" 
  | "re-inject"
```

---

### Alert Types (`src/types/alerts/index.ts`)

**Alert:**
```typescript
interface alert {
  id: string
  name: string
  severity: severities
  timestamp: string
  description: string
  source: string
  status: string
}
```

**Alert Table:**
```typescript
interface alertTable {
  items: alert[]
  total: number
  page: number
  limit: number
}
```

**Alert Grouped:**
```typescript
interface alertGrouped {
  key: string
  count: number
  alerts: alert[]
}
```

**Alert Detail:**
```typescript
interface alertDetail {
  alert: alert
  logs: log[]
  rules: rule[]
  statistics: statistic[]
  threats: threat[]
}
```

**Date Range:**
```typescript
interface DateRange {
  from: string
  to: string
}
```

---

### Adversary Types (`src/types/adversaries/index.ts`)

**Adversary:**
```typescript
interface adversary {
  id: string
  name: string
  sources: string[]
  warn_sign: boolean
  is_important: boolean
  confidence: number
}
```

**Adversary Data:**
```typescript
interface adversaryData extends adversary {
  sections: adversarySection[]
}

interface adversarySection {
  title: string
  content: string
}
```

**Adversary MITRE:**
```typescript
interface adversaryMitre {
  adversary_id: string
  technique_id: string
  technique_name: string
  tactic: string
  confidence: number
}
```

**Adversary Schedule:**
```typescript
interface adversarySchedule {
  id: string
  adversary_id: string
  cron: string
  enabled: boolean
  last_run: string
  next_run: string
}
```

---

### Feed Types (`src/types/feeds/index.ts`)

**Feed:**
```typescript
interface feed {
  id: string
  name: string
  source: string
  confidence: number
  reliability: reliabilityLevel
  enabled: boolean
  last_update: string
}
```

**Reliability Level:**
```typescript
type reliabilityLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
```

**Feed Configuration Connector:**
```typescript
interface feedConfigurationConnector {
  id: string
  name: string
  type: string
  config: Record<string, any>
  enabled: boolean
}
```

---

### Rule Types (`src/types/rules/index.ts`)

**Rule:**
```typescript
interface rule {
  id: string
  name: string
  description: string
  severity: severities
  enabled: boolean
  interval: string
  last_run: string
  next_run: string
}
```

**MITRE Coverage:**
```typescript
interface mitreCoverage {
  technique_id: string
  technique_name: string
  tactic: string
  rule_count: number
  coverage_percentage: number
}
```

**Rule Technique:**
```typescript
interface ruleTechnique {
  rule_id: string
  rule_name: string
  technique_id: string
  technique_name: string
}
```

---

### Log Types (`src/types/logs/index.ts`)

**Logs:**
```typescript
interface logs {
  hits: logHit[]
  total: number
  took: number
}

interface logHit {
  _id: string
  _source: Record<string, any>
  _index: string
  _score: number
}
```

**ES Query:**
```typescript
interface esQuery {
  query: {
    bool: {
      must?: any[]
      filter?: any[]
      should?: any[]
      must_not?: any[]
    }
  }
  size?: number
  from?: number
  sort?: any[]
}
```

---

### User Types (`src/types/user/index.ts`)

**User:**
```typescript
interface user {
  id: string
  username: string
  email: string
  role: userRole
  created_at: string
  last_login: string
}

type userRole = 'admin' | 'analyst' | 'viewer'
```

**User Create:**
```typescript
interface userCreate {
  username: string
  email: string
  password: string
  role: userRole
}
```

---

### Third-Party Types (`src/types/third-party/index.ts`)

**Severities:**
```typescript
type severities = 'critical' | 'high' | 'medium' | 'low' | 'informational'
```

**Kibana Bucket Response:**
```typescript
interface kibanaDashboardBucketResponse {
  buckets: keyedBucket[]
}

interface keyedBucket {
  key: string
  doc_count: number
}
```


---

## Utilities & Helpers

### General Utilities (`src/utils/index.ts`)

**Class Name Utility:**
```typescript
function cn(...inputs: ClassValue[]): string
```
Merges Tailwind CSS classes using clsx and tailwind-merge.

**Number Formatting:**
```typescript
function numberFormatter(num: number): string
```
Formats numbers with K/M/G/T/P/E suffixes (e.g., 1000 → "1k", 1000000 → "1M").

```typescript
function formatNumber(num: number): string
```
Formats numbers with B/M/K suffixes (e.g., 1000000 → "1M").

```typescript
function roundToNearestTen(num: number): number
```
Rounds number to nearest 10.

**Date Formatting:**
```typescript
function formatDate(v: string | number, compressed?: boolean): string
```
Formats dates as "YYYY/MM/DD HH:mm:ss" or "YYYY/MM/DD" if compressed.

**ID Generation:**
```typescript
function generateUniqueId(): string
```
Generates unique ID with format "id-xxxxxxxxx".

**Random Number:**
```typescript
function stringSeededRandomInRange(seed: string, min: number, max: number): number
```
Generates deterministic random number from string seed.

**Operator Formatting:**
```typescript
function formatOperator(op: string): tableFilterOperators
```
Converts operator string to filter operator object.

```typescript
function formatOperatorToLabel(value: string): string
```
Converts operator value to label.

**Compression:**
```typescript
function decodeCompressedBase64<T>(encodedData: string): T | null
```
Decodes and decompresses base64-encoded data using pako.

---

### Authentication Utilities (`src/utils/auth.ts`)

**Cookie Management:**
```typescript
function setAuthCookie(b64: string): void
```
Sets auth cookie with 8-hour expiration.

```typescript
function getAuthCookie(): string
```
Gets auth cookie value.

```typescript
function clearAuthCookie(): void
```
Clears auth cookie.

```typescript
function setEsTokenCookie(token: string): void
```
Sets Elasticsearch token cookie.

```typescript
function getEsCookie(): string
```
Gets Elasticsearch token cookie.

```typescript
function clearEsTokenCookie(): void
```
Clears Elasticsearch token cookie.

**Navigation:**
```typescript
function loginRedirect(to: string): void
```
Redirects after login with state.

---

### Navigation Utilities (`src/utils/navigation.ts`)

**Navigation Helper:**
```typescript
function setNavigate(navigate: (path: string) => void): void
```
Sets global navigate function.

```typescript
function navigateTo(path: string): void
```
Navigates to path or falls back to window.location.

---

### Toast Notifications (`src/utils/toasts.tsx`)

**Toast Utility:**
```typescript
function Toastify({ type, message }: {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
}): void
```

**Configuration:**
- Position: bottom-right
- Auto-close: 5 seconds
- Transition: Zoom
- Theme: light

**Example:**
```typescript
Toastify({ type: 'success', message: 'User created successfully' });
Toastify({ type: 'error', message: 'Failed to delete rule' });
```

---

### File Compression (`src/utils/compressFile.ts`)

Utilities for file compression and decompression using pako and fflate.

---

### Form Rendering (`src/utils/renderFormater.tsx`)

Utilities for rendering form fields with proper formatting and validation.

---

### Log Utilities (`src/pages/logs/utils/`)

**Flatten Object:**
```typescript
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any>
```
Flattens nested objects for display.

**Log Utils:**
```typescript
function formatLogField(key: string, value: any): string
```
Formats log field for display.

**Time Range:**
```typescript
function parseTimeRange(range: string): { from: Date, to: Date }
```
Parses Elasticsearch time range strings (e.g., "now-15m", "now/d").


---

## Hooks

### Custom Hooks

#### useDidMountEffect
**Location:** `src/hooks/useDidMountEffect.tsx`

**Purpose:** Execute callback only after component mount (skip first render)

**Signature:**
```typescript
function useDidMountEffect(
  callback: () => void, 
  dependencies: DependencyList
): void
```

**Example:**
```typescript
useDidMountEffect(() => {
  fetchData();
}, [filters]);
```

---

#### useFlyout
**Location:** `src/hooks/useFlyout.tsx`

**Purpose:** Manage flyout/modal visibility state

**Signature:**
```typescript
function useFlyout(initial: boolean): {
  isFlyoutVisible: boolean
  handleOpenFlyout: () => void
  handleCloseFlyout: () => void
  handleToggleFlyout: () => void
}
```

**Example:**
```typescript
const flyout = useFlyout(false);

<EuiButton onClick={flyout.handleOpenFlyout}>
  Open Details
</EuiButton>

<EuiFlyout
  isVisible={flyout.isFlyoutVisible}
  onClose={flyout.handleCloseFlyout}
>
  {/* Flyout content */}
</EuiFlyout>
```

---

#### useUrlState
**Location:** `src/hooks/useUrlState.tsx`

**Purpose:** Sync state with URL query parameters

**Signature:**
```typescript
function useUrlState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, (value: T) => void]
```

**Features:**
- Persists state in URL
- Supports lazy default values
- Type-safe
- Automatic serialization/deserialization

**Example:**
```typescript
const [page, setPage] = useUrlState('page', 1);
const [filters, setFilters] = useUrlState('filters', () => []);

// URL: /?page=2&filters=[{"key":"status","value":"active"}]
```

---

### Context Hooks

All context providers expose custom hooks:

```typescript
// Alert context
const { alerts_table, getAlertsTable, setDateRange } = useAlert();

// Adversaries context
const { adversaries, getAdversaries, getAdversaryData } = useAdversaries();

// Assistant context
const { messages, getHelp, setLlm } = useAssistant();

// Feeds context
const { feedsTable, getFeedTable, editFeedConfidenceField } = useFeeds();

// Home context
const { dashboard, getDashboard } = useHome();

// Logs context
const { logs, getLogs, getIndexPattern } = useLogs();

// Management context
const { management_table, getManagementTable, submitManagementRule } = useManagement();

// Rules context
const { rules, getRules, getMitreCoverage } = useRules();

// Socket context
const { socket, connected, sessionId } = useSocket();

// Threat Intelligence context
const { threatTable, getThreatTable, editThreatConfidenceField } = useThreatIntelligence();

// User context
const { user, getUser, createUser, deleteUser } = useUser();

// Utilities context
const { es_token, getESToken, getSystemAvailable } = useUtilities();
```

---

### Layout Hooks

#### useInactivityTimeout
**Location:** `src/layout/hooks/useInactiveTimeout.tsx`

**Purpose:** Auto-logout after inactivity period

**Features:**
- Tracks user activity (mouse, keyboard)
- Configurable timeout duration
- Automatic logout on timeout

---

### Table Hooks

#### usePagination
**Location:** `src/components/DataTable/hooks/usePagination.ts`

**Purpose:** Manage table pagination state

**Signature:**
```typescript
function usePagination(initialPage = 1, initialLimit = 20): {
  page: number
  limit: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  reset: () => void
}
```

---

### Page-Specific Hooks

#### useLogsFetcher
**Location:** `src/pages/logs/hooks/useLogsFetcher.ts`

**Purpose:** Fetch logs with query management

**Features:**
- Query building
- Request cancellation
- Error handling
- Loading states


---

## Constants & Configuration

### Global Constants (`src/constants/global.ts`)

```typescript
export const INITIAL_REDUCER_DATA = {
  data: null,
  isLoading: true
}

export const PAGINATION_INITIAL = { 
  page: 1, 
  limit: 10 
}
```

---

### Table Constants (`src/constants/table.ts`)

**Page Size:**
```typescript
export const page_size = 20;
```

**Filter Operators:**
```typescript
export const table_filter_operators: genericObject<tableFilterOperators> = {
  "gt": { label: 'Greater than', value: '>' },
  "lt": { label: 'Less than', value: '<' },
  "eq": { label: 'Equal to', value: '=' },
  "gte": { label: 'Greater than or equal to', value: '≥' },
  "lte": { label: 'Less than or equal to', value: '≤' },
  "not_eq": { label: 'Not equal to', value: '≠' },
  "contains": { label: "Contains the", value: 'contains' },
  "not_contains": { label: "Not Contains the", value: 'not contains' },
  "search": { label: "Search", value: 'search' },
  "nil": { label: "Empty", value: 'is empty' },
  "not_nil": { label: "Not empty", value: "is not empty" }
}
```

**Initial Table Params:**
```typescript
export const initial_table_params: threatIntelligenceTableParams = {
  cursor: null,
  page_size: page_size,
  filters: []
}
```

---

### Color Constants (`src/constants/colors.ts`)

**Badge Colors:**
```typescript
export const badge_colors = [
  '#0fa3b1', '#b5e2fa', '#eddea4', '#f7a072', 
  '#F0F0F0', '#E0E0E0', '#D9EAD3', '#CFE2F3',
  '#F9CB9C', '#F6B93B', '#D1C4E9', '#B2EBF2',
  '#FFCCBC', '#FFEB3B', '#B2DFDB', '#FFABAB',
  '#FFE0B2', '#C8E6C9', '#FFCC80'
]
```

---

### Feed Constants (`src/constants/feeds/`)

Feed-specific configuration constants including:
- Reliability level definitions
- Confidence score ranges
- Feed source types

---

### Log Constants (`src/constants/logs/`)

Log-specific configuration constants including:
- Default query parameters
- Index patterns
- Time range presets

---

### Alert Constants (`src/pages/alerts/constants/`)

**Source Options:**
```typescript
export const source_options = [
  { label: 'All Sources', value: 'all' },
  { label: 'Wazuh', value: 'wazuh' },
  { label: 'Suricata', value: 'suricata' },
  // ... more sources
]
```

**API Requests:**
Predefined API request configurations for alerts.

---

### MITRE Constants (`src/pages/mitre/pages/constants/`)

**Color Classes:**
```typescript
export const colorClasses = {
  0: 'bg-gray-100',
  1: 'bg-blue-100',
  2: 'bg-blue-300',
  3: 'bg-blue-500',
  4: 'bg-blue-700',
  5: 'bg-blue-900'
}
```

**MITRE Matrix:**
JSON file containing MITRE ATT&CK framework data:
- Tactics
- Techniques
- Sub-techniques
- Relationships


---

## Authentication & Security

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User visits protected route                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Router loader checks for es_token cookie            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├─── Token exists ──────────────────────┐
                  │                                        │
                  ├─── No token ──────────────────────┐   │
                  │                                    │   │
                  ▼                                    ▼   ▼
┌─────────────────────────────────────┐  ┌──────────────────────┐
│ 3a. Check for auth cookie           │  │ 3b. Allow access     │
└─────────────────┬───────────────────┘  └──────────────────────┘
                  │
                  ├─── Auth exists ────────────────┐
                  │                                 │
                  ├─── No auth ────────────────┐   │
                  │                             │   │
                  ▼                             ▼   ▼
┌─────────────────────────────────┐  ┌──────────────────────┐
│ 4a. Redirect to /auth           │  │ 4b. Fetch ES token   │
└─────────────────────────────────┘  └─────────┬────────────┘
                                                │
                                                ▼
                                     ┌──────────────────────┐
                                     │ 5. Set es_token      │
                                     │    cookie            │
                                     └─────────┬────────────┘
                                               │
                                               ▼
                                     ┌──────────────────────┐
                                     │ 6. Allow access      │
                                     └──────────────────────┘
```

### Cookie Management

**Auth Cookie:**
- Name: `auth`
- Value: Base64-encoded credentials
- Max Age: 8 hours
- SameSite: strict
- Secure: false (development)

**ES Token Cookie:**
- Name: `es_token`
- Value: Elasticsearch token
- Max Age: 8 hours
- SameSite: strict
- Secure: false (development)

### Authentication Service

**Location:** `src/services/auth.ts`

```typescript
export async function requireAuth({ request }: { request: Request }) {
  const cookies = new Cookies();

  // Check for existing ES token
  if (cookies.get("es_token")) {
    return { encoded: cookies.get("es_token") };
  }

  // Build redirect URL
  const url = new URL(request.url);
  const redirectTo = new URL("auth", url);
  redirectTo.searchParams.set("returnTo", url.pathname + url.search);

  // Check for auth cookie
  const authB64 = cookies.get("auth");
  if (!authB64) {
    throw redirect(redirectTo.toString());
  }

  // Fetch ES token
  try {
    const res = await fetch(AR_GET_ES_TOKEN, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Basic ${authB64}`,
      },
    });

    if (!res.ok) {
      throw redirect(redirectTo.toString());
    }

    return await res.json();
  } catch {
    throw redirect(redirectTo.toString());
  }
}
```

### Authorization Headers

All API requests automatically include authorization headers:

```typescript
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  ...(cookieAuth ? { 'Authorization': `Basic ${cookieAuth}` } : {}),
};
```

### Logout Flow

```typescript
const handleLogout = useCallback(() => {
  clearAuthCookie();
  clearEsTokenCookie();
  window.location.href = "/#/auth";
  window.location.reload();
}, []);
```

### Inactivity Timeout

**Location:** `src/layout/hooks/useInactiveTimeout.tsx`

**Features:**
- Tracks mouse and keyboard activity
- Configurable timeout duration (default: 30 minutes)
- Automatic logout on timeout
- Warning before logout (optional)

### Secure Routes

Routes can be marked as secure:

```typescript
{
  path: "/user-management",
  title: "User Management",
  element: <UserManagement />,
  secure: true  // Admin-only route
}
```

### Error Handling

**401 Unauthorized:**
- Clears auth and ES token cookies
- Redirects to `/auth`
- Reloads page

**403 Forbidden:**
- Shows error toast
- Redirects to home page

### Security Best Practices

1. **Cookie Security:**
   - HttpOnly cookies (backend)
   - SameSite strict
   - Secure flag in production

2. **Token Management:**
   - Short-lived tokens (8 hours)
   - Automatic refresh
   - Secure storage

3. **Request Security:**
   - CORS configuration
   - CSRF protection
   - Request validation

4. **User Management:**
   - Role-based access control
   - Password complexity requirements
   - Account lockout policies

5. **Session Management:**
   - Inactivity timeout
   - Concurrent session limits
   - Session invalidation on logout


---

## Real-time Communication

### WebSocket Architecture

**Socket.IO Client Configuration:**

```typescript
const socket = io(WEBSOCKET_API_ROOT, {
  transports: ["websocket"],
  auth: {
    token: `Basic ${cookieAuth}`
  }
});
```

### Socket Context

**Location:** `src/context/socketContext.tsx`

**Features:**
- Automatic connection management
- Auth token passing
- Session ID tracking
- Connection status monitoring
- Auto-reconnection

**Context Value:**
```typescript
interface SocketContextValue {
  socket: Socket | null
  connected: boolean
  sessionId: string | undefined
}
```

### Socket Events

**Client → Server:**
- `connect` - Initial connection
- `message` - Send message to assistant
- `disconnect` - Disconnect

**Server → Client:**
- `on_session_start` - Session initialized with chat_sid
- `on_message` - Receive message from assistant
- `on_error` - Error occurred
- `connect_error` - Connection error
- `disconnect` - Disconnected

### Usage Example

```typescript
import { useSocket } from '../context/socketContext';

function AssistantChat() {
  const { socket, connected, sessionId } = useSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for messages
    socket.on('on_message', (data) => {
      console.log('Received:', data);
    });

    // Send message
    socket.emit('message', {
      chat_sid: sessionId,
      message: 'Hello, assistant!'
    });

    return () => {
      socket.off('on_message');
    };
  }, [socket, connected, sessionId]);

  if (!connected) {
    return <div>Connecting...</div>;
  }

  return <div>Connected with session: {sessionId}</div>;
}
```

### Connection Wrapper

**Component:** `SocketConnectionWrapper`

Wraps the application to ensure socket connection before rendering:

```typescript
<SocketConnectionWrapper fallback={<LoadingSpinner />}>
  {children}
</SocketConnectionWrapper>
```

**Features:**
- Shows fallback while connecting
- Provides socket context to children
- Handles connection errors
- Manages cleanup on unmount

### Error Handling

**Connection Errors:**
```typescript
socket.on("connect_error", (err: Error) => {
  console.error("Connection error:", err);
  setConnected(false);
});
```

**Reconnection:**
- Automatic reconnection on disconnect
- Exponential backoff
- Maximum retry attempts

### Assistant Integration

The AI assistant uses WebSocket for real-time communication:

1. User sends message via UI
2. Message sent through socket with session ID
3. Backend processes with LLM
4. Response streamed back via socket
5. UI updates in real-time

**Message Flow:**
```
User Input → Socket Emit → Backend LLM → Socket Response → UI Update
```


---

## Data Visualization

### Chart Libraries

The application uses multiple charting libraries for different visualization needs:

#### Elastic Charts
**Use Case:** Time series, metrics, and Elasticsearch data

**Features:**
- Native Elasticsearch integration
- Time series charts
- Metric visualizations
- Responsive design
- Theme support

**Example:**
```typescript
import { Chart, Settings, BarSeries } from '@elastic/charts';

<Chart size={{ height: 300 }}>
  <Settings theme="light" />
  <BarSeries
    id="bars"
    data={data}
    xAccessor="x"
    yAccessors={['y']}
  />
</Chart>
```

---

#### Nivo Charts
**Use Case:** Advanced visualizations and specialized charts

**Available Charts:**
- **Calendar Heatmap** - Time-based activity visualization
- **Chord Diagram** - Relationship flows between entities
- **Heatmap** - 2D data density visualization
- **Network Graph** - Graph visualization with Sigma.js
- **Parallel Coordinates** - Multi-dimensional data analysis
- **Treemap** - Hierarchical data visualization

**Example - Calendar Heatmap:**
```typescript
import { ResponsiveCalendar } from '@nivo/calendar';

<ResponsiveCalendar
  data={data}
  from="2024-01-01"
  to="2024-12-31"
  emptyColor="#eeeeee"
  colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
  margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
/>
```

**Example - Network Graph:**
```typescript
import { ResponsiveNetwork } from '@nivo/network';

<ResponsiveNetwork
  data={{
    nodes: [
      { id: 'node1', radius: 10 },
      { id: 'node2', radius: 15 }
    ],
    links: [
      { source: 'node1', target: 'node2' }
    ]
  }}
  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
  linkDistance={80}
  repulsivity={6}
/>
```

---

#### Custom Charts

**MetricChart** - Single metric display
```typescript
<MetricChart
  title="Total Alerts"
  value="1,234"
  description="Last 24 hours"
  color="primary"
/>
```

**PieChart** - Proportional data
```typescript
<PieChart
  data={[
    { name: 'Critical', percent: 25 },
    { name: 'High', percent: 35 },
    { name: 'Medium', percent: 30 },
    { name: 'Low', percent: 10 }
  ]}
/>
```

**BarChart** - Comparisons
```typescript
<BarChart
  data={{
    x_title: 'Date',
    y_title: 'Count',
    x_accessor: 'date',
    y_accessors: ['alerts', 'rules'],
    data: [
      { date: '2024-01-01', alerts: 100, rules: 50 },
      { date: '2024-01-02', alerts: 120, rules: 55 }
    ]
  }}
/>
```

---

### Map Visualization

**Leaflet Integration:**

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[51.505, -0.09]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  {locations.map(loc => (
    <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
      <Popup>{loc.label}</Popup>
    </Marker>
  ))}
</MapContainer>
```

**Features:**
- Interactive maps
- Custom markers
- Popup information
- Clustering support
- Geolocation

---

### MITRE ATT&CK Visualization

**Heatmap Matrix:**

The MITRE coverage page displays a heatmap of techniques:

```typescript
<div className="mitre-matrix">
  {tactics.map(tactic => (
    <MitreColumn
      key={tactic.id}
      tactic={tactic}
      techniques={getTechniquesForTactic(tactic.id)}
      coverage={getCoverageData(tactic.id)}
    />
  ))}
</div>
```

**Color Coding:**
- Gray: No coverage
- Light Blue: Low coverage (1-20%)
- Medium Blue: Medium coverage (21-50%)
- Dark Blue: High coverage (51-80%)
- Navy: Full coverage (81-100%)

---

### Dashboard Layouts

**Grid Layout:**
```typescript
<EuiFlexGrid columns={3}>
  <EuiFlexItem>
    <MetricChart title="Alerts" value="1,234" />
  </EuiFlexItem>
  <EuiFlexItem>
    <MetricChart title="Rules" value="567" />
  </EuiFlexItem>
  <EuiFlexItem>
    <MetricChart title="Threats" value="89" />
  </EuiFlexItem>
</EuiFlexGrid>
```

**Responsive Design:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

---

### Chart Theming

**Elastic Charts Theme:**
```typescript
import '@elastic/charts/dist/theme_light.css';

<Settings theme="light" />
```

**Nivo Theme:**
```typescript
const theme = {
  background: '#ffffff',
  textColor: '#333333',
  fontSize: 11,
  axis: {
    domain: {
      line: {
        stroke: '#777777',
        strokeWidth: 1
      }
    }
  }
}
```

---

### Performance Optimization

**Lazy Loading:**
```typescript
const ChartComponent = lazy(() => import('./ChartComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <ChartComponent data={data} />
</Suspense>
```

**Memoization:**
```typescript
const chartData = useMemo(() => {
  return processData(rawData);
}, [rawData]);
```

**Virtualization:**
For large datasets, use virtualization:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```


---

## Development Workflow

### Local Development

**Start Development Server:**
```bash
yarn dev
# or with network access
yarn host
```

**Development Server:**
- URL: `http://localhost:5173`
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Source maps for debugging

---

### Code Quality

**Linting:**
```bash
yarn lint
```

**ESLint Configuration:**
- TypeScript support
- React hooks rules
- React refresh rules
- Recommended rules from @eslint/js

**Auto-fix:**
```bash
yarn lint --fix
```

---

### Building

**Production Build:**
```bash
yarn build
```

**Build Output:**
- Location: `dist/`
- Optimized bundles
- Code splitting
- Minification
- Source maps (optional)

**Preview Build:**
```bash
yarn preview
```

---

### TypeScript

**Type Checking:**
```bash
tsc -b
```

**Configuration:**
- `tsconfig.json` - Root configuration
- `tsconfig.app.json` - Application configuration
- `tsconfig.node.json` - Node configuration

**Strict Mode:**
- Enabled for type safety
- No implicit any
- Strict null checks
- Strict function types

---

### Git Workflow

**Branch Strategy:**
```
main (production)
  ├── develop (staging)
  │   ├── feature/alert-filtering
  │   ├── feature/mitre-coverage
  │   └── bugfix/table-pagination
```

**Commit Convention:**
```
feat: Add alert filtering by severity
fix: Fix pagination bug in rules table
docs: Update API documentation
style: Format code with prettier
refactor: Refactor alert context
test: Add tests for user management
chore: Update dependencies
```

---

### Docker Development

**Build Image:**
```bash
docker build -t gat-cti-frontend .
```

**Run Container:**
```bash
docker run -p 5173:5173 gat-cti-frontend
```

**Docker Compose:**
```bash
docker-compose up
```

---

### DevContainer Development

**Open in DevContainer:**
1. Open project in VS Code
2. Command Palette: "Dev Containers: Reopen in Container"
3. Wait for container to build
4. Dependencies auto-installed

**Benefits:**
- Consistent development environment
- Pre-configured tools
- Port forwarding
- VS Code extensions

---

### Debugging

**Browser DevTools:**
- React DevTools extension
- Redux DevTools (if using Redux)
- Network tab for API calls
- Console for errors

**VS Code Debugging:**
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/src"
}
```

**Source Maps:**
- Enabled in development
- Map minified code to source
- Breakpoint support

---

### Testing

**Unit Tests:**
```bash
# If tests are added
yarn test
```

**E2E Tests:**
```bash
# If E2E tests are added
yarn test:e2e
```

**Test Structure:**
```
src/
  components/
    DataTable/
      __tests__/
        DataTable.test.tsx
```

---

### Performance Monitoring

**Vite Build Analysis:**
```bash
yarn build --mode analyze
```

**Bundle Size:**
- Monitor bundle size
- Code splitting
- Lazy loading
- Tree shaking

**Performance Metrics:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

---

### Environment Management

**Development:**
```env
VITE_API_ROOT=http://localhost:8088
VITE_KIBANA_API_ROOT=http://localhost:5601/kibana
VITE_ELASTIC_API_ROOT=http://localhost:9200
VITE_SOCKET_IO_ROOT=http://localhost:8088
```

**Staging:**
```env
VITE_API_ROOT=https://staging-api.example.com
VITE_KIBANA_API_ROOT=https://staging-kibana.example.com
VITE_ELASTIC_API_ROOT=https://staging-elastic.example.com
VITE_SOCKET_IO_ROOT=https://staging-api.example.com
```

**Production:**
```env
VITE_API_ROOT=https://api.example.com
VITE_KIBANA_API_ROOT=https://kibana.example.com
VITE_ELASTIC_API_ROOT=https://elastic.example.com
VITE_SOCKET_IO_ROOT=https://api.example.com
```

---

### Code Organization

**File Naming:**
- Components: PascalCase (e.g., `AlertCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: camelCase (e.g., `alert.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ROOT`)

**Import Order:**
1. React imports
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles

**Example:**
```typescript
import { useEffect, useState } from 'react';
import { EuiButton, EuiCard } from '@elastic/eui';
import { DataTable } from '../components/DataTable';
import { formatDate } from '../utils';
import { Alert } from '../types/alerts';
import './AlertCard.css';
```


---

## Deployment

### Docker Deployment

**Multi-Stage Build:**

The Dockerfile uses a multi-stage build for optimization:

**Stage 1: Builder**
```dockerfile
FROM node:22-alpine3.18 AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
COPY . .
RUN yarn build
```

**Stage 2: Production**
```dockerfile
FROM node:22-alpine3.18
WORKDIR /app

# Install serve
RUN yarn global add serve

# Copy built files
COPY --from=builder /app/dist /app

# Serve on port 5173
CMD ["serve", "-s", ".", "-l", "5173"]
```

**Build Arguments:**
- `YARN_REGISTRY_DOMAIN` - Custom registry domain
- `VITE_API_ROOT` - API endpoint
- `VITE_KIBANA_API_ROOT` - Kibana endpoint
- `VITE_ELASTIC_API_ROOT` - Elasticsearch endpoint
- `VITE_SOCKET_IO_ROOT` - WebSocket endpoint

**Build Command:**
```bash
docker build \
  --build-arg VITE_API_ROOT=https://api.example.com \
  --build-arg VITE_KIBANA_API_ROOT=https://kibana.example.com \
  --build-arg VITE_ELASTIC_API_ROOT=https://elastic.example.com \
  --build-arg VITE_SOCKET_IO_ROOT=https://api.example.com \
  -t gat-cti-frontend:latest .
```

**Run Container:**
```bash
docker run -d \
  -p 5173:5173 \
  --name gat-cti-frontend \
  gat-cti-frontend:latest
```

---

### Production Optimization

**Vite Build Optimizations:**
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Lazy loading

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'eui': ['@elastic/eui'],
          'charts': ['@elastic/charts', '@nivo/core']
        }
      }
    }
  }
})
```

---

### Static File Serving

**Serve Configuration:**
```bash
serve -s dist -l 5173
```

**Options:**
- `-s` - Single-page application mode (SPA)
- `-l` - Listen port
- `--cors` - Enable CORS (if needed)

---

### Nginx Configuration

**Alternative to serve:**

```nginx
server {
    listen 80;
    server_name gai-cti.example.com;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

### Environment Configuration

**Production Environment:**
```env
NODE_ENV=production
VITE_API_ROOT=https://api.gai-cti.amnafzar.ir
VITE_KIBANA_API_ROOT=https://kibana.gai-cti.amnafzar.ir
VITE_ELASTIC_API_ROOT=https://elastic.gai-cti.amnafzar.ir
VITE_SOCKET_IO_ROOT=https://api.gai-cti.amnafzar.ir
```

---

### CI/CD Pipeline

**Example GitHub Actions:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Build
        run: yarn build
        env:
          VITE_API_ROOT: ${{ secrets.API_ROOT }}
          VITE_KIBANA_API_ROOT: ${{ secrets.KIBANA_ROOT }}
          VITE_ELASTIC_API_ROOT: ${{ secrets.ELASTIC_ROOT }}
          VITE_SOCKET_IO_ROOT: ${{ secrets.SOCKET_ROOT }}
          
      - name: Build Docker image
        run: docker build -t gat-cti-frontend:${{ github.sha }} .
        
      - name: Push to registry
        run: docker push gat-cti-frontend:${{ github.sha }}
        
      - name: Deploy
        run: |
          # Deploy to production
```

---

### Health Checks

**Docker Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1
```

**Kubernetes Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 5173
  initialDelaySeconds: 30
  periodSeconds: 10
```

---

### Monitoring

**Application Monitoring:**
- Error tracking (e.g., Sentry)
- Performance monitoring
- User analytics
- API call tracking

**Infrastructure Monitoring:**
- Container health
- Resource usage (CPU, memory)
- Network traffic
- Disk usage

---

### Backup & Recovery

**Backup Strategy:**
- Source code: Git repository
- Configuration: Environment variables
- Build artifacts: Docker registry

**Recovery Plan:**
1. Pull latest code from Git
2. Rebuild Docker image
3. Deploy to production
4. Verify health checks

---

### Scaling

**Horizontal Scaling:**
```bash
docker-compose up --scale frontend=3
```

**Load Balancing:**
- Nginx load balancer
- HAProxy
- Cloud load balancer (AWS ALB, GCP LB)

**CDN Integration:**
- CloudFlare
- AWS CloudFront
- Fastly


---

## External Integrations

### Elasticsearch Integration

**Purpose:** Log storage and querying

**Features:**
- Full-text search
- Aggregations
- Time-based queries
- Index management

**API Endpoints:**
```typescript
const ELASTIC_API_ROOT = import.meta.env.VITE_ELASTIC_API_ROOT;

// Query logs
POST ${ELASTIC_API_ROOT}/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error" } }
      ],
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}
```

**Query Builder:**
```typescript
const query: esQuery = {
  query: {
    bool: {
      must: [
        { match: { field: value } }
      ],
      filter: [
        { range: { timestamp: { gte: 'now-1h' } } }
      ]
    }
  },
  size: 100,
  from: 0,
  sort: [{ timestamp: 'desc' }]
};
```

---

### Kibana Integration

**Purpose:** Dashboard data and visualizations

**Features:**
- Pre-built dashboards
- Alert aggregations
- Visualization data
- Index patterns

**API Endpoints:**
```typescript
const KIBANA_API_ROOT = import.meta.env.VITE_KIBANA_API_ROOT;

// Get dashboard data
GET ${KIBANA_API_ROOT}/api/dashboard/{id}

// Get alerts
GET ${KIBANA_API_ROOT}/api/alerts

// Get aggregations
POST ${KIBANA_API_ROOT}/api/alerts/aggregate
```

**Data Compression:**
Kibana responses are compressed with pako:

```typescript
const compressed = await request<string>({
  url: `${KIBANA_API_ROOT}/api/dashboard`
});

const data = decodeCompressedBase64<DashboardData>(compressed);
```

---

### OpenCTI Integration

**Purpose:** Threat intelligence platform

**Features:**
- Threat indicators
- Adversary information
- MITRE ATT&CK mapping
- Threat reports

**Access:**
- URL: `http://localhost:8080/open-cti`
- Username: `admin@opencti.io`
- Password: `opencti12345678`

**Data Flow:**
```
OpenCTI → Backend API → Frontend
```

**Use Cases:**
- Adversary tracking
- Threat intelligence feeds
- MITRE technique mapping
- IOC management

---

### Backend API Integration

**Purpose:** Main application backend

**Technology:** FastAPI (Python)

**API Documentation:**
- Swagger UI: `http://localhost:8088/docs`
- OpenAPI spec: `http://localhost:8088/openapi.json`

**Endpoints:**

**Adversaries:**
- `GET /adversaries` - List adversaries
- `GET /adversaries/{id}` - Get adversary
- `GET /adversaries/mitre` - MITRE mappings
- `POST /adversaries/{id}/schedule/run` - Run schedule

**Alerts:**
- `GET /kibana/alerts` - List alerts
- `GET /kibana/alerts/grouped` - Grouped alerts
- `GET /kibana/alerts/{id}` - Alert details
- `GET /alerts/{id}/assistant` - AI analysis

**Rules:**
- `GET /rules` - List rules
- `GET /rules/{id}` - Rule details
- `GET /rules/mitre/coverage` - MITRE coverage
- `POST /rules/{id}/run` - Run rule
- `DELETE /rules/{id}` - Delete rule

**Threat Intelligence:**
- `GET /threat-intelligence` - List indicators
- `GET /threat-intelligence/metadata` - Metadata
- `PATCH /threat-intelligence/{id}/confidence` - Edit confidence

**Feeds:**
- `GET /feeds` - List feeds
- `GET /feeds/{id}` - Feed details
- `POST /feeds/configuration` - Submit config
- `PATCH /feeds/{id}/reliability` - Edit reliability

**Users:**
- `GET /users` - List users
- `POST /users` - Create user
- `DELETE /users/{id}` - Delete user
- `POST /users/password` - Change password

---

### WebSocket Integration

**Purpose:** Real-time communication

**Technology:** Socket.IO

**Server:** `http://localhost:8088`

**Events:**

**Client → Server:**
```typescript
socket.emit('message', {
  chat_sid: sessionId,
  message: 'Analyze this alert',
  context: { alert_id: '123' }
});
```

**Server → Client:**
```typescript
socket.on('on_message', (data) => {
  console.log('Response:', data.message);
});

socket.on('on_session_start', ({ chat_sid }) => {
  console.log('Session ID:', chat_sid);
});
```

---

### AI/LLM Integration

**Purpose:** AI-powered threat analysis

**Features:**
- Alert analysis
- Threat explanation
- Query assistance
- Report generation

**Available LLMs:**
- GPT-4
- Claude
- Custom models

**Usage:**
```typescript
const { getHelp, setLlm } = useAssistant();

// Set LLM model
setLlm('gpt-4');

// Get help
const response = await getHelp('Explain this alert');
```

---

### External Services

**Email Notifications:**
- Alert notifications
- Report delivery
- User invitations

**SIEM Integration:**
- Wazuh
- Suricata
- Custom SIEM

**Threat Feeds:**
- MISP
- AlienVault OTX
- VirusTotal
- Custom feeds

---

### API Rate Limiting

**Backend Rate Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user
- Burst allowance: 20 requests

**Handling Rate Limits:**
```typescript
try {
  const data = await request({ url: API_ENDPOINT });
} catch (error) {
  if (error.status === 429) {
    // Rate limited
    const retryAfter = error.headers['Retry-After'];
    setTimeout(() => retry(), retryAfter * 1000);
  }
}
```

---

### Data Synchronization

**Real-time Updates:**
- WebSocket for live data
- Polling for periodic updates
- Event-driven updates

**Caching Strategy:**
- Browser cache for static assets
- Memory cache for API responses
- Invalidation on updates

**Offline Support:**
- Service worker (if implemented)
- Local storage for critical data
- Queue for pending requests


---

## Appendix

### Common Issues & Solutions

#### Issue: Port Already in Use
**Solution:**
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
yarn dev --port 3000
```

#### Issue: Module Not Found
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

#### Issue: Build Fails
**Solution:**
```bash
# Clear cache
rm -rf dist node_modules/.vite

# Rebuild
yarn build
```

#### Issue: WebSocket Connection Failed
**Solution:**
- Check backend is running
- Verify VITE_SOCKET_IO_ROOT is correct
- Check firewall settings
- Verify auth token is valid

#### Issue: 401 Unauthorized
**Solution:**
- Clear cookies
- Re-authenticate
- Check token expiration
- Verify backend is accessible

---

### Performance Tips

1. **Lazy Load Components:**
   ```typescript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

2. **Memoize Expensive Calculations:**
   ```typescript
   const processedData = useMemo(() => processData(data), [data]);
   ```

3. **Debounce Search Inputs:**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((value) => search(value), 300),
     []
   );
   ```

4. **Virtualize Long Lists:**
   ```typescript
   import { FixedSizeList } from 'react-window';
   ```

5. **Optimize Images:**
   - Use WebP format
   - Lazy load images
   - Use appropriate sizes

---

### Security Checklist

- [ ] HTTPS in production
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] CORS configuration
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Audit logging
- [ ] Dependency updates
- [ ] Security headers

---

### Browser Support

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills:**
- ES2015+ features
- Fetch API
- WebSocket

---

### Accessibility

**WCAG 2.1 Level AA Compliance:**
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus indicators
- ARIA labels
- Alt text for images

**Testing:**
- axe DevTools
- WAVE browser extension
- Keyboard-only navigation
- Screen reader testing

---

### Glossary

**Terms:**

- **APT** - Advanced Persistent Threat
- **CTI** - Cyber Threat Intelligence
- **IOC** - Indicator of Compromise
- **MITRE ATT&CK** - Framework for adversary tactics and techniques
- **SIEM** - Security Information and Event Management
- **TI** - Threat Intelligence
- **TTPs** - Tactics, Techniques, and Procedures

**Components:**

- **Context** - React Context API for state management
- **Flyout** - Side panel for details
- **Modal** - Overlay dialog
- **Toast** - Notification message
- **Reducer** - State management function

---

### Resources

**Documentation:**
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Elastic EUI Documentation](https://eui.elastic.co)
- [Nivo Charts Documentation](https://nivo.rocks)
- [Socket.IO Documentation](https://socket.io/docs)

**Tools:**
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Elastic Charts Playground](https://elastic.github.io/elastic-charts)

**Community:**
- GitHub Issues
- Stack Overflow
- Discord/Slack channels

---

## Conclusion

This documentation provides a comprehensive overview of the GAT-CTI Frontend application. The application is built with modern technologies and follows best practices for security, performance, and maintainability.

**Key Highlights:**
- **Modular Architecture** - Context-based state management with 12 feature-specific providers
- **Type Safety** - Full TypeScript coverage with strict mode
- **Real-time Communication** - WebSocket integration for live updates
- **Rich Visualizations** - Multiple charting libraries for diverse data visualization needs
- **Security First** - Authentication, authorization, and secure communication
- **Developer Experience** - Hot reload, DevContainer support, comprehensive tooling

For questions, issues, or contributions, please refer to the Contact & Support section above.

---

**Last Updated:** February 2026  
**Documentation Version:** 1.0.0
