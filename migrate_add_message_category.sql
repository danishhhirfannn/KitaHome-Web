-- Add message category column to the Message table
ALTER TABLE "Message" ADD COLUMN "messageCategory" TEXT;

-- Update existing messages to use the 'uncategorized' category
UPDATE "Message" SET "messageCategory" = 'uncategorized' WHERE "messageCategory" IS NULL;

-- Add index for faster category filtering
CREATE INDEX IF NOT EXISTS "message_category_idx" ON "Message" ("messageCategory");

-- Add comment explaining the purpose of the column
COMMENT ON COLUMN "Message"."messageCategory" IS 'Automatically determined category of the message based on content analysis'; 