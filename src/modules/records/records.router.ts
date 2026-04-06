import { Router } from 'express';
import { recordsController } from './records.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required').max(100),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).max(100).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
  notes: z.string().max(500).optional(),
});

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records with filters and pagination
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of financial records
 */
router.get('/', recordsController.listRecords.bind(recordsController));

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Financial record details
 *       404:
 *         description: Record not found
 */
router.get('/:id', recordsController.getRecordById.bind(recordsController));

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', requireRole('ADMIN'), validate(createRecordSchema), recordsController.createRecord.bind(recordsController));

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.patch('/:id', requireRole('ADMIN'), validate(updateRecordSchema), recordsController.updateRecord.bind(recordsController));

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record soft deleted
 *       404:
 *         description: Record not found
 */
router.delete('/:id', requireRole('ADMIN'), recordsController.deleteRecord.bind(recordsController));

export default router;
