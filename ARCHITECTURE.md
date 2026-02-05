```markdown
# Architecture & Design Decisions

## System Architecture

┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                            │
│ ┌────────────────┐              ┌────────────────┐          │
│ │ Reconciliation │              │ Data Quality   │          │
│ │ Components     │              │ Components     │          │
│ └────────┬───────┘              └────────┬───────┘          │
│          │                               │                  │
│          └────────────┬──────────────────┘                  │
│                       │                                     │
│                  ┌────▼─────┐                               │
│                  │ API Layer│                               │
│                  │ (Axios)  │                               │
│                  └────┬─────┘                               │
└───────────────────────┼─────────────────────────────────────┘
                        │ HTTP/JSON
                        │
┌───────────────────────▼──────────────────────────────────────┐
│               Backend (Node.js/Express)                      │
│                                                              │
│     ┌──────────────┐         ┌──────────────┐                │
│     │ Routes       │────────▶│ Controllers  │                │
│     └──────────────┘         └──────┬───────┘                │
│                                     │                        │
│           ┌─────────────────────────┼────────────────┐       │
│           │                         │                │       │
│      ┌────▼───────┐           ┌─────▼──────┐  ┌──────▼──────┐│
│      │ Gemini     │           │ Data       │  │ LogHelper   ││
│      │ Service    │           │ Quality    │  │             ││
│      │            │           │ Service    │  │             ││
│      └────┬───────┘           └─────┬──────┘  └──────┬──────┘│
│           │                         │                │       │
│           │              ┌──────────▼────┐           │       │
│           └─────────────▶│ Cache Helper  │◀──────────┘       │
│                          └───────┬───────┘                   │
│                                  │                           │
│                          ┌───────▼────────┐                  │
│                          │ SQLite DB      │                  │
│                          │                │                  │
│                          │ - llm_cache    │                  │
│                          │ - api_logs     │                  │
│                          │ - recon_hist   │                  │
│                          │ - quality_logs │                  │
│                          └────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
                                    │
                                    │ External API
                                    │
                            ┌───────▼────────┐
                            │ Google Gemini  │
                            │ 2.5 Flash API  │
                            └────────────────┘


## Backend Architecture

### Layered Design

**1. Routes Layer** (`src/routes/`)
- Endpoint definitions
- Input validation with express-validator
- Route-specific middleware

**2. Controllers Layer** (`src/controllers/`)
- Request/response handling
- Business logic orchestration
- Error handling

**3. Services Layer** (`src/services/`)
- Core business logic
- External API integration (Gemini)
- Data processing algorithms

**4. Middleware Layer** (`src/middleware/`)
- Cross-cutting concerns
- Authentication, rate limiting, logging

**5. Data Layer** (`src/config/`, `src/utils/`)
- Database operations
- Caching logic
- Utility functions


## Frontend Architecture:
-- Component Structure:
    src/
    ├── components/
    │   ├── ReconciliationForm.jsx      # Input form for medication sources
    │   ├── ReconciliationResult.jsx    # Display AI reconciliation results
    │   ├── DataQualityForm.jsx         # Patient data input (form + JSON modes)
    │   └── DataQualityDashboard.jsx    # Visual quality score breakdown
    ├── services/
    │   └── api.js                       # Axios instance + API methods
    ├── styles/
    │   └── App.css                      # Global styles + component styles
    └── App.js                           # Main app with tab navigation

