import { z } from "zod";

export const generatePlaybookSchema = z.object({
  virtual: z.boolean().default(false).optional(),
  topic: z.string("Please enter a topic"),
  course_name: z.string("Please enter the course name"),
  contexts: z.array(z.string()).default(["general"]).nonoptional(),
});

export type GeneratePlaybookInput = z.infer<typeof generatePlaybookSchema>;
