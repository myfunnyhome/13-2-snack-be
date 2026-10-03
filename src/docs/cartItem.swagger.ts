// src/docs/cartItem.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: CartItem
 *     description: 장바구니
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 3
 *         productId:
 *           type: integer
 *           example: 5
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             name:
 *               type: string
 *               example: 새우깡
 *             price:
 *               type: integer
 *               example: 1500
 *             imageUrl:
 *               type: string
 *               nullable: true
 *               example: /api/images/public/products/0b9e3c1a.jpg
 *             isDeleted:
 *               type: boolean
 *               description: 삭제된 상품이면 true. 이 경우 수량을 바꿀 수 없음
 */

/**
 * @openapi
 * /me/cart-items:
 *   get:
 *     summary: 장바구니 목록 조회
 *     description: 로그인한 사용자의 장바구니를 담은 순서의 역순(최신순)으로 반환합니다.
 *     tags: [CartItem]
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: 장바구니에 상품 담기
 *     description: |
 *       이미 담긴 상품이면 새 항목을 만들지 않고 수량을 더합니다. 수량 합이 999를 넘으면 400입니다.
 *       삭제된 상품은 담을 수 없고, 다른 조직의 상품은 담을 수 없습니다.
 *     tags: [CartItem]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 999
 *                 default: 1
 *     responses:
 *       201:
 *         description: 담기 성공 (담긴 항목)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: 유효성 검사 실패 (VALIDATION_ERROR), 합산 수량이 999 초과 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 다른 조직의 상품 (FORBIDDEN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 상품이 없거나 삭제됨 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /me/cart-items/{id}:
 *   patch:
 *     summary: 장바구니 수량 변경
 *     description: 수량을 보낸 값으로 바꿉니다. 삭제된 상품은 수량을 바꿀 수 없습니다.
 *     tags: [CartItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 장바구니 항목 id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 999
 *     responses:
 *       200:
 *         description: 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: 유효성 검사 실패 (VALIDATION_ERROR), 삭제된 상품의 수량 변경 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 장바구니 항목이 없거나 본인 항목이 아님 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: 장바구니 항목 삭제
 *     tags: [CartItem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 장바구니 항목 id
 *     responses:
 *       200:
 *         description: 삭제 성공 (삭제된 항목)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 장바구니 항목이 없거나 본인 항목이 아님 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
