import { Request, Response } from 'express';

import {
  addCartItemBodySchema,
  cartItemIdParamsSchema,
  updateCartItemBodySchema,
} from './cartItem.schema';
import * as cartItemService from './cartItem.service';

// ------------------------------
// GET /me/cartItems
// ------------------------------

export async function getCartItems(req: Request, res: Response): Promise<void> {
  const { userId } = req.auth!;
  const result = await cartItemService.getCartItems(userId);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// POST /me/cartItems
// ------------------------------

export async function addCartItem(req: Request, res: Response): Promise<void> {
  const { userId, organizationId } = req.auth!;
  const data = addCartItemBodySchema.parse(req.body);
  const result = await cartItemService.addCartItem(
    userId,
    organizationId,
    data,
  );
  res.status(201).json({ success: true, data: result });
}

// ------------------------------
// PATCH /me/cartItems/:id
// ------------------------------

export async function updateCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.auth!;
  const { id } = cartItemIdParamsSchema.parse(req.params);
  const data = updateCartItemBodySchema.parse(req.body);
  const result = await cartItemService.updateCartItem(userId, id, data);
  res.status(200).json({ success: true, data: result });
}

// ------------------------------
// DELETE /me/cartItems/:id
// ------------------------------

export async function removeCartItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.auth!;
  const { id } = cartItemIdParamsSchema.parse(req.params);
  const result = await cartItemService.removeCartItem(userId, id);
  res.status(200).json({ success: true, data: result });
}
