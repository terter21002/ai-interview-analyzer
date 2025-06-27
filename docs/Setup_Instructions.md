# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database (SQLite is used by default)
DB_PATH=database/interview_analyzer.db
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Testing the API

1. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Submit a Message**
   ```bash
   curl -X POST http://localhost:3000/api/messages \
     -H "Content-Type: application/json" \
     -d '{"content": "I like strong bitter beer"}'
   ```

3. **Get Session**
   ```bash
   curl http://localhost:3000/api/sessions/{session-id}
   ```

4. **Get Themes**
   ```bash
   curl http://localhost:3000/api/themes/{session-id}
   ```

## Using Postman

1. Import the Postman collection from `docs/Postman_Collection.json`
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Test the endpoints

## Project Structure

```
ai-interview-analyzer/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── app.ts           # Main application file
├── database/            # Database files and migrations
├── docs/                # Documentation
├── logs/                # Application logs
├── tests/               # Test files
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change the port in .env file
   PORT=3001
   ```

2. **Database connection issues**
   ```bash
   # Ensure database directory exists
   mkdir -p database
   npm run db:migrate
   ```

3. **TypeScript compilation errors**
   ```bash
   # Clean and rebuild
   rm -rf dist/
   npm run build
   ```

4. **Permission issues (Windows)**
   ```bash
   # Run PowerShell as Administrator
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Logs

Check the logs directory for detailed error information:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Development

### Adding New Features

1. **New API Endpoint**
   - Add route in `src/routes/`
   - Add controller in `src/controllers/`
   - Add service logic in `src/services/`

2. **Database Changes**
   - Create migration in `src/database/migrate.ts`
   - Update models in `src/models/`
   - Update types in `src/types/`

3. **LLM Integration**
   - Replace mock service in `src/services/llmService.ts`
   - Add environment variables for API keys
   - Update error handling

### Code Quality

- Run linter: `npm run lint`
- Fix auto-fixable issues: `npm run lint:fix`
- Follow TypeScript best practices
- Add tests for new features

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=warn
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Use a process manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name "interview-analyzer"
   ```

## Monitoring

- Health check endpoint: `GET /api/health`
- Application logs in `logs/` directory
- Database file: `database/interview_analyzer.db`

## Security Considerations

- Rate limiting is enabled (100 requests per 15 minutes)
- CORS is configured for specified origins
- Helmet.js provides security headers
- Input validation on all endpoints
- SQL injection protection via parameterized queries 