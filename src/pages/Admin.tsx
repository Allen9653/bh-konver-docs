import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp,
  Mail,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  user_email: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: string;
  paypal_order_id: string;
  expires_at: string;
  created_at: string;
}

interface Conversion {
  id: string;
  user_email: string;
  original_filename: string;
  original_format: string;
  target_format: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalPayments: number;
  totalConversions: number;
  totalRevenue: number;
  recentUsers: Array<{ id: string; email: string; created_at: string }>;
  transactions: Transaction[];
  conversions: Conversion[];
}

export default function Admin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPayments: 0,
    totalConversions: 0,
    totalRevenue: 0,
    recentUsers: [],
    transactions: [],
    conversions: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        // Fetch profiles count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from("profiles")
          .select("id, email, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch transactions
        const { data: transactions, count: paymentsCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(50);

        // Fetch conversions
        const { data: conversions, count: conversionsCount } = await supabase
          .from("conversions")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(50);

        // Calculate total revenue from completed transactions
        const completedTransactions = (transactions || []).filter(t => t.status === "completed");
        const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        setStats({
          totalUsers: usersCount || 0,
          totalPayments: paymentsCount || 0,
          totalConversions: conversionsCount || 0,
          totalRevenue,
          recentUsers: recentUsers || [],
          transactions: transactions || [],
          conversions: conversions || [],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const handleManualCleanup = async () => {
    setCleanupLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cleanup-documents");
      
      if (error) throw error;
      
      toast({
        title: "Cleanup uspješan",
        description: `Obrisano dokumenata: ${data?.deletedFiles || 0}, konverzija: ${data?.deletedConversions || 0}`,
      });
      
      // Refresh stats after cleanup
      window.location.reload();
    } catch (error) {
      console.error("Cleanup error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom brisanja dokumenata",
        variant: "destructive",
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="w-3 h-3" /> Završeno
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="w-3 h-3" /> Na čekanju
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="w-3 h-3" /> Neuspješno
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Upravljajte korisnicima, transakcijama i postavkama aplikacije.
            </p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleManualCleanup}
            disabled={cleanupLoading}
          >
            {cleanupLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Ručni Cleanup
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno korisnika</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registrovani korisnici</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno uplata</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">Transakcije</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Konverzije</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversions}</div>
              <p className="text-xs text-muted-foreground">Ukupno konverzija</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prihod</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} BAM</div>
              <p className="text-xs text-muted-foreground">Ukupni prihod</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Korisnici</TabsTrigger>
            <TabsTrigger value="transactions">Transakcije</TabsTrigger>
            <TabsTrigger value="conversions">Konverzije</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Nedavni korisnici</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : stats.recentUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema registrovanih korisnika.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Datum registracije</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              {new Date(user.created_at).toLocaleDateString("bs-BA")}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Aktivan
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transakcije</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : stats.transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema transakcija.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Paket</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Iznos</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Datum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.transactions.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{tx.user_email}</td>
                            <td className="py-3 px-4 capitalize">{tx.plan_id}</td>
                            <td className="py-3 px-4 font-medium">{tx.amount} {tx.currency}</td>
                            <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                            <td className="py-3 px-4">
                              {new Date(tx.created_at).toLocaleDateString("bs-BA")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversions Tab */}
          <TabsContent value="conversions">
            <Card>
              <CardHeader>
                <CardTitle>Konverzije</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : stats.conversions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema konverzija.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Korisnik</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fajl</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Konverzija</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Datum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.conversions.map((conv) => (
                          <tr key={conv.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{conv.user_email || "Anonimni"}</td>
                            <td className="py-3 px-4 max-w-[200px] truncate">{conv.original_filename}</td>
                            <td className="py-3 px-4">
                              <span className="text-muted-foreground">{conv.original_format}</span>
                              {" → "}
                              <span className="font-medium text-primary">{conv.target_format}</span>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(conv.status)}</td>
                            <td className="py-3 px-4">
                              {new Date(conv.created_at).toLocaleDateString("bs-BA")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
