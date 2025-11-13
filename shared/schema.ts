import { z } from "zod";

export const taskStatusSchema = z.enum([
  "pending",
  "in-progress",
  "done",
  "blocked",
  "deferred",
  "cancelled"
]);

export const taskPrioritySchema = z.enum(["high", "medium", "low"]);

export type Task = {
  id: number | string;
  title: string;
  description: string;
  status: z.infer<typeof taskStatusSchema>;
  priority?: z.infer<typeof taskPrioritySchema>;
  dependencies?: (number | string)[];
  subtasks?: Task[];
};

export const taskSchema: z.ZodType<Task> = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema.optional(),
  dependencies: z.array(z.union([z.number(), z.string()])).default([]).optional(),
  subtasks: z.lazy((): z.ZodType<Task[]> => z.array(taskSchema)).optional(),
});

export const issueSeveritySchema = z.enum(["critical", "high", "medium", "low"]);

export const issueStatusSchema = z.enum(["open", "in-progress", "resolved"]);

export const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: issueSeveritySchema,
  status: issueStatusSchema,
  relatedTaskId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertIssueSchema = issueSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type Issue = z.infer<typeof issueSchema>;
export type IssueStatus = z.infer<typeof issueStatusSchema>;
export type IssueSeverity = z.infer<typeof issueSeveritySchema>;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
