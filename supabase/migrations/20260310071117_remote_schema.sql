drop extension if exists "pg_net";


  create policy "Allow authenticated uploads 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'avatars'::text));



  create policy "Allow public read 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



