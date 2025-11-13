import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertIssueSchema, type Issue, type InsertIssue } from "@shared/schema";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Form schema with tags as comma-separated string for easier input
 * Will be converted to array before submission
 */
const issueFormSchema = insertIssueSchema.extend({
  tags: z.string().optional().default(""),
  relatedTaskId: z.string().optional().default(""),
  attachments: z.array(z.string()).optional().default([]),
});

type IssueFormData = z.infer<typeof issueFormSchema>;

interface IssueFormProps {
  issue?: Issue;
  onSubmit: (data: InsertIssue) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * IssueForm - Form component for creating and editing issues
 *
 * Features:
 * - Create and edit modes based on issue prop
 * - React Hook Form for state management
 * - Zod validation with insertIssueSchema
 * - shadcn/ui components for consistent UI
 * - Tags input as comma-separated string
 * - All severity and status options
 * - Optional related task ID field
 * - File attachment support (multiple files, up to 10MB each)
 * - File type validation (JPEG, PNG, GIF, PDF, TXT, MD)
 * - File preview with size display and remove option
 * - Accessible form labels and error messages
 *
 * Design follows design_guidelines.md:
 * - Tokyo Night theme via shadcn/ui
 * - Form layout: space-y-4
 * - Full-width inputs with px-3 py-2 padding
 * - Submit button disabled during submission and upload
 * - Cancel button if onCancel provided
 */
export const IssueForm: React.FC<IssueFormProps> = ({
  issue,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // File upload state
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = React.useState<string[]>(
    issue?.attachments || []
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Initialize form with react-hook-form + zod validation
  const form = useForm<IssueFormData>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: issue?.title || "",
      description: issue?.description || "",
      severity: issue?.severity || "medium",
      status: issue?.status || "open",
      relatedTaskId: issue?.relatedTaskId || "",
      tags: issue?.tags?.join(", ") || "",
      attachments: issue?.attachments || [],
    },
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file size (10MB max per file)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setUploadError(`Some files exceed 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate file types
    const allowedExtensions = /\.(jpe?g|png|gif|pdf|txt|md)$/i;
    const invalidTypes = files.filter(file => !allowedExtensions.test(file.name));
    if (invalidTypes.length > 0) {
      setUploadError(`Invalid file types: ${invalidTypes.map(f => f.name).join(', ')}. Allowed: jpeg, jpg, png, gif, pdf, txt, md`);
      return;
    }

    setUploadError(null);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) {
      return uploadedFileNames;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/issues/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'File upload failed');
      }

      const result = await response.json();
      const newFileNames = result.files.map((f: { name: string }) => f.name);

      return [...uploadedFileNames, ...newFileNames];
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'File upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: IssueFormData) => {
    try {
      // Upload files first if any
      let attachments = uploadedFileNames;
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles();
      }

      // Convert comma-separated tags string to array
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      // Convert form data to InsertIssue format
      const issueData: InsertIssue = {
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: data.status,
        relatedTaskId: data.relatedTaskId || undefined,
        tags,
        attachments,
      };

      await onSubmit(issueData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter issue title"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue in detail"
                  className="min-h-[100px] resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Severity Field */}
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severity</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Related Task ID Field (Optional) */}
        <FormField
          control={form.control}
          name="relatedTaskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Task ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 1.2 or 3"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Field (Optional) */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas (e.g., bug, ui, critical)"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachments Field (Optional) */}
        <div className="space-y-2">
          <FormLabel>Attachments (Optional)</FormLabel>
          <div className="space-y-3">
            <Input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.md"
              onChange={handleFileChange}
              disabled={isSubmitting || isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Max 10MB per file. Allowed: JPEG, PNG, GIF, PDF, TXT, MD
            </p>

            {/* Upload Error */}
            {uploadError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {uploadError}
              </div>
            )}

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-secondary/50 p-2 rounded text-sm"
                    >
                      <span className="flex-1 truncate">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting || isUploading}
                        className="ml-2 h-6 px-2"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Already Uploaded Files (Edit Mode) */}
            {uploadedFileNames.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded files:</p>
                <ul className="space-y-1">
                  {uploadedFileNames.map((fileName, index) => (
                    <li
                      key={index}
                      className="bg-primary/10 p-2 rounded text-sm"
                    >
                      {fileName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            {isUploading
              ? "Uploading files..."
              : isSubmitting
              ? "Submitting..."
              : issue
              ? "Update Issue"
              : "Create Issue"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

// Default export for lazy loading
export default IssueForm;
