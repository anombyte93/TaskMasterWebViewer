import { promises as fs } from 'fs';
import path from 'path';
import type { Issue, InsertIssue } from '../../shared/schema';
import { issueSchema, insertIssueSchema } from '../../shared/schema';

/**
 * IssueService - Manages CRUD operations for issues stored in .taskmaster/issues/
 *
 * Issues are stored as individual JSON files named {id}.json in the .taskmaster/issues/ directory.
 * Each issue has a unique ID generated using timestamp and random string.
 */
class IssueService {
  private issuesDir: string;

  /**
   * Creates an instance of IssueService
   * @param projectRoot - Root directory of the project (defaults to process.cwd())
   */
  constructor(projectRoot?: string) {
    const root = projectRoot || process.cwd();
    this.issuesDir = path.join(root, '.taskmaster', 'issues');
  }

  /**
   * Initialize the service by creating the issues directory if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.issuesDir, { recursive: true });
      console.log('[IssueService] Initialized issues directory:', this.issuesDir);
    } catch (error) {
      console.error('[IssueService] Failed to initialize issues directory:', error);
      throw new Error(`Failed to initialize issues directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a unique ID for a new issue
   * Format: issue-{timestamp}-{random5chars}
   */
  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 7);
    return `issue-${timestamp}-${random}`;
  }

  /**
   * Get the file path for an issue by ID
   */
  private getIssuePath(id: string): string {
    return path.join(this.issuesDir, `${id}.json`);
  }

  /**
   * Read an issue file from disk
   */
  private async readIssueFile(id: string): Promise<Issue | null> {
    const filePath = this.getIssuePath(id);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Validate the data against the schema
      const validatedIssue = issueSchema.parse(data);
      return validatedIssue;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File not found
        return null;
      }

      console.error('[IssueService] Error reading issue file:', error);
      throw new Error(`Failed to read issue ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write an issue to disk
   */
  private async writeIssueFile(issue: Issue): Promise<void> {
    const filePath = this.getIssuePath(issue.id);

    try {
      const content = JSON.stringify(issue, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      console.log('[IssueService] Wrote issue to file:', issue.id);
    } catch (error) {
      console.error('[IssueService] Error writing issue file:', error);
      throw new Error(`Failed to write issue ${issue.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all issues
   */
  async getAllIssues(): Promise<Issue[]> {
    try {
      // Ensure directory exists
      await this.initialize();

      // Read all files in the issues directory
      const files = await fs.readdir(this.issuesDir);
      const issueFiles = files.filter(file => file.endsWith('.json'));

      const issues: Issue[] = [];

      for (const file of issueFiles) {
        const id = file.replace('.json', '');
        const issue = await this.readIssueFile(id);

        if (issue) {
          issues.push(issue);
        }
      }

      console.log(`[IssueService] Retrieved ${issues.length} issues`);
      return issues;
    } catch (error) {
      console.error('[IssueService] Error getting all issues:', error);
      throw new Error(`Failed to get all issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get an issue by ID
   */
  async getIssueById(id: string): Promise<Issue | null> {
    console.log('[IssueService] Getting issue by ID:', id);
    return await this.readIssueFile(id);
  }

  /**
   * Create a new issue
   */
  async createIssue(data: InsertIssue): Promise<Issue> {
    try {
      // Validate input data
      const validatedData = insertIssueSchema.parse(data);

      // Ensure directory exists
      await this.initialize();

      // Generate ID and timestamps
      const id = this.generateId();
      const now = new Date().toISOString();

      const newIssue: Issue = {
        id,
        ...validatedData,
        createdAt: now,
        updatedAt: now,
      };

      // Validate the complete issue
      const validatedIssue = issueSchema.parse(newIssue);

      // Write to file
      await this.writeIssueFile(validatedIssue);

      console.log('[IssueService] Created new issue:', id);
      return validatedIssue;
    } catch (error) {
      console.error('[IssueService] Error creating issue:', error);
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(id: string, data: Partial<InsertIssue>): Promise<Issue> {
    try {
      // Get existing issue
      const existingIssue = await this.getIssueById(id);

      if (!existingIssue) {
        throw new Error(`Issue not found: ${id}`);
      }

      // Merge with updates
      const updatedIssue: Issue = {
        ...existingIssue,
        ...data,
        id, // Ensure ID cannot be changed
        createdAt: existingIssue.createdAt, // Preserve creation time
        updatedAt: new Date().toISOString(), // Update timestamp
      };

      // Validate the updated issue
      const validatedIssue = issueSchema.parse(updatedIssue);

      // Write to file
      await this.writeIssueFile(validatedIssue);

      console.log('[IssueService] Updated issue:', id);
      return validatedIssue;
    } catch (error) {
      console.error('[IssueService] Error updating issue:', error);
      throw new Error(`Failed to update issue ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an issue
   */
  async deleteIssue(id: string): Promise<boolean> {
    try {
      const filePath = this.getIssuePath(id);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        console.log('[IssueService] Issue not found for deletion:', id);
        return false;
      }

      // Delete the file
      await fs.unlink(filePath);
      console.log('[IssueService] Deleted issue:', id);
      return true;
    } catch (error) {
      console.error('[IssueService] Error deleting issue:', error);
      throw new Error(`Failed to delete issue ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all issues related to a specific task
   */
  async getIssuesByTaskId(taskId: string): Promise<Issue[]> {
    try {
      const allIssues = await this.getAllIssues();
      const relatedIssues = allIssues.filter(issue => issue.relatedTaskId === taskId);

      console.log(`[IssueService] Found ${relatedIssues.length} issues for task ${taskId}`);
      return relatedIssues;
    } catch (error) {
      console.error('[IssueService] Error getting issues by task ID:', error);
      throw new Error(`Failed to get issues for task ${taskId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const issueService = new IssueService(process.env.PROJECT_ROOT);

// Also export the class for testing purposes
export { IssueService };
