import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get total income, expenses, and net balance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get('/summary', dashboardController.getSummary.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/by-category:
 *   get:
 *     summary: Get totals grouped by category (analyst + admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category breakdown data
 *       403:
 *         description: Insufficient permissions
 */
router.get('/by-category', requireRole('ANALYST', 'ADMIN'), dashboardController.getByCategory.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly/weekly trends (analyst + admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [weekly, monthly]
 *           default: monthly
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Trend data
 *       403:
 *         description: Insufficient permissions
 */
router.get('/trends', requireRole('ANALYST', 'ADMIN'), dashboardController.getTrends.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get last N records
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent records
 */
router.get('/recent', dashboardController.getRecentRecords.bind(dashboardController));

export default router;
