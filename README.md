# Agent Template

A plug-and-play multi-agent orchestration system. Fork this repo to set up your own AI agent team.

## Quick Start

```bash
# 1. Clone the template
git clone https://github.com/JKRONIN/agent-template.git my-agents
cd my-agents

# 2. Install dependencies
npm install

# 3. Configure your agents
cp config.example.yaml config.yaml
# Edit config.yaml with your API keys and agent settings

# 4. Start the system
npm start
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Director Agent             │
│         (Plans, Delegates, Reviews)     │
├─────────┬─────────┬─────────┬──────────┤
│ Worker 1│ Worker 2│ Worker 3│ Worker 4 │
│ (Build) │ (Review)│ (Deploy)│ (Research)│
└─────────┴─────────┴─────────┴──────────┘
```

## Agents

### Director (Router)
- Receives user requests
- Plans task breakdown
- Delegates to best-fit worker
- Reviews output
- Reports results

### Workers
- **Builder**: Takes specs, writes code, creates features
- **Reviewer**: Code review, quality checks, security audit
- **Deployer**: Server ops, CI/CD, infrastructure
- **Researcher**: Information gathering, analysis, documentation

## Configuration

Edit `config.yaml`:

```yaml
director:
  model: gpt-4
  temperature: 0.7

workers:
  builder:
    model: gpt-4
    capabilities: [code, tests, docs]
  reviewer:
    model: gpt-4
    capabilities: [review, security, performance]
  deployer:
    model: gpt-4
    capabilities: [server, ci, infra]
  researcher:
    model: gpt-4
    capabilities: [search, analysis, writing]

task_management:
  max_concurrent: 3
  timeout: 300
  retry_on_failure: true
```

## Task Flow

1. User submits request → Director
2. Director breaks into tasks → Task Queue
3. Workers pick up tasks → Execute
4. Results → Director for review
5. Director reports → User

## File Structure

```
agent-template/
├── config.example.yaml    # Template config
├── config.yaml            # Your config (gitignored)
├── package.json
├── src/
│   ├── director.js        # Director agent logic
│   ├── workers/           # Worker implementations
│   │   ├── builder.js
│   │   ├── reviewer.js
│   │   ├── deployer.js
│   │   └── researcher.js
│   ├── tasks.js           # Task queue & management
│   └── deliverables.js    # Output packaging
├── skills/                # Reusable skill definitions
│   ├── code-review.md
│   ├── deployment.md
│   └── research.md
├── deliverables/          # Generated outputs
└── README.md
```

## Adding Skills

Create a new file in `skills/`:

```markdown
# Skill: Code Review

## Trigger
When a PR or diff is provided

## Steps
1. Read the diff
2. Check for security issues
3. Check for performance issues
4. Check for style consistency
5. Provide feedback with line numbers

## Output
A structured review with severity ratings
```

## Extending Workers

Add a new worker in `src/workers/`:

```javascript
class MyWorker {
  constructor(config) {
    this.config = config;
  }
  
  async execute(task) {
    // Your worker logic here
    return { result: 'done' };
  }
}
```

## License

MIT
