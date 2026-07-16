class BaseWorker {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.capabilities = config.capabilities || [];
  }

  async execute(task) {
    throw new Error(`${this.name}.execute() not implemented`);
  }

  canHandle(task) {
    // Check if this worker can handle the task based on capabilities
    if (!task.required_capabilities) return true;
    return task.required_capabilities.some(cap => this.capabilities.includes(cap));
  }
}

class Builder extends BaseWorker {
  constructor(config = {}) {
    super('builder', config);
  }

  async execute(task) {
    console.log(`[Builder] Building: ${task.title}`);
    
    // In a real implementation, this would call an LLM to generate code
    return {
      content: `## Implementation: ${task.title}\n\nTask completed successfully.\n\n### What was built:\n- ${task.description}\n\n### Files created:\n- (generated code would go here)\n`,
      artifacts: []
    };
  }
}

class Reviewer extends BaseWorker {
  constructor(config = {}) {
    super('reviewer', config);
  }

  async execute(task) {
    console.log(`[Reviewer] Reviewing: ${task.title}`);
    
    return {
      content: `## Review: ${task.title}\n\n### Findings:\n- Code structure: ✓ Good\n- Security: ✓ No issues found\n- Performance: ✓ Acceptable\n- Style: ✓ Consistent\n\n### Verdict: APPROVED\n`,
      approved: true,
      issues: []
    };
  }
}

class Deployer extends BaseWorker {
  constructor(config = {}) {
    super('deployer', config);
  }

  async execute(task) {
    console.log(`[Deployer] Deploying: ${task.title}`);
    
    return {
      content: `## Deployment: ${task.title}\n\n### Status: SUCCESS\n\n### Steps completed:\n1. Build verified\n2. Tests passed\n3. Deployed to target\n4. Health check passed\n`,
      deployed: true,
      url: null
    };
  }
}

class Researcher extends BaseWorker {
  constructor(config = {}) {
    super('researcher', config);
  }

  async execute(task) {
    console.log(`[Researcher] Researching: ${task.title}`);
    
    return {
      content: `## Research: ${task.title}\n\n### Summary:\n${task.description}\n\n### Key findings:\n- (research results would go here)\n\n### Sources:\n- (citations would go here)\n`,
      sources: []
    };
  }
}

module.exports = { BaseWorker, Builder, Reviewer, Deployer, Researcher };
