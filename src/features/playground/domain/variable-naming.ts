/**
 * Utility functions for variable naming in shared state
 */

/**
 * Validates a variable name against the allowed pattern
 * Variable names must start with a letter or underscore,
 * followed by letters, numbers, or underscores
 */
export function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Generates a variable name from a question text
 * Attempts to extract meaningful words and create a snake_case identifier
 */
export function generateVariableName(question: string): string {
  if (!question || question.trim().length === 0) {
    return "variable";
  }

  // Remove question marks and other punctuation
  let cleaned = question
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, "")
    .trim();

  // Replace spaces with underscores
  cleaned = cleaned.replace(/\s+/g, "_");

  // Remove any remaining non-alphanumeric characters except underscores
  cleaned = cleaned.replace(/[^a-z0-9_]/g, "");

  // If starts with number, prefix with "variable_"
  if (/^\d/.test(cleaned)) {
    cleaned = "variable_" + cleaned;
  }

  // If empty after cleaning, return default
  if (cleaned.length === 0) {
    return "variable";
  }

  // Try to extract meaningful words with synonyms
  const meaningfulWords: Record<string, string[]> = {
    name: ["name"],
    age: ["age", "old"],
    interest: ["interest", "interests"],
    favorite: ["favorite", "favourite"],
    subject: ["subject"],
    color: ["color", "colour"],
    hobby: ["hobby", "hobbies"],
    response: ["response", "answer"],
    think: ["think", "thought"],
  };

  const lowerQuestion = question.toLowerCase();
  const hasYour =
    lowerQuestion.includes("your") || lowerQuestion.includes("you");

  for (const [key, synonyms] of Object.entries(meaningfulWords)) {
    for (const synonym of synonyms) {
      if (cleaned.includes(synonym)) {
        // If question contains "your" or "you", prefix with "student_"
        if (hasYour) {
          return `student_${key}`;
        }
        return key;
      }
    }
  }

  return cleaned;
}

/**
 * Sanitizes a variable name to ensure it's valid
 * Converts to snake_case and removes invalid characters
 */
export function sanitizeVariableName(name: string): string {
  if (!name || name.trim().length === 0) {
    return "variable";
  }

  // Convert to lowercase and replace spaces with underscores
  let sanitized = name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  // If starts with number, prefix with underscore
  if (/^\d/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }

  // If empty after sanitization, return default
  if (sanitized.length === 0) {
    return "variable";
  }

  return sanitized;
}
