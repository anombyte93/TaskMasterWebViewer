import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Edit, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Issue, InsertIssue } from "@shared/schema";
import SeverityBadge from "./SeverityBadge";
import { Button } from "@/components/ui/button";
import { IssueForm } from "./IssueForm";
import { useUpdateIssueMutation, useDeleteIssueMutation } from "@/hooks/useIssues";

interface IssueDetailProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * IssueDetail - Modal component for displaying full issue information
 *
 * Features:
 * - Full issue metadata display (id, title, description, severity, status)
 * - Related task link (if exists) - clickable to view task
 * - Tags list display
 * - Attachments list display (if any)
 * - Timestamps (created, updated) with relative time
 * - Edit button (opens IssueForm in edit mode)
 * - Delete button (with confirmation)
 * - Radix Dialog for accessible modal
 * - Tokyo Night theme colors
 * - Responsive design
 *
 * Design:
 * - Centered modal overlay with backdrop blur
 * - max-w-4xl content area
 * - Hierarchical layout with clear sections
 * - Monospace font for issue IDs
 * - Smooth animations
 */
export function IssueDetail({ issue, open, onOpenChange }: IssueDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateIssueMutation = useUpdateIssueMutation();
  const deleteIssueMutation = useDeleteIssueMutation();

  if (!issue) return null;

  // Status badge colors
  const statusColors = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  // Format timestamps
  const createdAt = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });
  const updatedAt = formatDistanceToNow(new Date(issue.updatedAt), {
    addSuffix: true,
  });

  // Handle edit form submission
  const handleEditSubmit = async (data: InsertIssue) => {
    await updateIssueMutation.mutateAsync({ id: issue.id, data });
    setIsEditing(false);
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    await deleteIssueMutation.mutateAsync(issue.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  // If in edit mode, show form
  if (isEditing) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%]",
              "bg-background border rounded-lg shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              "max-h-[90vh] overflow-y-auto",
              "p-6 md:p-8"
            )}
          >
            <div className="mb-6">
              <Dialog.Title className="text-2xl font-semibold">
                Edit Issue
              </Dialog.Title>
            </div>
            <IssueForm
              issue={issue}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={updateIssueMutation.isPending}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
              "bg-background border rounded-lg shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "p-6"
            )}
          >
            <Dialog.Title className="text-xl font-semibold mb-4">
              Delete Issue
            </Dialog.Title>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this issue? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteIssueMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteIssueMutation.isPending}
              >
                {deleteIssueMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Main detail view
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />

        {/* Modal content */}
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%]",
            "bg-background border rounded-lg shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "max-h-[90vh] overflow-y-auto",
            "p-6 md:p-8"
          )}
          aria-describedby="issue-description"
        >
          {/* Header: Issue ID + Title */}
          <div className="pb-6 border-b mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Issue ID badge */}
                <div className="mb-3">
                  <span className="inline-block font-mono text-sm px-3 py-1.5 rounded bg-muted font-semibold">
                    {issue.id}
                  </span>
                </div>

                {/* Issue title */}
                <Dialog.Title className="text-2xl font-semibold leading-tight">
                  {issue.title}
                </Dialog.Title>
              </div>

              {/* Close button */}
              <Dialog.Close
                className={cn(
                  "rounded-sm opacity-70 ring-offset-background transition-opacity",
                  "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                  "p-2"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Status and Severity row */}
            <div className="flex gap-3 items-center mt-4">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full border uppercase tracking-wide",
                  statusColors[issue.status]
                )}
              >
                {issue.status}
              </span>
              <SeverityBadge severity={issue.severity} />
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-6">
            {/* Description section */}
            <section>
              <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                Description
              </h3>
              <p id="issue-description" className="text-sm leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>
            </section>

            {/* Metadata grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Task */}
              {issue.relatedTaskId && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Related Task
                  </h3>
                  <a
                    href={`#task-${issue.relatedTaskId}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Task {issue.relatedTaskId}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Tags */}
              {issue.tags && issue.tags.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block text-xs px-2 py-1 rounded bg-muted border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Attachments */}
            {issue.attachments && issue.attachments.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                  Attachments
                </h3>
                <ul className="space-y-1">
                  {issue.attachments.map((attachment, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {attachment}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Timestamps */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                  Created
                </h3>
                <p className="text-sm text-muted-foreground">{createdAt}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p className="text-sm text-muted-foreground">{updatedAt}</p>
              </div>
            </section>

            {/* Action buttons */}
            <section className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default IssueDetail;
