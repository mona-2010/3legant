-- Add likes and replies for product reviews

CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id")
        REFERENCES "public"."reviews"("id") ON DELETE CASCADE,
    CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."review_likes" OWNER TO "postgres";

CREATE UNIQUE INDEX IF NOT EXISTS "review_likes_review_user_idx"
    ON "public"."review_likes" ("review_id", "user_id");

CREATE INDEX IF NOT EXISTS "review_likes_review_id_idx"
    ON "public"."review_likes" ("review_id");

ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of review likes"
    ON "public"."review_likes" FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated insert own review likes"
    ON "public"."review_likes" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own review likes"
    ON "public"."review_likes" FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS "public"."review_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "user_avatar" "text",
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id")
        REFERENCES "public"."reviews"("id") ON DELETE CASCADE,
    CONSTRAINT "review_replies_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."review_replies" OWNER TO "postgres";

CREATE INDEX IF NOT EXISTS "review_replies_review_id_idx"
    ON "public"."review_replies" ("review_id");

ALTER TABLE "public"."review_replies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of review replies"
    ON "public"."review_replies" FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated insert own review replies"
    ON "public"."review_replies" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own review replies"
    ON "public"."review_replies" FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own review replies"
    ON "public"."review_replies" FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
