-- CreateTable
CREATE TABLE "instagram_chat_history" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "message" JSONB NOT NULL,

    CONSTRAINT "instagram_chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_chat_history" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "message" JSONB NOT NULL,

    CONSTRAINT "whatsapp_chat_history_pkey" PRIMARY KEY ("id")
);
