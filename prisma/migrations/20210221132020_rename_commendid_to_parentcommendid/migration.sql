/*
  Warnings:

  - You are about to drop the column `commentId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commentId",
ADD COLUMN     "parentCommentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
