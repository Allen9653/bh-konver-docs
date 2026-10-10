REVOKE EXECUTE ON FUNCTION public.guard_processing_jobs_user_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_user_roles_writes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_auth_user_deleted_cleanup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_server_error_user_context() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.manual_purge_all_logs() FROM PUBLIC, anon;
