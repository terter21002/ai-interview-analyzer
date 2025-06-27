# Frontend Integration Guide

## Quick Start

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Basic API Client
```javascript
class InterviewAPI {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async submitMessage(content, sessionId = null) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sessionId })
    });
    return response.json();
  }

  async getSession(sessionId) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);
    return response.json();
  }

  async getThemes(sessionId) {
    const response = await fetch(`${this.baseUrl}/themes/${sessionId}`);
    return response.json();
  }
}
```

### React Hook Example
```javascript
import { useState, useCallback } from 'react';

export function useInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitMessage = useCallback(async (content) => {
    setLoading(true);
    try {
      const result = await interviewAPI.submitMessage(content, sessionId);
      if (result.success) {
        setSessionId(result.data.session.id);
        setMessages(prev => [...prev, result.data.message]);
        setResponses(prev => [...prev, result.data.response]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { sessionId, messages, responses, loading, submitMessage };
}
```

### Usage Example
```javascript
function InterviewChat() {
  const { sessionId, messages, responses, loading, submitMessage } = useInterview();
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitMessage(input);
    setInput('');
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={msg.id}>
          <p><strong>You:</strong> {msg.content}</p>
          {responses[i] && (
            <p><strong>AI:</strong> {responses[i].followUp}</p>
          )}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

## Key Features

1. **Session Management** - Messages are grouped into conversation sessions
2. **Theme Detection** - AI identifies themes like "taste_profile: bitter"
3. **Follow-up Questions** - AI generates contextual follow-up questions
4. **Confidence Scoring** - Each analysis includes a confidence score
5. **Conversation Chaining** - Context is maintained across messages

## Error Handling
```javascript
try {
  const result = await interviewAPI.submitMessage(content);
} catch (error) {
  if (error.message.includes('Session not found')) {
    // Handle session not found
  } else if (error.message.includes('Rate limit')) {
    // Handle rate limiting
  } else {
    // Handle other errors
  }
}
```