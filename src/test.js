const { Director } = require('./director');
const { Builder, Reviewer, Deployer, Researcher } = require('./workers');
const { TaskQueue } = require('./tasks');
const { Deliverables } = require('./deliverables');
const fs = require('fs');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) { console.log(`  ✓ ${name}`); passed++; }
  else { console.error(`  ✗ ${name}`); failed++; }
}

async function runTests() {
  console.log('\n=== Agent Template Tests ===\n');

  // --- TaskQueue ---
  console.log('TaskQueue:');
  const tq = new TaskQueue({ max_concurrent: 2, timeout_seconds: 60 });
  const id1 = tq.add({ title: 'Test 1', assigned_to: 'builder' });
  assert(typeof id1 === 'string' && id1.startsWith('task-'), 'add() returns task ID');
  assert(tq.getStatus().pending === 1, 'pending count after add');

  const task = tq.start(id1);
  assert(task.status === 'running', 'start() sets running status');
  assert(tq.getStatus().running === 1, 'running count after start');
  assert(tq.getStatus().pending === 0, 'pending drops after start');

  tq.complete(id1, { content: 'done' });
  assert(tq.getStatus().completed === 1, 'completed count after complete');
  assert(tq.getStatus().running === 0, 'running count drops to 0');

  // --- TaskQueue retry ---
  console.log('\nTaskQueue retry:');
  const tq2 = new TaskQueue({ retry_on_failure: true, max_retries: 1 });
  const id2 = tq2.add({ title: 'Retry test', assigned_to: 'builder' });
  tq2.start(id2);
  tq2.fail(id2, 'oops');
  assert(tq2.getStatus().pending === 1, 're-queued on first failure');
  tq2.start(id2);
  tq2.fail(id2, 'oops again');
  assert(tq2.getStatus().failed === 1, 'moved to failed after max retries');

  // --- Workers ---
  console.log('\nWorkers:');
  const builder = new Builder({ capabilities: ['code'] });
  assert(builder.name === 'builder', 'builder has correct name');
  assert(builder.canHandle({ required_capabilities: ['code'] }), 'builder handles code tasks');
  assert(!builder.canHandle({ required_capabilities: ['deploy'] }), 'builder rejects deploy tasks');
  const result = await builder.execute({ title: 'Build thing', description: 'A thing' });
  assert(result.content.includes('Build thing'), 'builder returns relevant content');

  const reviewer = new Reviewer();
  const reviewResult = await reviewer.execute({ title: 'Review thing' });
  assert(reviewResult.approved === true, 'reviewer approves clean code');

  const deployer = new Deployer();
  const deployResult = await deployer.execute({ title: 'Deploy thing' });
  assert(deployResult.deployed === true, 'deployer reports success');

  const researcher = new Researcher();
  const researchResult = await researcher.execute({ title: 'Research thing', description: 'info' });
  assert(researchResult.content.includes('Research thing'), 'researcher returns relevant content');

  // --- Director ---
  console.log('\nDirector:');
  const director = new Director({ task_management: { max_concurrent: 3 } });
  director.registerWorker('builder', builder);
  director.registerWorker('reviewer', reviewer);
  assert(director.workers.size === 2, 'director has 2 registered workers');

  const plan = await director.plan('Test request');
  assert(plan.tasks.length === 3, 'plan generates 3 tasks');
  assert(plan.tasks[0].assigned_to === 'researcher', 'first task assigned to researcher');

  // --- Deliverables ---
  console.log('\nDeliverables:');
  const tmpDir = '/tmp/hermes-test-deliverables-' + Date.now();
  const del = new Deliverables(tmpDir);
  const savedPath = del.save('test-1', '# Test output', { agent: 'builder' });
  assert(fs.existsSync(savedPath), 'deliverable file created');
  assert(savedPath.endsWith('.md'), 'deliverable is markdown');
  const content = fs.readFileSync(savedPath, 'utf8');
  assert(content.includes('task_id: test-1'), 'frontmatter has task_id');
  assert(content.includes('# Test output'), 'content preserved');
  assert(del.list().length === 1, 'list() returns saved deliverables');
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // --- Integration ---
  console.log('\nIntegration:');
  const dir2 = new Director();
  dir2.registerWorker('builder', new Builder());
  dir2.registerWorker('reviewer', new Reviewer());
  dir2.registerWorker('researcher', new Researcher());

  const { taskId, worker } = await dir2.delegate({ title: 'Integrate test', assigned_to: 'builder' });
  assert(typeof taskId === 'string', 'delegate returns taskId');
  assert(worker === 'builder', 'delegate returns correct worker');

  const execResult = await dir2.execute(taskId, worker);
  assert(execResult.content.length > 0, 'execute returns content');

  const review2 = await dir2.review(taskId, execResult);
  assert(review2.approved === true, 'review approves valid output');

  const report = await dir2.report();
  assert(report.tasks.completed >= 1, 'report shows completed tasks');
  assert(report.workers.length === 3, 'report lists all workers');

  // --- Summary ---
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
