const fs = require('fs');
const path = require('path');

class Deliverables {
  constructor(outputDir = './deliverables') {
    this.outputDir = outputDir;
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  save(taskId, content, metadata = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${taskId}.md`;
    const filepath = path.join(this.outputDir, filename);

    const frontmatter = `---
task_id: ${taskId}
created: ${new Date().toISOString()}
agent: ${metadata.agent || 'unknown'}
status: ${metadata.status || 'completed'}
---

`;

    fs.writeFileSync(filepath, frontmatter + content);
    return filepath;
  }

  list() {
    if (!fs.existsSync(this.outputDir)) return [];
    return fs.readdirSync(this.outputDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();
  }

  read(filename) {
    const filepath = path.join(this.outputDir, filename);
    if (!fs.existsSync(filepath)) return null;
    return fs.readFileSync(filepath, 'utf8');
  }

  summary() {
    const files = this.list();
    return {
      total: files.length,
      recent: files.slice(0, 5),
      outputDir: this.outputDir
    };
  }
}

module.exports = { Deliverables };
