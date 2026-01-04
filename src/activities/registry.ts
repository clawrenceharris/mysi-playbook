import { PlayfieldDefinition } from "@/types/playbook";
import { PlaybookDefinitionExtended } from "@/features/playground/compiler/compiler.types";
import { SnowballActivity } from "./plugins/snowball";
import { PassTheProblemActivity } from "./plugins/pass-the-problem";

const COMPILED_ACTIVITIES_KEY = "compiled-activities";

export const registry: Record<string, PlayfieldDefinition> = {
  snowball: SnowballActivity,
  "pass-the-problem": PassTheProblemActivity,
};

/**
 * Register a compiled activity from the playground to the activity registry
 * @param activity - The compiled activity definition with metadata
 * @throws Error if slug conflicts with existing hardcoded activity
 */
export function registerCompiledActivity(
  activity: PlaybookDefinitionExtended
): void {
  // Check for conflicts with hardcoded activities
  if (registry[activity.slug]) {
    throw new Error(
      `Activity slug "${activity.slug}" conflicts with an existing hardcoded activity`
    );
  }

  // Get existing compiled activities from localStorage
  const stored = localStorage.getItem(COMPILED_ACTIVITIES_KEY);
  const compiledActivities = stored ? JSON.parse(stored) : {};

  // Store the activity (will overwrite if slug already exists)
  compiledActivities[activity.slug] = {
    slug: activity.slug,
    title: activity.title,
    phases: activity.phases,
    metadata: activity.metadata,
    // Note: Functions (start, handleEvent, Component, HostControls) cannot be serialized
    // They will need to be reconstructed when loading
  };

  localStorage.setItem(
    COMPILED_ACTIVITIES_KEY,
    JSON.stringify(compiledActivities)
  );
}

/**
 * Get all compiled activities from localStorage
 * @returns Record of compiled activities by slug
 */
export function getCompiledActivities(): Record<
  string,
  PlaybookDefinitionExtended
> {
  const stored = localStorage.getItem(COMPILED_ACTIVITIES_KEY);
  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse compiled activities:", error);
    return {};
  }
}

/**
 * Get all activities (both hardcoded and compiled)
 * @returns Record of all activities by slug (all as PlaybookDefinitionExtended for consistency)
 */
export function getAllActivities(): Record<string, PlaybookDefinitionExtended> {
  const compiledActivities = getCompiledActivities();

  // Convert hardcoded activities to extended format
  const extendedRegistry: Record<string, PlaybookDefinitionExtended> = {};
  for (const [slug, activity] of Object.entries(registry)) {
    extendedRegistry[slug] = {
      ...activity,
      metadata: {
        sourceActivityId: slug,
        compiledAt: new Date(),
        compilerVersion: "hardcoded",
        isPlaygroundGenerated: false,
        canRecompile: false,
      },
    };
  }

  return {
    ...extendedRegistry,
    ...compiledActivities,
  };
}

/**
 * Check if an activity is a compiled (playground-generated) activity
 * @param slug - The activity slug to check
 * @returns true if the activity is compiled, false otherwise
 */
export function isCompiledActivity(slug: string): boolean {
  const compiledActivities = getCompiledActivities();
  return slug in compiledActivities;
}
