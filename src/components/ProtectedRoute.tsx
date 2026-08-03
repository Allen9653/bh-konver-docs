import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Where to send unauthenticated visitors. */
  redirectTo?: string;
}

/**
 * Route guard: blocks rendering until the auth state is rehydrated, then
 * redirects unauthenticated users to the sign-in page while preserving the
 * originally requested path via the `next` query parameter.
 */
export const ProtectedRoute = ({ children, redirectTo = "/auth" }: ProtectedRouteProps) => {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${redirectTo}?next=${next}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
