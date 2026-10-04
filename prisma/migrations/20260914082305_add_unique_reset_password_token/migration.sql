/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordToken]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_resetPasswordToken_key" ON "Account"("resetPasswordToken");
