class MessageBus {
  constructor() {
    this.subscribers = [];
    this.history = [];
    this.maxHistory = 1000; // Keep last 1000 messages
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  publish(message) {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }

    // Store in history
    this.history.push(message);

    // Maintain history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message subscriber:', error);
      }
    });
  }

  getRecentMessages(count = 50) {
    return this.history.slice(-count);
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = { MessageBus };