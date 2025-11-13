import { Router } from 'express';
import { taskMasterService } from '../services/TaskMasterService';
import type { Task } from '../../../shared/schema';

const router = Router();

/**
 * GET /api/tasks
 * Get all tasks from TaskMaster
 */
router.get('/', async (req, res, next) => {
  try {
    const tasks = await taskMasterService.getTasks();
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tasks/current
 * Get the current task to work on (in-progress or pending)
 * MUST be before /:id route to avoid treating "current" as an ID
 */
router.get('/current', async (req, res, next) => {
  try {
    const task = await taskMasterService.getCurrentTask();
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'No current task found'
      });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 * Supports both string and number IDs (e.g., "1", "1.2", "1.2.3")
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskMasterService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task ${id} not found`
      });
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

export default router;
