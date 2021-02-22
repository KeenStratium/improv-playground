-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "mediaUploadId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "mediaUploadId" DROP NOT NULL;
