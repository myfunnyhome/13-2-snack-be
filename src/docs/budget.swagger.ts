// src/docs/budget.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: Budget
 *     description: 예산 (월별 예산과 지출)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       description: 조직의 월별 예산. 남은 예산은 startingBudget에서 spentAmount를 뺀 값
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         organizationId:
 *           type: integer
 *           example: 1
 *         year:
 *           type: integer
 *           example: 2026
 *         month:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 10
 *         startingBudget:
 *           type: integer
 *           example: 500000
 *           description: 해당 월 시작 예산 (원)
 *         spentAmount:
 *           type: integer
 *           example: 120000
 *           description: 해당 월 지출액 (원)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BudgetWithDefault:
 *       allOf:
 *         - $ref: '#/components/schemas/Budget'
 *         - type: object
 *           properties:
 *             defaultBudget:
 *               type: integer
 *               example: 500000
 *               description: 매달 시작 예산으로 자동 적용되는 기본 예산 (원)
 *     BudgetSummary:
 *       type: object
 *       properties:
 *         currentMonthBudget:
 *           $ref: '#/components/schemas/Budget'
 *         previousMonthBudget:
 *           nullable: true
 *           description: 지난달 예산. 신규 조직처럼 지난달 데이터가 없으면 null
 *           allOf:
 *             - $ref: '#/components/schemas/Budget'
 *         currentYearSpending:
 *           type: integer
 *           example: 800000
 *           description: 올해 총 지출액 (원)
 *         previousYearSpending:
 *           type: integer
 *           example: 3200000
 *           description: 지난해 총 지출액 (원)
 */

/**
 * @openapi
 * /admin/budgets/summary:
 *   get:
 *     summary: 예산 요약 조회
 *     description: |
 *       ADMIN, SUPER_ADMIN만 호출할 수 있습니다.
 *       로그인한 사용자 조직의 이번 달과 지난달 예산, 올해와 지난해 총 지출액을 반환합니다.
 *     tags: [Budget]
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
 *                       $ref: '#/components/schemas/BudgetSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 이번 달 예산 정보가 없음 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /super-admin/budgets/setting:
 *   get:
 *     summary: 예산 설정 조회
 *     description: SUPER_ADMIN만 호출할 수 있습니다. 이번 달 예산과 매달 기본 예산을 반환합니다.
 *     tags: [Budget]
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
 *                       $ref: '#/components/schemas/BudgetWithDefault'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 이번 달 예산 정보가 없음 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: 예산 설정 수정
 *     description: |
 *       SUPER_ADMIN만 호출할 수 있습니다.
 *       이번 달 시작 예산(startingBudget)과 매달 기본 예산(defaultBudget)을 한 번에 수정합니다.
 *       보낸 항목만 수정되고 하나 이상 보내야 하며, 정의되지 않은 필드를 보내면 400입니다.
 *       응답은 수정된 뒤의 예산 설정입니다.
 *     tags: [Budget]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             additionalProperties: false
 *             properties:
 *               startingBudget:
 *                 type: integer
 *                 minimum: 0
 *                 example: 600000
 *                 description: 이번 달 시작 예산 (원)
 *               defaultBudget:
 *                 type: integer
 *                 minimum: 0
 *                 example: 500000
 *                 description: 매달 시작 예산으로 적용되는 기본 예산 (원)
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BudgetWithDefault'
 *       400:
 *         description: 유효성 검사 실패 (VALIDATION_ERROR), 수정할 값이 없음 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 이번 달 예산 정보가 없음 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
