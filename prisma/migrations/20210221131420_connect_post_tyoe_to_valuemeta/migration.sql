/*
  Warnings:

  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "type",
ADD COLUMN     "typeId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("typeId") REFERENCES "ValueMeta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
