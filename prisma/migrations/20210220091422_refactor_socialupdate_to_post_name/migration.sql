/*
  Warnings:

  - You are about to drop the column `socialUpdateId` on the `PostAnalytic` table. All the data in the column will be lost.
  - You are about to drop the `PostMeta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialUpdate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `postId` to the `PostAnalytic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PostMeta" DROP CONSTRAINT "PostMeta_cityId_fkey";

-- DropForeignKey
ALTER TABLE "SocialUpdate" DROP CONSTRAINT "SocialUpdate_mediaUploadId_fkey";

-- DropForeignKey
ALTER TABLE "SocialUpdate" DROP CONSTRAINT "SocialUpdate_postMetaId_fkey";

-- DropForeignKey
ALTER TABLE "SocialUpdate" DROP CONSTRAINT "SocialUpdate_referenceId_fkey";

-- DropForeignKey
ALTER TABLE "SocialUpdate" DROP CONSTRAINT "SocialUpdate_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostAnalytic" DROP CONSTRAINT "PostAnalytic_socialUpdateId_fkey";

-- AlterTable
ALTER TABLE "PostAnalytic" DROP COLUMN "socialUpdateId",
ADD COLUMN     "postId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" INTEGER NOT NULL DEFAULT 0,
    "socialType" TEXT NOT NULL,
    "referenceId" INTEGER,
    "reactionCount" JSONB NOT NULL,
    "mediaUploadId" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "location" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "PostMeta";

-- DropTable
DROP TABLE "SocialUpdate";

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("referenceId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("mediaUploadId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAnalytic" ADD FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
