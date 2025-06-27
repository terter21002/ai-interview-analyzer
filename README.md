# AI Interview Analyzer - System Design & Implementation

### Key Features
- RESTful API for message ingestion
- Mock LLM service with realistic responses
- SQLite database for data persistence
- Session-based conversation threading
- Theme accumulation across messages
- Basic observability (logging, metrics)

### API Endpoints
- `POST /api/messages` - Submit user message
- `GET /api/sessions/:id` - Get conversation thread
- `GET /api/themes/:sessionId` - Get accumulated themes
- `GET /api/health` - Health check