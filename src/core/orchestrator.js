const { MessageBus } = require('./message-bus');
const { BaseAgent } = require('../agents/base');

class Orchestrator {
  constructor() {
    this.agents = new Map();
    this.messageBus = new MessageBus();
    this.stateManager = new Map(); // Simple state manager for demo

    // Register default agents
    this.registerAgents();
  }

  registerAgents() {
    // This is where we'll dynamically load agents
    // For now, we'll simulate with placeholder agents
    console.log('[ORCHESTRATOR] Initializing agents...');

    // Simulate loading different agent types
    this.agentTypes = ['developer', 'designer', 'coordinator'];
    console.log('[ORCHESTRATOR] Available agent types:', this.agentTypes);
  }

  async process(userInput) {
    console.log(`[ORCHESTRATOR] Processing user input: "${userInput}"`);

    // Log the initial request
    this.messageBus.publish({
      type: 'USER_INPUT',
      content: userInput,
      timestamp: new Date().toISOString()
    });

    // Determine which agents to involve based on the input
    const selectedAgents = this.selectAgents(userInput);
    console.log(`[ORCHESTRATOR] Selected agents: ${selectedAgents.join(', ')}`);

    // Initialize task state
    const taskId = this.generateTaskId();
    this.stateManager.set(taskId, {
      userInput,
      agents: selectedAgents,
      steps: [],
      results: []
    });

    // Process through selected agents
    const results = [];
    for (const agentType of selectedAgents) {
      console.log(`[ORCHESTRATOR] Processing with agent: ${agentType}`);

      const agentResult = await this.processWithAgent(agentType, userInput, taskId);
      results.push(agentResult);

      // Update state
      const currentState = this.stateManager.get(taskId);
      currentState.results.push({ agent: agentType, result: agentResult });
      this.stateManager.set(taskId, currentState);
    }

    // Compile final result
    const finalResult = this.compileResults(results);

    // Log the completion
    this.messageBus.publish({
      type: 'TASK_COMPLETED',
      taskId,
      result: finalResult,
      timestamp: new Date().toISOString()
    });

    return finalResult;
  }

  selectAgents(userInput) {
    // Simple heuristic to select agents based on keywords
    const lowerInput = userInput.toLowerCase();

    const selected = [];

    if (lowerInput.includes('code') || lowerInput.includes('develop') || lowerInput.includes('implement')) {
      selected.push('developer');
    }

    if (lowerInput.includes('design') || lowerInput.includes('ui') || lowerInput.includes('interface')) {
      selected.push('designer');
    }

    // If no specific agent is identified, use coordinator
    if (selected.length === 0) {
      selected.push('coordinator');
    }

    return selected;
  }

  async processWithAgent(agentType, userInput, taskId) {
    // Simulate agent processing
    // In a real implementation, this would instantiate and call the actual agent
    console.log(`[ORCHESTRATOR] Agent ${agentType} processing task ${taskId}`);

    // Log the agent processing step
    this.messageBus.publish({
      type: 'AGENT_PROCESSING',
      agent: agentType,
      taskId,
      input: userInput,
      timestamp: new Date().toISOString()
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock result based on agent type
    let result;
    switch(agentType) {
      case 'developer':
        result = `Developer agent processed: "${userInput}". Suggested implementation approach...`;
        break;
      case 'designer':
        result = `Designer agent processed: "${userInput}". Suggested design elements...`;
        break;
      case 'coordinator':
      default:
        result = `Coordinator agent processed: "${userInput}". Coordinated task distribution...`;
        break;
    }

    // Log the agent result
    this.messageBus.publish({
      type: 'AGENT_RESULT',
      agent: agentType,
      taskId,
      result,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  compileResults(results) {
    return {
      success: true,
      compiledResults: results,
      summary: `Processed by ${results.length} agents`,
      timestamp: new Date().toISOString()
    };
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to get current state for debugging/monitoring
  getState() {
    return Object.fromEntries(this.stateManager);
  }
}

module.exports = { Orchestrator };