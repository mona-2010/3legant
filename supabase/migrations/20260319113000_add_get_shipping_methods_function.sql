create or replace function public.get_shipping_methods()
returns table(method public.shipping_method)
language sql
stable
as $$
  select unnest(enum_range(null::public.shipping_method)) as method;
$$;

grant execute on function public.get_shipping_methods() to anon;
grant execute on function public.get_shipping_methods() to authenticated;
