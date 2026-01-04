## 🛏 Recommended Directive for Kiro’s Documentation Style

> **Documentation Guideline for Code Generation & Updates**
>
> Kiro should include documentation only when the **purpose or flow of a file is not self-evident from context, naming, or structure.**
>
> ### ✅ Kiro should document when:
> - The file contains **non-trivial logic**, like algorithms, hooks with complex side effects, or event-driven flows.  
> - A function’s behavior depends on **external systems or side effects** (e.g., Stream Video SDK, Supabase RLS behavior, or real-time sync).  
> - There’s **domain-specific reasoning** (like how an SI “Playfield” interacts with “Playground” flows).  
> - The file implements a **pattern that isn’t standard** (custom state machines, middleware, or reactive pipelines).  
> - The naming could be **ambiguous** to a new developer joining the project.
>
> ### 🚫 Kiro should *not* document when:
> - The code’s **intent is already clear from its name** or folder context (e.g. `Button.tsx`, `flowService.ts`, `hooks/useFlowBuilder.ts`).  
> - The logic is a **simple CRUD operation**, React component, or utility function without complexity.  
> - The comments would **merely restate the code** (e.g. `// sets state to true` above `setState(true)`).
>
> ### 🧠 Style
> - When documenting, **describe the *why* not the *what*** — explain the design rationale or behavior flow.  
> - Keep comments at the **file-level** or **function-level**, not line-by-line.  
> - Prefer **docstrings and headers** over inline chatter.  
> - Use one clear doc comment at the top of files like:
>   ```ts
>   /**
>    * Handles synchronization between the local Playfield state and Stream Video
>    * when users join breakout rooms. This logic is not obvious from component names.
>    */
>   ```
>
> ### 🧬 Example:
> - ❌ Over-documenting:
>   ```ts
>   // This sets the name
>   const name = "Mark";
>   // This sets the age
>   const age = 24;
>   ```
> - ✅ Good documentation:
>   ```ts
>   /**
>    * Each breakout room manages its own subset of call members. This hook
>    * ensures Stream’s membership state reflects our `rooms` structure.
>    */
>   ```

---

## 🪶 TL;DR — Give Kiro This Short Version

> **Documentation Rule:**  
> Only document *why* something exists or *how* it fits into system flow.  
> Skip comments that restate what the code already makes clear.  
> Prioritize documenting side effects, domain logic, and non-obvious interactions (e.g. between Playfield, Playground, Supabase, and Stream).  
> Avoid documenting CRUD, UI layout, or atomic utilities.