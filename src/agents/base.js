class BaseAgent {
  constructor(name, description, messageBus) {
    this.name = name;
    this.description = description;
    this.messageBus = messageBus || null;
    this.id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.capabilities = [];
    this.stats = {
      tasksProcessed: 0,
      totalProcessingTime: 0,
      lastActive: null
    };
  }

  async initialize() {
    console.log(`[AGENT:${this.name}] Initializing...`);

    // Publish initialization event
    if (this.messageBus) {
      this.messageBus.publish({
        type: 'AGENT_INITIALIZED',
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date().toISOString()
      });
    }

    return true;
  }

  async process(input, context = {}) {
    if (!input) {
      throw new Error('Input is required');
    }

    const startTime = Date.now();

    // Log the start of processing
    if (this.messageBus) {
      this.messageBus.publish({
        type: 'AGENT_START_PROCESSING',
        agentId: this.id,
        agentName: this.name,
        input,
        context,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Update stats
      this.stats.lastActive = new Date().toISOString();

      // Call the specific processing method (to be implemented by subclasses)
      const result = await this.performProcessing(input, context);

      // Calculate processing time
      const processingTime = Date.now() - startTime;
      this.stats.totalProcessingTime += processingTime;
      this.stats.tasksProcessed++;

      // Log the completion
      if (this.messageBus) {
        this.messageBus.publish({
          type: 'AGENT_FINISH_PROCESSING',
          agentId: this.id,
          agentName: this.name,
          input,
          result,
          processingTime,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      // Log the error
      if (this.messageBus) {
        this.messageBus.publish({
          type: 'AGENT_ERROR',
          agentId: this.id,
          agentName: this.name,
          input,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    }
  }

  // This method should be overridden by subclasses
  async performProcessing(input, context) {
    throw new Error('performProcessing method must be implemented by subclass');
  }

  // Utility methods
  async sendMessage(type, payload) {
    if (this.messageBus) {
      this.messageBus.publish({
        type,
        agentId: this.id,
        agentName: this.name,
        ...payload,
        timestamp: new Date().toISOString()
      });
    }
  }

  async waitForMessage(filterFn, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Timeout waiting for message'));
      }, timeout);

      const unsubscribe = this.messageBus.subscribe((message) => {
        if (filterFn(message)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(message);
        }
      });
    });
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      stats: this.stats,
      isActive: true
    };
  }
}

module.exports = { BaseAgent };