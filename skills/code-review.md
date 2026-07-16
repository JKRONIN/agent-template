# Skill: Code Review

## Trigger
When a PR, diff, or code file is provided for review.

## Steps
1. Read the code thoroughly
2. Check for security vulnerabilities (SQL injection, XSS, etc.)
3. Check for performance issues (N+1 queries, unnecessary loops)
4. Check for style consistency (naming, formatting)
5. Check for edge cases and error handling
6. Provide structured feedback with line numbers

## Output Format
```markdown
## Code Review: [filename]

### Summary
Brief overview of the code quality.

### Issues Found
| Severity | Line | Issue | Suggestion |
|----------|------|-------|------------|
| High | 42 | SQL injection risk | Use parameterized queries |
| Medium | 78 | Missing error handling | Add try-catch block |

### Positive Notes
- Good use of constants
- Clear function naming

### Verdict
APPROVED / NEEDS CHANGES / REJECTED
```

## Severity Levels
- **High**: Security vulnerabilities, data loss risks
- **Medium**: Performance issues, missing error handling
- **Low**: Style inconsistencies, minor improvements
