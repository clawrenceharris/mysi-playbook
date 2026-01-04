export interface PlaygroundUpdateEvent {
  type: string;
  slideId: string;
  accessor: "assignments" | "responses" | "assignmentResponses";
  value: Record<string, unknown> | null;
}
