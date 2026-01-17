/*
  Warnings:

  - You are about to drop the column `follow_up_at` on the `chat_follow_up_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `message_id` on the `chat_follow_up_schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chat_id,scheduled_at]` on the table `chat_follow_up_schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `follow_up_message_id` to the `chat_follow_up_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_at` to the `chat_follow_up_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_follow_up_schedules" DROP CONSTRAINT "chat_follow_up_schedules_message_id_fkey";

-- DropIndex
DROP INDEX "chat_follow_up_schedules_chat_id_follow_up_at_key";

-- AlterTable
ALTER TABLE "chat_follow_up_schedules" DROP COLUMN "follow_up_at",
DROP COLUMN "message_id",
ADD COLUMN     "follow_up_message_id" TEXT NOT NULL,
ADD COLUMN     "is_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduled_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sent_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "chat_follow_up_schedules_chat_id_scheduled_at_key" ON "chat_follow_up_schedules"("chat_id", "scheduled_at");

-- AddForeignKey
ALTER TABLE "chat_follow_up_schedules" ADD CONSTRAINT "chat_follow_up_schedules_follow_up_message_id_fkey" FOREIGN KEY ("follow_up_message_id") REFERENCES "chat_follow_up_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
