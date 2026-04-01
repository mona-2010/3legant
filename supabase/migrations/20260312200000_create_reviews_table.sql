-- Create reviews table
CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "user_avatar" "text",
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id")
        REFERENCES "public"."products"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."reviews" OWNER TO "postgres";

-- One review per user per product
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_product_idx"
    ON "public"."reviews" ("user_id", "product_id");

-- RLS policies
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Allow public read of reviews"
    ON "public"."reviews" FOR SELECT
    TO public
    USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Allow authenticated insert own reviews"
    ON "public"."reviews" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Allow users to update own reviews"
    ON "public"."reviews" FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Allow users to delete own reviews"
    ON "public"."reviews" FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to update product rating and review_count on review change
CREATE OR REPLACE FUNCTION "public"."update_product_review_stats"()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    UPDATE "public"."products"
    SET
        rating = COALESCE((
            SELECT ROUND(AVG(r.rating)::numeric, 1)
            FROM "public"."reviews" r
            WHERE r.product_id = target_product_id
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM "public"."reviews" r
            WHERE r.product_id = target_product_id
        ),
        updated_at = now()
    WHERE id = target_product_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update product stats
CREATE TRIGGER "on_review_change"
    AFTER INSERT OR UPDATE OR DELETE ON "public"."reviews"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_product_review_stats"();
