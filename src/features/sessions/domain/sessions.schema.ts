import z from "zod";

export const createSessionSchema = z.object({
  start_date: z.string().min(1, "Invalid date"),
  start_time: z.string().min(1, "Invalid time"),
  course_name: z.string().min(1, "This field is required"),
  topic: z.string().min(1, "This field is required"),
  status: z
    .enum(["active", "completed", "canceled", "scheduled"])
    .default("scheduled")
    .nonoptional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
