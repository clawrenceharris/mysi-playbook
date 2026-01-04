# Variable Reference System - User Guide

## Overview

The Variable Reference System allows you to create activities where data flows between slides. For example, you can collect student responses in one slide and display them in another slide.

## Quick Start

### Step 1: Create a Variable (Save Data)

1. Add a **Collect Input** or **Poll Vote** block to any slide
2. Check **"Save to shared state"** in the Configuartion Panel
3. Enter a **Variable Name** (or use the auto-generated name)
   - Example: `student_interest`, `favorite_topic`, `quiz_answer`

✅ Your variable is now available to use in later slides!

### Step 2: Use a Variable (Display Data)

**Option A: Using Autocomplete (Recommended)**

1. Add a **Display Prompt** block to a **later slide** and select it
2. In the **Content** field, type `{{`
3. An autocomplete menu will appear showing available variables
4. Select the variable you want to reference
5. The variable reference `{{variable_name}}` will be inserted

**Option B: Using the Dropdown**

1. Add a **Display Prompt** block to a **later slide** and select it
2. Click the **"Insert variable..."** dropdown above the Content field
3. Select the variable you want to reference
4. The variable reference `{{variable_name}}` will be inserted at cursor position

✅ When the activity runs, the actual data will be displayed!

## Example: Snowball Activity

### Slide 1: Write Questions

```
Block: Collect Input
Question: "Write a question about today's topic"
Variable Name: student_question ✓ Save to shared state
```

### Slide 2: Pick Questions

```
Block: Display Prompt
Content: "Pick a question to answer from the pool"
(Questions are managed by the activity logic)
```

### Slide 3: Display Your Question

```
Block: Display Prompt
Content: "You selected: {{student_question}}"
                        ↑ References the question from Slide 1
```

## Variable Syntax

### Basic Reference

```
{{variable_name}}
```

### In Sentences

```
Your answer was: {{student_answer}}
```

### Multiple Variables

```
{{student_name}} chose {{favorite_topic}} because {{reason}}
```

## Variable Types

The system supports different data types:

- 🔤 **Text** - Free-form text input
- 🔢 **Number** - Numeric values
- ☑️ **Multiple Choice** - Selected options
- ⭐ **Rating** - Rating values

## Important Rules

### ✅ DO:

- Use descriptive variable names: `student_interest` not `var1`
- Reference variables from **previous slides only**
- Use lowercase with underscores: `my_variable`
- Check "Save to shared state" to create variables

### ❌ DON'T:

- Reference variables from **future slides** (won't work)
- Use spaces in variable names: `my variable` ❌
- Use special characters: `my-variable!` ❌
- Forget to save to shared state

## Troubleshooting

### "No variables available"

- Make sure you have a Collect Input or Poll Vote block in a **previous slide**
- Ensure "Save to shared state" is checked
- Check that the variable has a name

### "Variable not showing data"

- Verify the variable name matches exactly (case-sensitive)
- Ensure the variable is from a **previous slide**, not the current or future slide
- Check that participants actually submitted data

### "Can't insert variable"

- Make sure you're in a Display Prompt block
- Click the Settings icon to open configuration
- Use the "Insert variable..." dropdown

## Advanced Patterns

### Conditional Display

```
{{student_name}}, you scored {{quiz_score}} points!
```

### Aggregated Data

```
The class average is {{class_average}}
Most popular answer: {{top_choice}}
```

### Personalized Content

```
Based on your interest in {{selected_topic}}, here are some resources...
```

## Tips & Best Practices

1. **Name variables clearly** - Future you will thank you
2. **Test your activity** - Use the Preview feature to test data flow
3. **Plan your slides** - Sketch out which slides produce and consume data
4. **Use meaningful prompts** - Help students understand what data they're providing
5. **Provide context** - Show students what they selected or answered

## Need Help?

- Check the [Shared State Implementation Guide](./SHARED_STATE_IMPLEMENTATION.md)
- Review the [Snowball Example](../examples/snowball-example.tsx)
- Look at the [Variable Extraction Tests](../domain/__tests__/variable-extraction.test.ts)

## Coming Soon

- 📊 Visual data flow diagram in slide sidebar
- ⚠️ Validation warnings for missing variables
- 🔄 Variable renaming with automatic updates
- 📝 Autocomplete when typing `{{`
- 👁️ Preview of variable values in editor
