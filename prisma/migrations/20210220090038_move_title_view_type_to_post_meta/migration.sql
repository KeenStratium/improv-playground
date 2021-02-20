/*
  Warnings:

  - You are about to drop the column `title` on the `SocialUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SocialUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `SocialUpdate` table. All the data in the column will be lost.
  - Added the required column `type` to the `PostMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PostMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostMeta" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SocialUpdate" DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "viewCount";
