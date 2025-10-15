/*
  Warnings:

  - A unique constraint covering the columns `[pinecone_namespace]` on the table `Form` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "pinecone_namespace" TEXT,
ADD COLUMN     "user_context" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Form_pinecone_namespace_key" ON "Form"("pinecone_namespace");
