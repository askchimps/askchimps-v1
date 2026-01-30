/*
  Warnings:

  - You are about to drop the column `agent_id` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_agent_id_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "agent_id";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "transfer_reason" TEXT;

-- CreateTable
CREATE TABLE "chat_agents" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_agents_chat_id_agent_id_key" ON "chat_agents"("chat_id", "agent_id");

-- AddForeignKey
ALTER TABLE "chat_agents" ADD CONSTRAINT "chat_agents_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_agents" ADD CONSTRAINT "chat_agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
