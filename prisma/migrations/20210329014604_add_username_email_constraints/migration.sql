/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[username]` on the table `Account`. If there are existing duplicate values, the migration will fail.
  - The migration will add a unique constraint covering the columns `[emailAddress]` on the table `Account`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT E'Citizen';

-- CreateIndex
CREATE UNIQUE INDEX "Account.username_unique" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account.emailAddress_unique" ON "Account"("emailAddress");
