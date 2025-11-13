import IssueCard from "../IssueCard";
import { type Issue } from "@shared/schema";

const sampleIssues: Issue[] = [
  {
    id: "issue-001",
    title: "API endpoint returning 500 error",
    description: "Users endpoint fails when querying with invalid parameters",
    severity: "critical",
    status: "open",
    relatedTaskId: "2.3",
    tags: ["api", "bug"],
    createdAt: "2025-10-25T10:30:00Z",
    updatedAt: "2025-10-25T10:30:00Z",
  },
  {
    id: "issue-002",
    title: "Update documentation for new features",
    description: "Need to document the new authentication flow",
    severity: "low",
    status: "in-progress",
    tags: ["docs"],
    createdAt: "2025-10-24T14:20:00Z",
    updatedAt: "2025-10-25T09:15:00Z",
  },
];

export default function IssueCardExample() {
  return (
    <div className="space-y-4 max-w-md">
      {sampleIssues.map((issue) => (
        <IssueCard 
          key={issue.id} 
          issue={issue}
          onIssueClick={(issue) => console.log("Issue clicked:", issue)}
        />
      ))}
    </div>
  );
}
