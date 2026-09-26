# GAI-CTI Backend Documentation

## Overview

GAI-CTI (Generative AI - Cyber Threat Intelligence) Backend is a comprehensive threat intelligence platform that leverages AI and machine learning to analyze, detect, and provide insights about cybersecurity threats. The system integrates with OpenCTI, Elasticsearch, and various threat intelligence feeds to provide real-time analysis and visualization.

## Architecture

### System Components

The backend is built using a modern microservices architecture with the following key components:

1. **FastAPI Application** - Main REST API server
2. **Celery Workers** - Asynchronous background task processing
3. **Redis** - Caching, message broker, and session management
4. **Elasticsearch** - Log and alert storage and querying
5. **OpenCTI** - Threat intelligence platform integration
6. **LLM Agent** - AI-powered analysis and insights
7. **Socket.IO** - Real-time communication

### Technology Stack

- **Language**: Python 3.13
- **Framework**: FastAPI
- **Task Queue**: Celery with Redis broker
- **Database**: Elasticsearch 8.x
- **Cache**: Redis 5.x
- **AI/ML**: LangChain, LangGraph, OpenAI integration
- **Authentication**: JWT tokens with Redis storage
- **Real-time**: Socket.IO with Redis manager

## Project Structure

```
src/gai_cti_backend/
├── __init__.py
├── app.py                 # Main FastAPI application
├── conf.py                # Configuration settings
├── apt_detection/         # APT detection module
├── background/            # Celery background tasks
│   ├── __init__.py
│   ├── apt_detection.py
│   ├── celery_worker.py
│   ├── feed.py
│   ├── home.py
│   ├── ip_by_region.py
│   ├── management.py
│   ├── rules.py
│   └── ti/               # Threat intelligence tasks
├── chat/                  # Chat functionality
├── elastic_client/        # Elasticsearch client
│   ├── alert.py
│   ├── index.py
│   ├── rule.py
│   └── utils/
├── llm_agent/             # AI agent implementations
│   ├── data_processors.py
│   ├── utils.py
│   ├── analysis_adv/      # Adversary analysis
│   ├── analysis_alert/    # Alert analysis
│   ├── analysis_log/      # Log analysis
│   ├── analysis_rule/     # Rule analysis
│   ├── analysis_ti/       # Threat intelligence analysis
│   └── conversational/    # Conversational AI
├── models/                # Pydantic models
│   ├── adversary.py
│   ├── alert.py
│   ├── feed.py
│   ├── home.py
│   ├── log.py
│   ├── management.py
│   ├── rule.py
│   ├── socket_handler.py
│   ├── ti.py
│   ├── user_management.py
│   ├── utils.py
│   └── visual.py          # Visualization models
├── opencti/               # OpenCTI integration
├── routes/                # API routes
│   ├── adversary.py
│   ├── alert.py
│   ├── feeds.py
│   ├── home.py
│   ├── logs.py
│   ├── management.py
│   ├── rules.py
│   ├── ti.py
│   ├── user_management.py
│   └── utils.py
├── socket_handler/        # Socket.IO handlers
│   ├── __init__.py
│   ├── emitters.py
│   ├── events.py
│   └── socket.py
└── utils/                 # Utility functions
    ├── __init__.py
    ├── adversary.py
    ├── alert.py
    ├── auth.py
    ├── feed.py
    ├── home.py
    ├── locate_ip.py
    ├── miscellaneous.py
    ├── redis.py
    ├── rule.py
    ├── sigma_convert.py
    ├── ti.py
    └── user_management.py
```

## API Endpoints

### Main API Structure

The API is structured with the following prefixes:

- `/api` - Root path for all API endpoints
- `/api/utils` - Utility endpoints
- `/api/ti` - Threat Intelligence endpoints
- `/api/feeds` - Feed connectors and organization management
- `/api/logs` - Log analysis and visualization
- `/api/rules` - Detection rules management
- `/api/mng` - System management
- `/api/alert` - Alert analysis
- `/api/adversary` - Adversary detection and profiling
- `/api/home` - Dashboard and statistics
- `/api/user-management` - User authentication and management
- `/socket.io` - Real-time WebSocket communication

### Threat Intelligence API (`/api/ti`)

#### Main Table Endpoint
**GET/POST** `/api/ti/main-table`
- Returns paginated indicators of compromise (IoCs)
- Supports filtering by:
  - Reliability
  - Confidence
  - Score
  - Name
  - Type (e.g., IP, Domain, Hash)
  - Feed Source
  - Creation Time
  - Labels
- Response: `TITable` with rows and columns

#### Dashboard Endpoints

**GET** `/api/ti/ti-dashboard`
- Returns dashboard metrics and visualizations:
  - Active feeds count
  - Malware count
  - Indicator count
  - Indicators added in last 48h
  - Cumulative indicator count over time
  - Risk vs confidence distribution
  - Indicator type distribution
  - Tag co-occurrence heatmap

**GET** `/api/ti/malware-dashboard`
- Returns malware-specific visualizations:
  - Important malware table
  - Malware-adversary network graph
  - Malware information parallel coordinates
  - Malware feed source distribution

**GET** `/api/ti/ip-dashboard`
- Returns IP geolocation visualization
- Map visualization of IP indicators

#### Indicator Details
**GET** `/api/ti/indicator/{id}`
- Retrieves detailed information about a specific indicator
- Returns fields: ID, name, pattern, types, score, validity, confidence, author, labels, etc.

**GET** `/api/ti/explain/{id}`
- Generates AI-powered explanation for a threat intelligence indicator
- Uses LLM to provide context and insights

**PATCH** `/api/ti/indicator/{id}/confidence`
- Updates confidence level of an indicator
- Requires confidence value (0-100)

### Feed Management API (`/api/feeds`)

#### Dashboard
**GET** `/api/feeds/top-dashboard`
- Returns feed connector statistics:
  - Total supported connectors
  - Active connectors
  - Connector distribution (commercial vs non-commercial)
  - IOC count per organization
  - IOC count over time per organization

#### Connector Management
**GET** `/api/feeds/main-table`
- Lists all installed feed connectors from OpenCTI
- Shows status, run times, queue metrics

**GET** `/api/feeds/second-table`
- Lists organizations that have created IoCs
- Shows confidence and reliability levels

**GET** `/api/feeds/connector`
- Returns list of available connectors

**GET** `/api/feeds/connector/organizations-map`
- Maps connectors to their related organizations

**GET** `/api/feeds/connector/configurable-fields`
- Returns configurable fields for specific connectors
- Parameters: `conn_names` (comma-separated list)

**POST** `/api/feeds/connector/delete-inactive`
- Cleans up inactive feed connectors
- Returns deletion process status

**POST** `/api/feeds/connector/configuration`
- Generates docker-compose.yml configuration
- Based on provided connector settings
- Returns Markdown formatted configuration

**GET** `/api/feeds/connector/{conn_name}/help`
- Retrieves help documentation for a specific connector
- Returns README.md content if available

#### Organization Management
**GET** `/api/feeds/organization/{id}`
- Returns detailed information about an organization
- Includes IOC count, confidence, reliability level

**PATCH** `/api/feeds/organization/{id}/confidence`
- Updates organization confidence level
- Accepts confidence value (0-100)

**PATCH** `/api/feeds/organization/{id}/reliability`
- Updates organization reliability level
- Accepts reliability levels: "A - Completely reliable" through "F - Reliability cannot be judged"

### Alert API (`/api/alert`)

#### Alert Details
**GET** `/api/alert/{id}`
- Retrieves complete alert information
- Includes:
  - AI assistant analysis
  - Rule details
  - Associated logs
  - Threat intelligence data
  - Geographic location (for IP indicators)

**GET** `/api/alert/explain/{id}`
- Generates AI-powered explanation for an alert
- Returns summary, recommendation, and confidence assessment

### Logs API (`/api/logs`)

#### Index Patterns
**GET** `/api/logs/index-patterns`
- Lists available log index patterns
- Shows name, description, pattern, and total count
- Includes manual log indices

#### Dashboard
**GET** `/api/logs/top-dashboard`
- Returns time distribution visualization for indexes

**GET** `/api/logs/index-dashboard/{index_pattern}`
- Returns calendar heatmap of log count per day

#### Log Analysis
**GET** `/api/logs/explain/{index_pattern}/{id}`
- Generates AI-powered explanation for a specific log
- Provides contextual analysis

**GET** `/api/logs/show/{index_pattern}/{id}`
- Retrieves raw log data in JSON format

### Rules API (`/api/rules`)

#### Dashboard
**GET** `/api/rules/top-dashboard`
- Returns rules statistics and visualizations:
  - Total rule count
  - Sigma rule count
  - TI rule count
  - Custom rule count
  - Severity distribution
  - Risk score distribution
  - Tag frequency treemap

**GET** `/api/rules/pages`
- Returns predefined rule pages/filters

#### Rule Management
**GET** `/api/rules/{id}`
- Returns detailed information about a specific rule

**DELETE** `/api/rules/{id}`
- Deletes a detection rule by ID

**PATCH** `/api/rules/{id}/interval/{interval}`
- Updates rule execution interval

**POST** `/api/rules/manual-run`
- Manually triggers rule execution
- Accepts rule ID
- Calculates time range (up to 89 days based on system uptime)

**GET** `/api/rules/coverage`
- Returns tactic-technique coverage statistics
- Maps rules to MITRE ATT&CK techniques

**GET** `/api/rules/coverage/{tactic_id}/{technique_id}`
- Returns all rules for a specific tactic-technique pair
- Includes rule details: ID, name, tags, type, enabled status

**GET** `/api/rules/explain/{id}`
- Generates AI-powered explanation for a detection rule

### Adversary API (`/api/adversary`)

#### Dashboard
**GET** `/api/adversary/top-dashboard`
- Returns adversary statistics:
  - Tracked adversaries with indicators/signatures
  - IOC count per adversary
  - Rule count per adversary
  - TTP specificity heatmap

**GET** `/api/adversary/`
- Returns list of adversary side bar items

**GET** `/api/adversary/specificity`
- Returns TTP specificity scores for each adversary

**GET** `/api/adversary/mitre-map/{adv_name}`
- Returns MITRE ATT&CK mapping for an adversary
- Compares adversary TTPs with organization TTPs

#### Adversary Detection
**POST** `/api/adversary/schedule/run-now`
- Manually triggers APT detection process
- Returns execution status

**GET** `/api/adversary/schedule`
- Returns detection schedule information
- Shows current state, last run, next run

**GET** `/api/adversary/{id}`
- Returns complete adversary information
- Includes:
  - Profile details (name, description, confidence)
  - Signature-based rules and alerts
  - IOC-based detection results
  - Related indicators and alerts

**GET** `/api/adversary/explain/{id}`
- Generates AI-powered insights for an adversary
- Returns explanatory analysis

### Home API (`/api/home`)

#### Dashboard
**GET** `/api/home/`
- Returns comprehensive home dashboard
- Includes:
  - Top statistics (Adversaries, Alerts, TI, System)
  - Visualizations:
    - Most active malwares
    - IoC count per adversary
    - IP geolocation map
    - Common IoC tags treemap

### User Management API (`/api/user-management`)

#### Authentication
**POST** `/api/user-management/login`
- Authenticates user and returns JWT token

**POST** `/api/user-management/logout`
- Invalidates user session

**POST** `/api/user-management/refresh`
- Refreshes authentication token

**GET** `/api/user-management/me`
- Returns current user information

**POST** `/api/user-management/register`
- Registers new user account

#### User Management
**GET** `/api/user-management/users`
- Lists all users (admin only)

**GET** `/api/user-management/users/{id}`
- Returns user details by ID

**PUT** `/api/user-management/users/{id}`
- Updates user information

**DELETE** `/api/user-management/users/{id}`
- Deletes user account

**PATCH** `/api/user-management/users/{id}/password`
- Changes user password

**POST** `/api/user-management/users/{id}/roles`
- Assigns roles to user

### Utilities API (`/api/utils`)

#### Cache Management
**GET** `/api/utils/cache/status`
- Returns cache statistics

**POST** `/api/utils/cache/clear`
- Clears specified cache keys

#### System Info
**GET** `/api/utils/system/info`
- Returns system information and status

**GET** `/api/utils/system/health`
- Health check endpoint

#### Export/Import
**POST** `/api/utils/export/{type}`
- Exports data in specified format

**POST** `/api/utils/import/{type}`
- Imports data from file

## AI/ML Capabilities

### LLM Agent Architecture

The system uses LangChain and LangGraph to create specialized AI agents for different analysis tasks:

1. **Threat Intelligence Analysis** (`llm_agent/analysis_ti/`)
   - Analyzes indicators of compromise
   - Provides contextual explanations
   - Identifies relationships and patterns

2. **Alert Analysis** (`llm_agent/analysis_alert/`)
   - Summarizes security alerts
   - Provides recommendations
   - Assesses confidence levels

3. **Log Analysis** (`llm_agent/analysis_log/`)
   - Interprets log entries
   - Identifies anomalies
   - Provides contextual insights

4. **Rule Analysis** (`llm_agent/analysis_rule/`)
   - Analyzes detection rules
   - Suggests improvements
   - Explains rule behavior

5. **Adversary Analysis** (`llm_agent/analysis_adv/`)
   - Profiles adversary tactics
   - Maps to MITRE ATT&CK
   - Provides strategic insights

6. **Conversational AI** (`llm_agent/conversational/`)
   - Natural language interface
   - Sub-agent delegation
   - Contextual responses

### Graph-based AI Processing

The system uses LangGraph to create directed acyclic graphs (DAGs) for complex analysis workflows:

- **Graph Construction**: Builds analysis pipelines with multiple nodes
- **State Management**: Maintains context across analysis steps
- **Parallel Processing**: Runs independent analysis paths concurrently
- **Conditional Routing**: Dynamically selects analysis paths based on data

## Background Tasks

### Celery Workers

The system uses Celery for asynchronous task processing:

**TI Tasks** (`background/ti/`)
- Update threat intelligence feeds
- Cache indicator data
- Generate dashboard statistics

**Feed Tasks** (`background/feed/`)
- Sync feed connectors
- Update organization mappings
- Manage connector configurations

**Alert Tasks** (`background/alert/`)
- Process alert data
- Update alert statistics
- Generate alert visualizations

**Rule Tasks** (`background/rules/`)
- Update rule statistics
- Calculate rule coverage
- Generate rule visualizations

**Adversary Tasks** (`background/apt_detection/`)
- Run APT detection algorithms
- Update adversary profiles
- Generate adversary statistics

**Home Tasks** (`background/home/`)
- Update dashboard statistics
- Cache home page data
- Generate visualizations

**IP Tasks** (`background/ip_by_region/`)
- Geolocate IP addresses
- Update map visualizations

**Management Tasks** (`background/management/`)
- System maintenance tasks
- Data cleanup
- Performance optimization

### Task Scheduling

Tasks are scheduled using Celery Beat:
- Default scheduler: PersistentScheduler
- Schedule file: `celerybeat-schedule`
- Task time limit: 300 seconds
- Worker configuration: One task per child process

## Real-time Communication

### Socket.IO Events

**Connection**
- Requires authentication token
- Validates credentials on connect
- Sends welcome message on successful connection

**Event Emission**
- Real-time updates via WebSocket
- Event types:
  - System updates
  - Alert notifications
  - Dashboard refreshes
  - Task completion alerts

### Redis Manager
- Redis-based message broadcasting
- Supports multiple server instances
- Handles reconnection gracefully

## Authentication & Security

### Authentication Flow

1. **Login**: User provides credentials
2. **Token Generation**: JWT token created and stored in Redis
3. **Token Validation**: Middleware validates tokens on each request
4. **Session Management**: Redis stores active sessions

### Security Features
- CORS configured for frontend origins
- JWT token-based authentication
- Role-based access control
- Secure WebSocket connections
- Input validation with Pydantic models

## Caching Strategy

### Redis Caching

**Cache Keys** (`routes/utils.py`)
- TI data: `ti:*`
- Feed data: `feed:*`
- Adversary data: `adv:*`
- Rule data: `rule:*`
- Home data: `home:*`

**Cache Types**
- Dashboard data (expires after TTL)
- Real-time statistics
- Computed visualizations
- External API responses

## Data Models

### Core Models

**Threat Intelligence** (`models/ti.py`)
- `TIRow`: Individual indicator row
- `TITable`: Paginated indicator table
- `Indicator`: Detailed indicator information
- `TopDashboardCache`: Dashboard statistics

**Alerts** (`models/alert.py`)
- `Alert`: Complete alert information
- `LogRow`: Log entry representation
- `LogTable`: Paginated log table

**Feeds** (`models/feed.py`)
- `FeedConnectorRow`: Connector status
- `FeedOrganizationRow`: Organization details
- `Connector`: Connector configuration

**Rules** (`models/rule.py`)
- `Rule`: Detection rule information
- `PageInfo`: Rule page definition
- `RulePerTechnique`: Technique-specific rules

**Adversaries** (`models/adversary.py`)
- `AdversaryInfo`: Complete adversary profile
- `AdversarySideBarItem`: Sidebar navigation
- `AdversaryDetectionResults`: Detection outcomes

**Visualizations** (`models/visual.py`)
- `VisualResponse`: Generic visualization wrapper
- Multiple chart types: Bar, Pie, Heatmap, Map, Network, etc.

### Utility Models

**Authentication** (`models/utils.py`)
- `JWTToken`: Authentication token
- `UserCredentials`: Login credentials
- `ReliabilityLevel`: Enum for reliability scores

**Table Components** (`models/utils.py`)
- `Row`: Base row model
- `Table`: Base table model
- `Column`: Column definition
- `FieldWithType`: Field with type metadata

## External Integrations

### OpenCTI Integration

**Configuration**
- GraphQL endpoint: `http://opencti:8080/open-cti/graphql`
- Admin token: `f3ca64ff-9082-4757-9e87-880be59462d1`

**Operations**
- Fetch indicators and IoCs
- Manage feed connectors
- Update organization data
- Query threat intelligence

### Elasticsearch Integration

**Configuration**
- URL: `http://elasticsearch:9200`
- Username: `elastic`
- Password: `elastic12345678`

**Operations**
- Query alerts and logs
- Aggregate statistics
- Search and filter data
- Manage indices

### Kibana Integration

**Configuration**
- URL: `http://kibana:5601/kibana`
- Credentials: Same as Elasticsearch

**Operations**
- Visualize data
- Create dashboards
- Monitor system health

### GeoIP Service

**Configuration**
- URL: `http://geo-ip:8000/ip-info/`

**Operations**
- IP geolocation
- Location data retrieval
- Map visualization data

## Deployment

### Docker Configuration

**Base Image**
- Python 3.13.2-slim-bookworm
- Poetry for dependency management

**Environment Variables**
- `PIP_MIRROR_HOST`: PyPI mirror host
- `TZ`: Timezone (Asia/Tehran)

**Port Configuration**
- Exposed port: 8088
- FastAPI runs with 1 worker

**Dependencies**
- Installed via Poetry
- Mirrored through internal PyPI host
- No cache during installation

### Development Mode

**Command**
```bash
poetry run fastapi dev src/gai_cti_backend --port 8088
```

**Features**
- Auto-reload on code changes
- Swagger UI at `/docs`
- ReDoc at `/redoc`
- Hot module replacement

### Production Mode

**Command**
```bash
poetry run fastapi run --workers 1 src/gai_cti_backend --port 8088
```

**Production Considerations**
- Single worker process (for compatibility)
- Behind reverse proxy (Nginx)
- SSL/TLS termination at proxy level

## Development Workflow

### Code Formatting

**Pre-commit Hooks**
- Black: Code formatting
- Isort: Import sorting
- Configured in `.pre-commit-config.yaml`

**Usage**
```bash
# Run pre-commit hooks
pre-commit run --all-files

# Or commit from within containers (hooks auto-trigger)
git commit -m "message"
```

### Testing

**Framework**
- pytest
- pytest-asyncio for async tests
- Test configuration in `pytest.ini`

**Test Structure**
```
tests/
├── __init__.py
├── conftest.py          # Fixtures
├── models.py            # Model tests
├── opencti/             # OpenCTI integration tests
├── routes/              # API endpoint tests
└── ...
```

**Running Tests**
```bash
pytest
pytest tests/opencti/
pytest tests/routes/
```

### Development Tools

**gql2python Tool**
- Converts GraphQL queries to Python code
- Usage:
  1. Copy GraphQL POST data from browser dev tools
  2. Paste into `tools/gql2python/input.json`
  3. Run: `poetry run python ./tools/gql2python/main.py`

**gen_metadata_for_logs Tool**
- Processes log archives from Mordor dataset
- Extracts timestamp data
- Usage: Set `main_path` parameter in script

**extract_data_from_mitre_for_front Tool**
- Extracts MITRE ATT&CK data for frontend
- Documentation coming soon

## Configuration

### Main Configuration (`conf.py`)

**OpenCTI**
```python
opencti_gql_url = "http://opencti:8080/open-cti/graphql"
opencti_admin_token = "f3ca64ff-9082-4757-9e87-880be59462d1"
```

**Redis Connections**
```python
redis_conn_info = {
    "host": "redis-backend",
    "port": 6379,
    "db": 0,
    "decode_responses": True,
}
auth_redis_conn_info = {
    "host": "redis-auth",
    "port": 6379,
    "db": 0,
    "decode_responses": True,
}
```

**Elasticsearch**
```python
elastic_conn_info = {
    "url": "http://elasticsearch:9200",
    "username": "elastic",
    "password": "elastic12345678",
}
```

**Kibana**
```python
kibana_conn_info = {
    "url": "http://kibana:5601/kibana",
    "username": "elastic",
    "password": "elastic12345678",
}
```

**Celery**
```python
celery_info = {
    "broker_url": "redis://redis-backend:6379/0",
    "result_backend": "redis://redis-backend:6379/0",
}
```

### Environment Variables

**Production**
- `OPENCTI_URL`: OpenCTI GraphQL endpoint
- `OPENCTI_TOKEN`: OpenCTI authentication token
- `REDIS_HOST`: Redis server hostname
- `ELASTICSEARCH_URL`: Elasticsearch endpoint
- `KIBANA_URL`: Kibana endpoint
- `GEOIP_URL`: GeoIP service URL

**Development**
- Use `conf.py` defaults for local development
- Override with environment variables as needed

## Data Flow

### Threat Intelligence Flow

1. **Feed Collection** → OpenCTI connectors pull IoCs
2. **Processing** → Background tasks cache and process data
3. **Storage** → Elasticsearch stores indicators and metadata
4. **Analysis** → LLM agent analyzes threats
5. **Visualization** → Dashboard renders visualizations
6. **User Access** → API serves data to frontend

### Alert Processing Flow

1. **Detection** → Rules generate alerts
2. **Storage** → Elasticsearch stores alerts with logs
3. **Analysis** → AI agent processes alert context
4. **Enrichment** → Threat intelligence data added
5. **Notification** → Real-time updates via WebSocket
6. **User Action** → User reviews and responds

### APT Detection Flow

1. **Scheduled Run** → Periodic detection job
2. **Data Collection** → Gather indicators and signatures
3. **Analysis** → ML models identify adversary patterns
4. **Profiling** → Generate adversary profiles
5. **Reporting** → Update dashboards and visualizations
6. **Alerting** → Notify on high-confidence detections

## Performance Optimization

### Caching Strategy

**Multi-level Caching**
1. Redis for real-time data
2. In-memory for request-scoped data
3. Computed values cached with TTL

**Cache Invalidation**
- Time-based expiration
- Event-driven invalidation
- Manual cache clearing via API

### Async Processing

**Celery Workers**
- Separate processes for background tasks
- Prevents event loop conflicts
- Configurable concurrency

**Async API**
- Non-blocking I/O for external calls
- Concurrent data fetching
- Efficient resource utilization

### Database Optimization

**Elasticsearch**
- Indexed fields for fast queries
- Aggregation pipelines for statistics
- Pagination for large result sets

**Redis**
- Efficient key-value storage
- Pub/Sub for real-time updates
- Session management

## Monitoring & Observability

### Health Checks

**API Health**
- `/api/utils/system/health` endpoint
- Returns system status and dependencies

**Service Status**
- OpenCTI connectivity
- Elasticsearch availability
- Redis connection
- Celery worker status

### Logging

**Application Logs**
- Structured logging with context
- Different log levels (INFO, WARNING, ERROR)
- Request/response logging

**Performance Metrics**
- Request duration
- Task execution time
- Cache hit/miss rates

### Metrics Collection

**System Metrics**
- Active task count
- Queue lengths
- Memory usage
- CPU utilization

**Business Metrics**
- Indicator count growth
- Alert volume
- Detection accuracy
- User engagement

## Troubleshooting

### Common Issues

**Elasticsearch Bootstrap Failure**
```
Error: vm.max_map_count [8192] is too low
```

**Solution**
```bash
sudo sysctl -w vm.max_map_count=262144
# Make permanent:
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl --system
```

**Celery Worker Issues**
- Check Redis connection
- Verify broker URL in `conf.py`
- Ensure worker processes are running

**Authentication Failures**
- Verify token in Redis
- Check auth Redis connection
- Validate JWT secret configuration

**Cache Inconsistency**
- Clear Redis cache via API
- Restart background tasks
- Check TTL configuration

### Debug Mode

**Enable Detailed Logging**
- Set log level to DEBUG in production
- Use `--log-level debug` with FastAPI
- Enable SQLAlchemy echo for queries

**Debug Endpoints**
- `/api/utils/cache/status` - Cache statistics
- `/api/utils/system/info` - System information
- `/api/utils/system/health` - Health check

## Security Considerations

### Authentication

**Token Management**
- JWT tokens with expiration
- Stored in Redis with TTL
- Refresh token mechanism

**Password Security**
- Hashed passwords (bcrypt)
- Strong password requirements
- Password reset flow

### Authorization

**Role-based Access Control**
- User roles: Admin, Analyst, Viewer
- Endpoint-level permissions
- Data-level permissions

**API Security**
- CORS restrictions
- Rate limiting (recommended)
- Input validation with Pydantic

### Data Protection

**Sensitive Data**
- Credentials in environment variables
- Token encryption in transit
- Secure WebSocket connections

**Audit Logging**
- Authentication events
- Data access patterns
- Configuration changes

## Future Enhancements

### Planned Features

**AI Capabilities**
- Multi-modal analysis (text, logs, network data)
- Predictive threat intelligence
- Automated response recommendations

**Integrations**
- Additional threat intelligence feeds
- SIEM system integration
- SOAR platform connectors

**Performance**
- Distributed task processing
- Improved caching strategies
- Database optimization

**User Experience**
- Advanced search capabilities
- Custom dashboard builder
- Report generation

## Appendix

### API Response Formats

**Standard Response**
```json
{
  "data": {...},
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error Response**
```json
{
  "detail": "Error message",
  "status_code": 500,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Data Types

**Threat Intelligence**
- IP Address
- Domain
- URL
- Hash (MD5, SHA1, SHA256)
- Email Address
- File Path

**Confidence Levels**
- 0-100 (integer)
- Thresholds: Low (0-30), Medium (31-70), High (71-100)

**Reliability Levels**
- A - Completely reliable
- B - Usually reliable
- C - Fairly reliable
- D - Not usually reliable
- E - Unreliable
- F - Reliability cannot be judged

**Severity Levels**
- Critical
- High
- Medium
- Low
- Informational

### MITRE ATT&CK Integration

**Tactics**
- Initial Access
- Execution
- Persistence
- Privilege Escalation
- Defense Evasion
- Credential Access
- Discovery
- Lateral Movement
- Collection
- Command and Control
- Exfiltration
- Impact

**Techniques**
- Mapped to tactics
- Scoring and specificity
- Coverage analysis

### External References

**Documentation**
- OpenCTI: https://docs.opencti.io
- FastAPI: https://fastapi.tiangolo.com
- Celery: https://docs.celeryproject.org
- LangChain: https://python.langchain.com

**Tools**
- Elasticsearch: https://www.elastic.co
- Redis: https://redis.io
- Kibana: https://www.elastic.co/kibana

## Support & Contact

For technical support and inquiries:
- Check the logs for error details
- Review the troubleshooting section
- Verify system health via health check endpoints
- Contact system administrators for infrastructure issues

---

*This documentation is generated for GAI-CTI Backend version 0.1.0*
*Last updated: 2024*