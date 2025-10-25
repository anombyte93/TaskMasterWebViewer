import { type Task, type Issue } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getIssues(): Promise<Issue[]>;
  createIssue(issue: Issue): Promise<Issue>;
  updateIssue(id: string, issue: Partial<Issue>): Promise<Issue | undefined>;
  deleteIssue(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private issues: Map<string, Issue>;

  constructor() {
    this.tasks = new Map();
    this.issues = new Map();
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values());
  }

  async createIssue(issue: Issue): Promise<Issue> {
    this.issues.set(issue.id, issue);
    return issue;
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined> {
    const issue = this.issues.get(id);
    if (!issue) return undefined;
    const updated = { ...issue, ...updates, updatedAt: new Date().toISOString() };
    this.issues.set(id, updated);
    return updated;
  }

  async deleteIssue(id: string): Promise<boolean> {
    return this.issues.delete(id);
  }
}

export const storage = new MemStorage();
