create type "public"."shipping_method" as enum ('free', 'express', 'pickup');

alter table "public"."cart" drop constraint "cart_user_id_product_id_color_key";

alter table "public"."order_items" drop constraint "order_items_product_id_fkey";

alter table "public"."orders" drop constraint "orders_user_id_fkey";

drop index if exists "public"."cart_user_id_product_id_color_key";

alter table "public"."orders" alter column "status" drop default;

alter type "public"."order_status" rename to "order_status__old_version_to_be_dropped";

create type "public"."order_status" as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

alter table "public"."orders" alter column status type "public"."order_status" using status::text::"public"."order_status";

alter table "public"."orders" alter column "status" set default 'pending'::public.order_status;

drop type "public"."order_status__old_version_to_be_dropped";

alter table "public"."products" add column "color" text;

CREATE UNIQUE INDEX cart_unique_product ON public.cart USING btree (user_id, product_id, color);

CREATE UNIQUE INDEX cart_user_id_product_id_key ON public.cart USING btree (user_id, product_id);

CREATE INDEX idx_admin_users_user_id ON public.admin_users USING btree (user_id);

CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage USING btree (coupon_id);

CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage USING btree (user_id);

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);

CREATE UNIQUE INDEX wishlist_unique ON public.wishlist USING btree (user_id, product_id);

alter table "public"."cart" add constraint "cart_unique_product" UNIQUE using index "cart_unique_product";

alter table "public"."cart" add constraint "cart_user_id_product_id_key" UNIQUE using index "cart_user_id_product_id_key";

alter table "public"."wishlist" add constraint "wishlist_unique" UNIQUE using index "wishlist_unique";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";


  create policy "Users can delete their cart"
  on "public"."cart"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their cart"
  on "public"."cart"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their cart"
  on "public"."cart"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their cart"
  on "public"."cart"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



