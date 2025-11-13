import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { type InsertIssue } from "@shared/schema";

interface IssueFormProps {
  onSubmit: (issue: InsertIssue) => void;
  taskIds?: string[];
}

export default function IssueForm({ onSubmit, taskIds = [] }: IssueFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<InsertIssue>({
    title: "",
    description: "",
    severity: "medium",
    status: "open",
    relatedTaskId: undefined,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      severity: "medium",
      status: "open",
      relatedTaskId: undefined,
      tags: [],
    });
    setTagInput("");
    setIsOpen(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        data-testid="button-create-issue"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Issue
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
            Title *
          </label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter issue title"
            data-testid="input-title"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
            Description *
          </label>
          <Textarea
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the issue"
            rows={3}
            data-testid="input-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
              Severity
            </label>
            <Select
              value={formData.severity}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger data-testid="select-severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {taskIds.length > 0 && (
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
              Related Task (Optional)
            </label>
            <Select
              value={formData.relatedTaskId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relatedTaskId: value }))}
            >
              <SelectTrigger data-testid="select-task">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {taskIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    Task {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
            Tags (Optional)
          </label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              data-testid="input-tag"
            />
            <Button type="button" onClick={addTag} size="sm" data-testid="button-add-tag">
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover-elevate rounded"
                    data-testid={`button-remove-tag-${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" data-testid="button-submit">
            Create Issue
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
