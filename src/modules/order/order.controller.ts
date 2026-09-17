import { Request, Response } from 'express';

import {
  createOrderBodySchema,
  myOrderListQuerySchema,
  orderIdParamsSchema,
  orderResponseMessageBodySchema,
  orgOrderListQuerySchema,
} from './order.schema';
import * as orderService from './order.service';

// ------------------------------
// POST /orders
// ------------------------------

export async function createOrder(req: Request, res: Response): Promise<void> {
  const { userId, organizationId, role } = req.auth!;
  const data = createOrderBodySchema.parse(req.body);
  const result = await orderService.createOrder(
    userId,
    organizationId,
    role,
    data,
  );
  res.status(201).json({ success: true, data: result });
}

// ------------------------------
// GET /me/orders
// ------------------------------

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const { userId } = req.auth!;
  const query = myOrderListQuerySchema.parse(req.query);
  const result = await orderService.getMyOrders(userId, query);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// GET /me/orders/:id
// ------------------------------

export async function getMyOrderDetail(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.auth!;
  const { id } = orderIdParamsSchema.parse(req.params);
  const result = await orderService.getMyOrderDetail(id, userId);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// DELETE /me/orders/:id
// ------------------------------

export async function cancelMyOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.auth!;
  const { id } = orderIdParamsSchema.parse(req.params);
  const result = await orderService.cancelMyOrder(id, userId);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// GET /admin/orders
// ------------------------------

export async function getOrgOrders(req: Request, res: Response): Promise<void> {
  const { organizationId } = req.auth!;
  const query = orgOrderListQuerySchema.parse(req.query);
  const result = await orderService.getOrgOrders(organizationId, query);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// GET /admin/orders/:id
// ------------------------------

export async function getOrgOrderDetail(
  req: Request,
  res: Response,
): Promise<void> {
  const { organizationId } = req.auth!;
  const { id } = orderIdParamsSchema.parse(req.params);
  const result = await orderService.getOrgOrderDetail(id, organizationId);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// PATCH /admin/orders/:id/approve
// ------------------------------

export async function approveOrder(req: Request, res: Response): Promise<void> {
  const { organizationId, userId } = req.auth!;
  const { id } = orderIdParamsSchema.parse(req.params);
  const data = orderResponseMessageBodySchema.parse(req.body);
  const result = await orderService.approveOrder(
    id,
    organizationId,
    userId,
    data,
  );
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// PATCH /admin/orders/:id/reject
// ------------------------------

export async function rejectOrder(req: Request, res: Response): Promise<void> {
  const { organizationId, userId } = req.auth!;
  const { id } = orderIdParamsSchema.parse(req.params);
  const data = orderResponseMessageBodySchema.parse(req.body);
  const result = await orderService.rejectOrder(
    id,
    organizationId,
    userId,
    data,
  );
  res.status(200).json({ success: true, data: result });
}
