/*
  Warnings:

  - A unique constraint covering the columns `[slug,organisation_id,sequence]` on the table `chat_follow_up_messages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "chat_follow_up_messages_slug_organisation_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "chat_follow_up_messages_slug_organisation_id_sequence_key" ON "chat_follow_up_messages"("slug", "organisation_id", "sequence");
