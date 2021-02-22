-- AlterTable
ALTER TABLE "MediaUpload" ALTER COLUMN "metadata" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
