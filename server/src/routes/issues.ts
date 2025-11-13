import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { issueService } from '../../services/IssueService';
import { insertIssueSchema } from '../../../shared/schema';
import type { Issue, InsertIssue } from '../../../shared/schema';

const router = Router();

// Configure multer for file uploads
const attachmentsDir = path.join(process.cwd(), '.taskmaster', 'issues', 'attachments');

// Ensure attachments directory exists (async initialization)
fs.mkdir(attachmentsDir, { recursive: true }).catch(err => {
  console.error('[issues route] Failed to create attachments directory:', err);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, attachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: jpeg, jpg, png, gif, pdf, txt, md'));
    }
  }
});

/**
 * GET /api/issues
 * Get all issues with optional taskId filter
 *
 * Query Parameters:
 * - taskId: string (optional) - Filter issues by related task ID
 *
 * Response:
 * - 200: { success: true, issues: Issue[] }
 * - 500: { success: false, message: string }
 */
router.get('/', async (req, res, next) => {
  try {
    const { taskId } = req.query;

    let issues: Issue[];
    if (taskId && typeof taskId === 'string') {
      issues = await issueService.getIssuesByTaskId(taskId);
    } else {
      issues = await issueService.getAllIssues();
    }

    res.json({ success: true, issues });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/issues/:id
 * Get a specific issue by ID
 *
 * Path Parameters:
 * - id: string - Issue ID
 *
 * Response:
 * - 200: { success: true, issue: Issue }
 * - 404: { success: false, message: string }
 * - 500: { success: false, message: string }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const issue = await issueService.getIssueById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue ${id} not found`
      });
    }

    res.json({ success: true, issue });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/issues/upload
 * Upload attachments for an issue
 *
 * Request:
 * - Content-Type: multipart/form-data
 * - Body: files in 'attachments' field (up to 5 files, 10MB each)
 *
 * Response:
 * - 200: { success: true, files: Array<{ name: string, size: number }> }
 * - 400: { success: false, message: string }
 * - 500: { success: false, message: string }
 */
router.post('/upload', upload.array('attachments', 5), (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = files.map(f => ({
      name: f.filename,
      originalName: f.originalname,
      size: f.size
    }));

    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/issues
 * Create a new issue
 *
 * Request Body:
 * - title: string
 * - description: string
 * - severity: "critical" | "high" | "medium" | "low"
 * - status: "open" | "in-progress" | "resolved"
 * - relatedTaskId?: string
 * - tags?: string[]
 * - attachments?: string[]
 *
 * Response:
 * - 201: { success: true, issue: Issue }
 * - 400: { success: false, message: string, errors: ZodError[] }
 * - 500: { success: false, message: string }
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = insertIssueSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue data',
        errors: validationResult.error.errors
      });
    }

    const issue = await issueService.createIssue(validationResult.data);
    res.status(201).json({ success: true, issue });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/issues/:id
 * Update an existing issue
 *
 * Path Parameters:
 * - id: string - Issue ID
 *
 * Request Body: (all fields optional)
 * - title?: string
 * - description?: string
 * - severity?: "critical" | "high" | "medium" | "low"
 * - status?: "open" | "in-progress" | "resolved"
 * - relatedTaskId?: string
 * - tags?: string[]
 *
 * Response:
 * - 200: { success: true, issue: Issue }
 * - 400: { success: false, message: string, errors: ZodError[] }
 * - 404: { success: false, message: string }
 * - 500: { success: false, message: string }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Partial validation (allow updating subset of fields)
    const validationResult = insertIssueSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue data',
        errors: validationResult.error.errors
      });
    }

    const issue = await issueService.updateIssue(id, validationResult.data);
    res.json({ success: true, issue });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/issues/:id
 * Delete an issue
 *
 * Path Parameters:
 * - id: string - Issue ID
 *
 * Response:
 * - 200: { success: true, message: string }
 * - 404: { success: false, message: string }
 * - 500: { success: false, message: string }
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await issueService.deleteIssue(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Issue ${id} not found`
      });
    }

    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
