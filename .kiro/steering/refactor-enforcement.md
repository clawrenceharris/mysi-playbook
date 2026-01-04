## **Refactor Enforcement Layer**

### Purpose

Ensure Kiro consistently performs structured code cleanup and architectural optimization _after_ passing tests — without altering verified behavior.

---

### **Phase Trigger**

Refactor Phase begins **only when:**

- All tests are passing (“Green” confirmed).
- The most recent test cycle introduced new or modified code.
- No new tests have been written yet (to prevent skipping ahead to the next Red phase).

---

### **Refactor Objectives**

During the Refactor Phase, Kiro must:

1. **Identify Duplication:**

   - Scan for repeated logic, variables, component patterns, or test setup code.
   - Consolidate duplicates into reusable helpers, hooks, or utility functions.

2. **Simplify & Clarify:**

   - Remove dead code, redundant conditionals, or unnecessary complexity.
   - Improve naming for clarity and semantic accuracy (prefer intent-revealing names).

3. **Optimize Readability & Cohesion:**

   - Enforce consistent formatting and folder structure.
   - Ensure each module has a single, clear responsibility.

4. **Preserve Behavior:**
   - Run the full test suite again after refactoring.
   - If any test fails, immediately revert and re-evaluate.

---

### **Phase Exit Criteria**

- All tests pass successfully after refactoring.
- Code quality has been reviewed for duplication, clarity, and maintainability.
- Kiro explicitly outputs a **“Refactor Summary”** before returning to Red phase, e.g.:

> **Refactor Summary:**  
> • Removed duplicate logic in `ToolbarUtils.ts`  
> • Renamed `ctx` → `context` for clarity  
> • Tests re-executed: All Green

---

### **Prohibited Actions**

- Do **not** add new functionality or new tests during Refactor Phase.
- Do **not** skip refactor once Green is achieved.
- Do **not** rewrite stable logic unless improving readability, modularity, or eliminating duplication.

---

### **Audit Enforcement**

Before starting a new Red phase, confirm the previous Refactor Phase was completed with a summary that includes the keywords “duplication,” “clarity,” and “tests re-executed.”  
If missing, perform Refactor Phase retroactively before continuing.
