import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppInitializer from "@/components/AppInitializer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";


const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const History = lazy(() => import("./pages/History"));
const Success = lazy(() => import("./pages/Success"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Support = lazy(() => import("./pages/Support"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Alati = lazy(() => import("./pages/Alati"));
const PravniDokumenti = lazy(() => import("./pages/PravniDokumenti"));
const SlikaPdf = lazy(() => import("./pages/SlikaPdf"));
const SlikaPdfHistory = lazy(() => import("./pages/SlikaPdfHistory"));
const Connect = lazy(() => import("./pages/Connect"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInitializer>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

              <Route path="/success" element={<Success />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/alati" element={<Alati />} />
              <Route path="/pravni-dokumenti" element={<PravniDokumenti />} />
              <Route path="/slika-pdf" element={<SlikaPdf />} />
              <Route path="/slika-pdf/istorija" element={<SlikaPdfHistory />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
