# AI Interview Analyzer - System Design & Implementation

## Part 1: System Design Document

### 1. Overview

This system ingests user interview responses, analyzes them with an LLM to generate follow-up questions and thematic tags, and stores structured insights for later retrieval and analysis. The design aims for scalability, cost-effectiveness, and GDPR compliance.

### 2. Scalable Architecture

#### 2.1 Interview Session Ingestion

**API Layer:**
- RESTful API (Express.js/Node.js) receives user messages
- Each message is associated with a session (conversation thread)
- Input validation and basic rate limiting
- JWT-based authentication for user sessions

**Scalability Approach:**
- Stateless API servers behind a load balancer (Nginx/AWS ALB)
- Horizontal scaling (add more servers as needed)
- Message queues (RabbitMQ/AWS SQS) for decoupling ingestion from processing
- Redis for session management and caching

#### 2.2 Follow-up Question Generation (LLM-based)

**LLM Service:**
- API server sends user message to LLM provider (OpenAI GPT-4, Azure OpenAI, or Anthropic Claude)
- Structured prompts for consistent output format
- Retry logic with exponential backoff
- Circuit breaker pattern for LLM service failures

**Prompt Engineering:**
- System prompt defines output format (JSON)
- Context includes conversation history for chaining
- Temperature setting for creativity vs consistency balance

#### 2.3 Thematic Tagging and Analysis

**Tagging Strategy:**
- LLM extracts theme tags using predefined taxonomy
- Confidence scoring based on LLM output probabilities
- Tag normalization and deduplication
- Hierarchical tagging (e.g., "taste_profile: bitter" → "preferences: taste")

**Analysis Pipeline:**
- Real-time processing for immediate responses
- Batch processing for historical analysis
- Theme accumulation across conversation threads
- Sentiment analysis integration

#### 2.4 Storing Structured Insights

**Database Design:**
- **Primary DB:** PostgreSQL for ACID compliance and complex queries
- **Schema:**
  - `sessions` (id, user_id, created_at, updated_at)
  - `messages` (id, session_id, content, timestamp)
  - `responses` (id, message_id, follow_up, theme_tag, confidence, llm_metadata)
  - `themes` (id, session_id, tag, confidence, first_occurrence)

**Data Retention:**
- Configurable retention policies
- GDPR-compliant data deletion
- Data anonymization for analytics

### 3. Technology Choices

#### 3.1 Core Technologies

**Backend:** TypeScript/Node.js with Express
- Strong typing for reliability
- Rich ecosystem for APIs and LLM integration
- Easy deployment and scaling

**Database:** PostgreSQL
- ACID compliance for data integrity
- JSONB support for flexible schema
- Excellent performance for complex queries
- Built-in full-text search

**LLM Provider:** OpenAI GPT-4
- Best-in-class performance for structured output
- Reliable API with good documentation
- Cost-effective for moderate usage

#### 3.2 Supporting Infrastructure

**Caching:** Redis
- Session storage
- LLM response caching
- Rate limiting

**Message Queue:** RabbitMQ (optional for high scale)
- Decouple ingestion from processing
- Handle LLM API rate limits
- Enable async processing

**Observability:** 
- Winston for structured logging
- Prometheus metrics
- Jaeger for distributed tracing

**Deployment:** Docker + Kubernetes
- Containerized microservices
- Auto-scaling capabilities
- Easy environment management

### 4. Cost, Scalability, and GDPR

#### 4.1 Cost Optimization

**LLM Costs:**
- Use GPT-3.5-turbo for non-critical responses
- Implement response caching for repeated queries
- Batch processing for historical analysis
- Monitor token usage and optimize prompts

**Infrastructure Costs:**
- Auto-scaling based on demand
- Reserved instances for predictable workloads
- CDN for static assets
- Database connection pooling

#### 4.2 Scalability Considerations

**Horizontal Scaling:**
- Stateless API design
- Database read replicas
- Redis cluster for high availability
- Load balancer with health checks

**Performance:**
- Database indexing on frequently queried fields
- LLM response caching
- Connection pooling
- Async processing for non-blocking operations

#### 4.3 GDPR Compliance

**Data Protection:**
- User consent management
- Right to be forgotten (data deletion)
- Data portability (export functionality)
- Data minimization (only collect necessary data)

**Security:**
- Encryption at rest and in transit
- Regular security audits
- Access logging and monitoring
- PII detection and handling

### 5. Tradeoffs and Alternative Approaches

#### 5.1 Technology Tradeoffs

**LLM Provider:**
- **OpenAI:** Best performance, higher cost
- **Azure OpenAI:** Better enterprise features, similar cost
- **Anthropic Claude:** Better safety, slower API
- **Self-hosted:** Lower cost, higher maintenance

**Database:**
- **PostgreSQL:** ACID compliance, complex queries
- **MongoDB:** Schema flexibility, eventual consistency
- **ClickHouse:** Analytics performance, limited transactions

#### 5.2 Architecture Alternatives

**Monolithic vs Microservices:**
- **Monolithic:** Simpler deployment, harder to scale
- **Microservices:** Better scalability, higher complexity

**Synchronous vs Asynchronous:**
- **Sync:** Immediate responses, higher latency
- **Async:** Better scalability, eventual consistency

### 6. Implementation Plan

#### Phase 1: MVP (Current Focus)
- Basic API with mock LLM
- SQLite database
- Simple session management
- Basic observability

#### Phase 2: Production Ready
- Real LLM integration
- PostgreSQL migration
- Authentication and authorization
- Enhanced observability

#### Phase 3: Scale
- Message queues
- Caching layer
- Auto-scaling
- Advanced analytics

---

## Part 2: Prototype Implementation

### Project Structure
```
ai-interview-analyzer/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.ts
├── database/
├── tests/
├── docs/
├── package.json
└── README.md
```

### Key Features
- RESTful API for message ingestion
- Mock LLM service with realistic responses
- SQLite database for data persistence
- Session-based conversation threading
- Theme accumulation across messages
- Basic observability (logging, metrics)
- Postman collection for testing

### API Endpoints
- `POST /api/messages` - Submit user message
- `GET /api/sessions/:id` - Get conversation thread
- `GET /api/themes/:sessionId` - Get accumulated themes
- `GET /api/health` - Health check

### Next Steps
1. Set up TypeScript project structure
2. Implement database models and migrations
3. Create API endpoints with validation
4. Build mock LLM service
5. Add session management and threading
6. Implement theme accumulation
7. Add observability and logging
8. Create Postman collection
9. Write integration documentation 