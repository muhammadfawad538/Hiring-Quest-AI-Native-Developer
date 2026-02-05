const express = require('express');
const { Orchestrator } = require('./core/orchestrator');
const { Logger } = require('./utils/logger');

// Initialize the application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('src/ui'));

// Initialize orchestrator
const orchestrator = new Orchestrator();

// Initialize logger
const logger = new Logger();

// API routes
app.post('/api/process', async (req, res) => {
  try {
    const { userInput } = req.body;

    logger.info('Received user input:', { userInput });

    // Process the input through the orchestrator
    const result = await orchestrator.process(userInput);

    logger.info('Processing completed', { result: typeof result });

    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error processing request:', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get logs endpoint
app.get('/api/logs', (req, res) => {
  const logs = logger.getRecentLogs();
  res.json(logs);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/ui/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`AI Orchestra server running at http://localhost:${port}`);
  logger.info(`AI Orchestra server started on port ${port}`);
});

module.exports = { app };