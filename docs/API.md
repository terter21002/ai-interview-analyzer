# AI Interview Analyzer API Documentation

## Overview

The AI Interview Analyzer API provides endpoints for processing user messages, generating follow-up questions, and analyzing thematic content. The system uses a mock LLM service to simulate AI-powered analysis.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication. In production, implement JWT-based authentication.

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check the health status of the API and database connection.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "database": "connected"
  }
}
```

### 2. Submit Message

**POST** `/api/messages`

Submit a user message for analysis. The system will generate a follow-up question, identify themes, and store the conversation.

**Request Body:**
```json
{
  "content": "I like strong bitter beer",
  "sessionId": "optional-session-id" // Optional, creates new session if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-uuid",
      "sessionId": "session-uuid",
      "content": "I like strong bitter beer",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "response": {
      "followUp": "Can you describe what you enjoy most about bitter flavors?",
      "themeTag": "taste_profile: bitter",
      "confidence": 0.92,
      "metadata": {
        "model": "mock-gpt-4",
        "tokens": 75,
        "latency": 450
      }
    },
    "session": {
      "id": "session-uuid",
      "userId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "themes": [
      {
        "id": "theme-uuid",
        "sessionId": "session-uuid",
        "tag": "taste_profile: bitter",
        "confidence": 0.92,
        "firstOccurrence": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Session

**GET** `/api/sessions/:id`

Retrieve a complete conversation session with all messages, responses, and themes.

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "userId": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    },
    "messages": [
      {
        "id": "msg-1",
        "sessionId": "session-uuid",
        "content": "I like strong bitter beer",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "msg-2",
        "sessionId": "session-uuid",
        "content": "I enjoy the complexity and depth of bitter flavors",
        "timestamp": "2024-01-15T10:35:00.000Z",
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "responses": [
      {
        "id": "resp-1",
        "messageId": "msg-1",
        "followUp": "Can you describe what you enjoy most about bitter flavors?",
        "themeTag": "taste_profile: bitter",
        "confidence": 0.92,
        "llmMetadata": "{\"model\":\"mock-gpt-4\",\"tokens\":75,\"latency\":450}",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "resp-2",
        "messageId": "msg-2",
        "followUp": "What other bitter foods or drinks do you like?",
        "themeTag": "taste_profile: bitter_continued",
        "confidence": 0.95,
        "llmMetadata": "{\"model\":\"mock-gpt-4\",\"tokens\":80,\"latency\":380}",
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "themes": [
      {
        "id": "theme-1",
        "sessionId": "session-uuid",
        "tag": "taste_profile: bitter",
        "confidence": 0.95,
        "firstOccurrence": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

### 4. Get Themes

**GET** `/api/themes/:sessionId`

Retrieve accumulated themes for a session with aggregated statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "themes": [
      {
        "tag": "taste_profile: bitter",
        "count": 2,
        "totalConfidence": 1.87,
        "averageConfidence": 0.935,
        "firstOccurrence": "2024-01-15T10:30:00.000Z",
        "lastOccurrence": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `SESSION_NOT_FOUND` (404) - Session does not exist
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses

## Supported Theme Categories

The mock LLM service recognizes these theme patterns:

1. **Beverage Preferences**
   - Keywords: beer, drink, alcohol, brew
   - Tag: `beverage_preference: alcoholic`

2. **Taste Profiles**
   - Keywords: bitter, sour, sweet, spicy
   - Tag: `taste_profile: bitter`

3. **Food Preferences**
   - Keywords: food, eat, cook, restaurant
   - Tag: `food_preference: general`

4. **Entertainment**
   - Keywords: music, song, artist, band
   - Tag: `entertainment: music`

5. **Lifestyle**
   - Keywords: travel, vacation, trip, destination
   - Tag: `lifestyle: travel`

6. **Professional**
   - Keywords: work, job, career, profession
   - Tag: `professional: work`

## Conversation Chaining

- Messages in the same session are analyzed with conversation context
- Themes accumulate across the conversation
- Follow-up questions consider previous responses
- Theme confidence scores are updated based on new information

## Observability

The API includes:
- Structured logging with Winston
- Request/response logging with Morgan
- Performance metrics (latency, token usage)
- Health check endpoint
- Error tracking and reporting 