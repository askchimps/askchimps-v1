-- AlterTable
ALTER TABLE "chat_follow_up_messages" ADD COLUMN     "delay_in_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 1;
