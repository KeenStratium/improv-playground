/*
  Warnings:

  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "displayName" TEXT NOT NULL;
