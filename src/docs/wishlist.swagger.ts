// src/docs/wishlist.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: Wishlist
 *     description: 찜 목록
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     WishlistProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         name:
 *           type: string
 *           example: 새우깡
 *         price:
 *           type: integer
 *           example: 1500
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           example: /api/images/public/products/0b9e3c1a.jpg
 *         purchaseCount:
 *           type: integer
 *           example: 12
 *     WishlistListResult:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WishlistProduct'
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 6
 *         totalCount:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 2
 *         hasNext:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * /me/wishlist:
 *   get:
 *     summary: 찜 목록 조회
 *     description: 찜한 상품을 최근에 찜한 순으로 반환합니다. 삭제된 상품과 다른 조직의 상품은 제외됩니다.
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 6
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
 *                       $ref: '#/components/schemas/WishlistListResult'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: 찜 여러 개 해제
 *     description: 보낸 productIds 중 찜한 상품을 모두 해제합니다. 찜하지 않은 id는 무시되고 해제된 개수만 반환합니다.
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productIds]
 *             properties:
 *               productIds:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [5, 7, 9]
 *     responses:
 *       200:
 *         description: 해제 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: integer
 *                           example: 3
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /me/wishlist/ids:
 *   get:
 *     summary: 찜한 상품 id 전체 조회
 *     description: 찜 여부 표시(하트 상태)를 위해 찜한 모든 상품 id를 한 번에 반환합니다. 삭제된 상품과 다른 조직의 상품은 제외됩니다.
 *     tags: [Wishlist]
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
 *                       type: object
 *                       properties:
 *                         productIds:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [5, 7, 9]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /me/wishlist/{productId}:
 *   post:
 *     summary: 찜하기
 *     description: |
 *       상품을 찜 상태로 만듭니다. 이미 찜한 상품이면 아무 변화 없이 같은 응답을 반환합니다.
 *       토글이 아니므로 해제는 DELETE를 호출해야 합니다.
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 찜 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                           example: 5
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
 *   delete:
 *     summary: 찜 해제
 *     description: 찜하지 않은 상품이어도 에러 없이 deletedCount가 0으로 응답합니다.
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 해제 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                           example: 5
 *                         deletedCount:
 *                           type: integer
 *                           example: 1
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
