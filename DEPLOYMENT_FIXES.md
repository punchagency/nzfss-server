# NZFSS Server Deployment Fixes

## Issues Resolved

### 1. Database Connection Timeouts
- **Problem**: MongoDB connections timing out after 30 seconds
- **Solution**: Enhanced connection configuration with proper connection pooling
- **Changes**: Updated `src/utils/mongo.ts` with:
  - Increased `serverSelectionTimeoutMS` to 10 seconds
  - Added connection pooling (`maxPoolSize: 10`, `minPoolSize: 2`)
  - Added `maxIdleTimeMS` to close inactive connections
  - Added heartbeat monitoring and retry logic
  - Improved error handling and reconnection logic

### 2. Request Timeouts (Heroku H12 Errors)
- **Problem**: Requests timing out after 30 seconds on Heroku
- **Solution**: Added request timeout middleware and query timeouts
- **Changes**:
  - Added Express timeout middleware (25 seconds)
  - Added query timeouts in CalendarService (25 seconds max)
  - Optimized database queries to prevent long-running operations

### 3. Inefficient Database Queries
- **Problem**: Complex queries causing performance issues
- **Solution**: Optimized query patterns and added database indexes
- **Changes**:
  - Refactored `getAllCalendarEvents` method for better performance
  - Added database indexes for frequently queried fields
  - Implemented query timeouts and error handling
  - Used aggregation pipelines for complex queries

### 4. Missing Database Indexes
- **Problem**: Slow queries due to missing indexes
- **Solution**: Added comprehensive database indexes
- **Changes**: Created indexes for:
  - EventCalendar: `eventDate`, `public`, `clubId`, compound indexes
  - Entrant: `eventId`, `userId`, compound indexes
  - Point: `entrantId`, `eventId`
  - User: `role`, `email`

## Performance Improvements

### Database Connection
- Connection pooling with 2-10 connections
- Automatic connection cleanup after 30 seconds of inactivity
- Heartbeat monitoring every 10 seconds
- Retry logic with exponential backoff

### Query Optimization
- Query timeouts to prevent long-running operations
- Lean queries to reduce memory usage
- Aggregation pipelines for complex operations
- Proper error handling and fallbacks

### Server Configuration
- Request timeout middleware (25 seconds)
- Enhanced error logging and monitoring
- Health check endpoint with detailed status
- Graceful shutdown handling

## Deployment Steps

1. **Rebuild the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Heroku**:
   ```bash
   git add .
   git commit -m "Fix database timeouts and optimize performance"
   git push heroku main
   ```

3. **Monitor the logs**:
   ```bash
   heroku logs --tail
   ```

4. **Check health endpoint**:
   ```bash
   curl https://your-app.herokuapp.com/health
   ```

## Environment Variables

Ensure these environment variables are set in Heroku:
- `MONGODB_STRING`: Your MongoDB connection string
- `NODE_ENV`: Set to `production`
- `PORT`: Heroku will set this automatically

## Monitoring

The application now includes:
- Detailed health check endpoint at `/health`
- Enhanced logging for database operations
- Request timeout monitoring
- Connection status tracking

## Expected Results

After deployment, you should see:
- Reduced database connection timeouts
- Faster query response times
- No more H12 timeout errors
- Better overall application stability
- Improved error handling and recovery 