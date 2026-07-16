const fs = require('fs');
const yaml = require('yaml');
const { Director } = require('./director');
const { Builder, Reviewer, Deployer, Researcher } = require('./workers');

function loadConfig() {
  const configPath = './config.yaml';
  const examplePath = './config.example.yaml';
  
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(content);
  }
  
  if (fs.existsSync(examplePath)) {
    console.log('[Agent Template] No config.yaml found. Using config.example.yaml');
    const content = fs.readFileSync(examplePath, 'utf8');
    return yaml.parse(content);
  }
  
  console.log('[Agent Template] No config found. Using defaults.');
  return {};
}

async function main() {
  console.log('=== Agent Template ===');
  console.log('Starting multi-agent system...\n');

  // Load configuration
  const config = loadConfig();

  // Create director
  const director = new Director(config);

  // Register workers
  director.registerWorker('builder', new Builder(config.workers?.builder));
  director.registerWorker('reviewer', new Reviewer(config.workers?.reviewer));
  director.registerWorker('deployer', new Deployer(config.workers?.deployer));
  director.registerWorker('researcher', new Researcher(config.workers?.researcher));

  console.log('\n[Agent Template] System ready.');
  console.log('[Agent Template] Registered workers:', Array.from(director.workers.keys()));
  console.log('\nUsage:');
  console.log('  const { Director } = require("./src/director");');
  console.log('  const plan = await director.plan("Build a REST API");');
  console.log('  // ... delegate and execute tasks\n');

  // Example: process a request
  if (process.argv[2]) {
    const request = process.argv.slice(2).join(' ');
    console.log(`\nProcessing: "${request}"\n`);
    
    const plan = await director.plan(request);
    console.log('Plan:', JSON.stringify(plan, null, 2));
    
    for (const task of plan.tasks) {
      const { taskId, worker } = await director.delegate(task);
      const result = await director.execute(taskId, worker);
      const review = await director.review(taskId, result);
      console.log(`\nTask ${taskId}: ${review.approved ? 'APPROVED' : 'NEEDS WORK'}`);
    }
    
    const report = await director.report();
    console.log('\nFinal Report:', JSON.stringify(report, null, 2));
  }
}

// Export for use as module
module.exports = { Director, loadConfig };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
