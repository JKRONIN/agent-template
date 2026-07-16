const { TaskQueue } = require('./tasks');
const { Deliverables } = require('./deliverables');

class Director {
  constructor(config = {}) {
    this.config = config;
    this.taskQueue = new TaskQueue(config.task_management);
    this.deliverables = new Deliverables(config.deliverables?.output_dir);
    this.workers = new Map();
  }

  registerWorker(name, worker) {
    this.workers.set(name, worker);
    console.log(`[Director] Registered worker: ${name}`);
  }

  async plan(request) {
    console.log(`[Director] Planning: "${request}"`);
    
    // In a real implementation, this would call an LLM to break down the request
    // For now, return a simple task breakdown
    return {
      request,
      tasks: [
        {
          title: `Analyze: ${request}`,
          description: `Understand and analyze the request: ${request}`,
          assigned_to: 'researcher',
          priority: 1
        },
        {
          title: `Implement: ${request}`,
          description: `Build the solution for: ${request}`,
          assigned_to: 'builder',
          priority: 2
        },
        {
          title: `Review: ${request}`,
          description: `Review the implementation of: ${request}`,
          assigned_to: 'reviewer',
          priority: 3
        }
      ]
    };
  }

  async delegate(task) {
    const workerName = task.assigned_to;
    const worker = this.workers.get(workerName);
    
    if (!worker) {
      console.error(`[Director] No worker found for: ${workerName}`);
      return null;
    }

    const taskId = this.taskQueue.add(task);
    console.log(`[Director] Delegated task ${taskId} to ${workerName}`);
    
    return { taskId, worker: workerName };
  }

  async execute(taskId, workerName) {
    const worker = this.workers.get(workerName);
    if (!worker) throw new Error(`Worker not found: ${workerName}`);

    const task = this.taskQueue.start(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    try {
      console.log(`[Director] Executing ${taskId} with ${workerName}`);
      const result = await worker.execute(task);
      this.taskQueue.complete(taskId, result);
      
      // Save deliverable
      this.deliverables.save(taskId, result.content || JSON.stringify(result), {
        agent: workerName,
        status: 'completed'
      });
      
      return result;
    } catch (error) {
      console.error(`[Director] Task ${taskId} failed:`, error.message);
      this.taskQueue.fail(taskId, error.message);
      throw error;
    }
  }

  async review(taskId, result) {
    console.log(`[Director] Reviewing task ${taskId}`);
    
    // In a real implementation, this would call an LLM to review the output
    const approved = result && result.content && result.content.length > 0;
    
    return {
      taskId,
      approved,
      feedback: approved ? 'Looks good!' : 'Needs improvement'
    };
  }

  async report() {
    const status = this.taskQueue.getStatus();
    const deliverables = this.deliverables.summary();
    
    return {
      tasks: status,
      deliverables,
      workers: Array.from(this.workers.keys())
    };
  }

  getStatus() {
    return this.taskQueue.getStatus();
  }
}

module.exports = { Director };
