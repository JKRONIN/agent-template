const fs = require('fs');
const path = require('path');

class TaskQueue {
  constructor(config = {}) {
    this.maxConcurrent = config.max_concurrent || 3;
    this.timeout = (config.timeout_seconds || 300) * 1000;
    this.retryOnFailure = config.retry_on_failure !== false;
    this.maxRetries = config.max_retries || 2;
    
    this.queue = [];
    this.active = new Map();
    this.completed = [];
    this.failed = [];
  }

  add(task) {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const enriched = {
      id,
      ...task,
      status: 'pending',
      created_at: Date.now(),
      updated_at: Date.now(),
      retries: 0,
      result: null,
      error: null
    };
    this.queue.push(enriched);
    return id;
  }

  getNext() {
    if (this.active.size >= this.maxConcurrent) return null;
    return this.queue.shift() || null;
  }

  start(taskId) {
    const idx = this.queue.findIndex(t => t.id === taskId);
    let task;
    if (idx !== -1) {
      task = this.queue.splice(idx, 1)[0];
    } else {
      task = this.completed.find(t => t.id === taskId) ||
             this.failed.find(t => t.id === taskId);
    }
    if (!task) return null;
    
    task.status = 'running';
    task.updated_at = Date.now();
    this.active.set(taskId, task);
    return task;
  }

  complete(taskId, result) {
    const task = this.active.get(taskId);
    if (!task) return null;
    
    task.status = 'completed';
    task.result = result;
    task.updated_at = Date.now();
    this.active.delete(taskId);
    this.completed.push(task);
    return task;
  }

  fail(taskId, error) {
    const task = this.active.get(taskId);
    if (!task) return null;
    
    task.error = error;
    task.updated_at = Date.now();
    
    if (this.retryOnFailure && task.retries < this.maxRetries) {
      task.retries++;
      task.status = 'pending';
      this.active.delete(taskId);
      this.queue.push(task);
    } else {
      task.status = 'failed';
      this.active.delete(taskId);
      this.failed.push(task);
    }
    
    return task;
  }

  getStatus() {
    return {
      pending: this.queue.length,
      running: this.active.size,
      completed: this.completed.length,
      failed: this.failed.length
    };
  }

  toJSON() {
    return {
      queue: this.queue,
      active: Array.from(this.active.values()),
      completed: this.completed,
      failed: this.failed
    };
  }
}

module.exports = { TaskQueue };
