-- CreateTable
CREATE TABLE "chat_follow_up_schedules" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "follow_up_at" TIMESTAMP(3) NOT NULL,
    "message_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_follow_up_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_follow_up_messages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_follow_up_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeadTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LeadTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChatTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChatTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CallTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CallTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_follow_up_schedules_chat_id_follow_up_at_key" ON "chat_follow_up_schedules"("chat_id", "follow_up_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_follow_up_messages_slug_organisation_id_key" ON "chat_follow_up_messages"("slug", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "_LeadTags_B_index" ON "_LeadTags"("B");

-- CreateIndex
CREATE INDEX "_ChatTags_B_index" ON "_ChatTags"("B");

-- CreateIndex
CREATE INDEX "_CallTags_B_index" ON "_CallTags"("B");

-- AddForeignKey
ALTER TABLE "chat_follow_up_schedules" ADD CONSTRAINT "chat_follow_up_schedules_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_follow_up_schedules" ADD CONSTRAINT "chat_follow_up_schedules_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_follow_up_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_follow_up_messages" ADD CONSTRAINT "chat_follow_up_messages_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadTags" ADD CONSTRAINT "_LeadTags_A_fkey" FOREIGN KEY ("A") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadTags" ADD CONSTRAINT "_LeadTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatTags" ADD CONSTRAINT "_ChatTags_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatTags" ADD CONSTRAINT "_ChatTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CallTags" ADD CONSTRAINT "_CallTags_A_fkey" FOREIGN KEY ("A") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CallTags" ADD CONSTRAINT "_CallTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
