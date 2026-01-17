-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AGENT_TYPE" AS ENUM ('MARKETING', 'SALES');

-- CreateEnum
CREATE TYPE "CHAT_SOURCE" AS ENUM ('WHATSAPP', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "CHAT_STATUS" AS ENUM ('NEW', 'OPEN', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "CHAT_MESSAGE_TYPE" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'GIF', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "CALL_STATUS" AS ENUM ('ACTIVE', 'DISCONNECTED', 'RESCHEDULED', 'MISSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SENTIMENT" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "EXECUTION_TYPE" AS ENUM ('CALL_TRIGGER', 'CALL_END', 'CALL_ANALYSIS');

-- CreateEnum
CREATE TYPE "HISTORY_ACTION" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');

-- CreateEnum
CREATE TYPE "HISTORY_TRIGGER" AS ENUM ('USER_ACTION', 'SYSTEM_ACTION', 'API_CALL', 'SCHEDULER', 'WEBHOOK', 'INTEGRATION', 'MIGRATION', 'ADMIN_ACTION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "available_indian_channels" INTEGER NOT NULL DEFAULT 0,
    "available_international_channels" INTEGER NOT NULL DEFAULT 0,
    "chat_credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "call_credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_organisations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "role" "ROLE" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AGENT_TYPE" NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "zoho_id" TEXT,
    "owner_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "status" TEXT,
    "disposition" TEXT,
    "reason_for_cold" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "is_transferred" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_lead_call_schedules" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "call_time" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_lead_call_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_owners" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "name" TEXT,
    "source" "CHAT_SOURCE" NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" "CHAT_STATUS" NOT NULL DEFAULT 'NEW',
    "short_summary" TEXT,
    "detailed_summary" TEXT,
    "is_transferred" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT,
    "type" "CHAT_MESSAGE_TYPE" NOT NULL DEFAULT 'TEXT',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "name" TEXT,
    "ended_reason" TEXT,
    "external_id" TEXT,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CALL_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "sentiment" "SENTIMENT",
    "recording_url" TEXT,
    "short_summary" TEXT,
    "detailed_summary" TEXT,
    "analysis" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_messages" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_message_caches" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_message_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "filetype" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executions" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "type" "EXECUTION_TYPE" NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "lead_id" TEXT,
    "call_id" TEXT,
    "chat_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "field_name" TEXT,
    "action" "HISTORY_ACTION" NOT NULL,
    "trigger" "HISTORY_TRIGGER" NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "user_name" TEXT,
    "organisation_id" TEXT,
    "agent_id" TEXT,
    "lead_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "reason" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "request_id" TEXT,
    "session_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "api_endpoint" TEXT,
    "http_method" TEXT,
    "is_error" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "error_stack" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_user_id_key" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_organisations_user_id_organisation_id_key" ON "user_organisations"("user_id", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_slug_key" ON "agents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_organisation_id_key" ON "leads"("phone", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_organisation_id_key" ON "leads"("email", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_lead_call_schedules_agent_id_lead_id_call_time_key" ON "agent_lead_call_schedules"("agent_id", "lead_id", "call_time");

-- CreateIndex
CREATE UNIQUE INDEX "chats_source_id_key" ON "chats"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "calls_external_id_key" ON "calls"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_message_caches_message_id_key" ON "instagram_message_caches"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "executions_external_id_key" ON "executions"("external_id");

-- CreateIndex
CREATE INDEX "history_table_name_record_id_idx" ON "history"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "history_field_name_idx" ON "history"("field_name");

-- CreateIndex
CREATE INDEX "history_user_id_idx" ON "history"("user_id");

-- CreateIndex
CREATE INDEX "history_organisation_id_idx" ON "history"("organisation_id");

-- CreateIndex
CREATE INDEX "history_agent_id_idx" ON "history"("agent_id");

-- CreateIndex
CREATE INDEX "history_lead_id_idx" ON "history"("lead_id");

-- CreateIndex
CREATE INDEX "history_action_idx" ON "history"("action");

-- CreateIndex
CREATE INDEX "history_trigger_idx" ON "history"("trigger");

-- CreateIndex
CREATE INDEX "history_created_at_idx" ON "history"("created_at");

-- CreateIndex
CREATE INDEX "history_request_id_idx" ON "history"("request_id");

-- CreateIndex
CREATE INDEX "history_table_name_created_at_idx" ON "history"("table_name", "created_at");

-- CreateIndex
CREATE INDEX "history_record_id_created_at_idx" ON "history"("record_id", "created_at");

-- CreateIndex
CREATE INDEX "history_table_name_record_id_field_name_idx" ON "history"("table_name", "record_id", "field_name");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organisations" ADD CONSTRAINT "user_organisations_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organisations" ADD CONSTRAINT "user_organisations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "lead_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_lead_call_schedules" ADD CONSTRAINT "agent_lead_call_schedules_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_lead_call_schedules" ADD CONSTRAINT "agent_lead_call_schedules_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_messages" ADD CONSTRAINT "call_messages_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_messages" ADD CONSTRAINT "call_messages_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
