-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "document_url" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
