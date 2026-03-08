import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { WebhookAuditFilters, type AuditFilters } from "@/components/WebhookAuditFilters";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminSearchInput } from "@/components/AdminSearchInput";
import { AdminConversionStats } from "@/components/AdminConversionStats";
import { AdminDangerZone } from "@/components/AdminDangerZone";
import { AdminServerErrors } from "@/components/AdminServerErrors";
import { AdminAdsManager } from "@/components/AdminAdsManager";
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Loader2,
  Shield,
  AlertTriangle,
  Ban,
  BarChart3
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

interface WebhookAuditLog {
  id: string;
  event_type: string | null;
  transmission_id: string | null;
  status: string;
  request_payload: unknown;
  received_at: string;
  client_ip: string | null;
  notes: string | null;
}

interface DashboardStats {
  totalUsers: number;
  totalPayments: number;
  totalConversions: number;
  totalRevenue: number;
}

const ITEMS_PER_PAGE = 10;

export default function Admin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAdminAuth();
  
  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPayments: 0,
    totalConversions: 0,
    totalRevenue: 0,
  });
  
  // Paginated data
  const [recentUsers, setRecentUsers] = useState<Array<{ id: string; email: string; created_at: string }>>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [auditLogs, setAuditLogs] = useState<WebhookAuditLog[]>([]);
  
  // Total counts for pagination
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  
  // Current pages
  const [usersPage, setUsersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [conversionsPage, setConversionsPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingConversions, setLoadingConversions] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  
  // Filters
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    eventType: "all",
  });
  
  // Search queries
  const [usersSearch, setUsersSearch] = useState("");
  const [transactionsSearch, setTransactionsSearch] = useState("");
  const [conversionsSearch, setConversionsSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        const [
          { count: usersCount },
          { count: paymentsCount },
          { count: conversionsCount },
          { data: completedTx },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("transactions").select("*", { count: "exact", head: true }),
          supabase.from("conversions").select("*", { count: "exact", head: true }),
          supabase.from("transactions").select("amount").eq("status", "completed"),
        ]);

        const totalRevenue = (completedTx || []).reduce((sum, t) => sum + Number(t.amount), 0);

        setStats({
          totalUsers: usersCount || 0,
          totalPayments: paymentsCount || 0,
          totalConversions: conversionsCount || 0,
          totalRevenue,
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

  // Fetch users with pagination and search
  const fetchUsers = useCallback(async (page: number, search: string) => {
    setLoadingUsers(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("profiles")
        .select("id, email, created_at", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("email", `%${search}%`);
      }

      const { data, count } = await query.range(from, to);

      setRecentUsers(data || []);
      setTotalUsers(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch transactions with pagination and search
  const fetchTransactions = useCallback(async (page: number, search: string) => {
    setLoadingTransactions(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`user_email.ilike.%${search}%,plan_id.ilike.%${search}%,paypal_order_id.ilike.%${search}%`);
      }

      const { data, count } = await query.range(from, to);

      setTransactions(data || []);
      setTotalTransactions(count || 0);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Fetch conversions with pagination and search
  const fetchConversions = useCallback(async (page: number, search: string) => {
    setLoadingConversions(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("conversions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`user_email.ilike.%${search}%,original_filename.ilike.%${search}%,original_format.ilike.%${search}%,target_format.ilike.%${search}%`);
      }

      const { data, count } = await query.range(from, to);

      setConversions(data || []);
      setTotalConversions(count || 0);
    } catch (error) {
      console.error("Error fetching conversions:", error);
    } finally {
      setLoadingConversions(false);
    }
  }, []);

  // Fetch audit logs with pagination, filters, and search
  const fetchAuditLogs = useCallback(async (page: number, filters: AuditFilters, search: string) => {
    setLoadingAudit(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("webhook_audit_log")
        .select("*", { count: "exact" })
        .order("received_at", { ascending: false });

      // Apply filters
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.eventType !== "all") {
        query = query.eq("event_type", filters.eventType);
      }
      if (filters.dateFrom) {
        query = query.gte("received_at", `${filters.dateFrom}T00:00:00`);
      }
      if (filters.dateTo) {
        query = query.lte("received_at", `${filters.dateTo}T23:59:59`);
      }
      
      // Apply search
      if (search) {
        query = query.or(`event_type.ilike.%${search}%,transmission_id.ilike.%${search}%,client_ip.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      const { data, count } = await query.range(from, to);

      setAuditLogs(data || []);
      setTotalAuditLogs(count || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (isAdmin) {
      fetchUsers(usersPage, usersSearch);
      fetchTransactions(transactionsPage, transactionsSearch);
      fetchConversions(conversionsPage, conversionsSearch);
      fetchAuditLogs(auditPage, auditFilters, auditSearch);
    }
  }, [isAdmin]);

  // Page change handlers
  const handleUsersPageChange = (page: number) => {
    setUsersPage(page);
    fetchUsers(page, usersSearch);
  };

  const handleTransactionsPageChange = (page: number) => {
    setTransactionsPage(page);
    fetchTransactions(page, transactionsSearch);
  };

  const handleConversionsPageChange = (page: number) => {
    setConversionsPage(page);
    fetchConversions(page, conversionsSearch);
  };

  const handleAuditPageChange = (page: number) => {
    setAuditPage(page);
    fetchAuditLogs(page, auditFilters, auditSearch);
  };
  
  // Search handlers
  const handleUsersSearch = useCallback((query: string) => {
    setUsersSearch(query);
    setUsersPage(1);
    fetchUsers(1, query);
  }, [fetchUsers]);

  const handleTransactionsSearch = useCallback((query: string) => {
    setTransactionsSearch(query);
    setTransactionsPage(1);
    fetchTransactions(1, query);
  }, [fetchTransactions]);

  const handleConversionsSearch = useCallback((query: string) => {
    setConversionsSearch(query);
    setConversionsPage(1);
    fetchConversions(1, query);
  }, [fetchConversions]);

  const handleAuditSearch = useCallback((query: string) => {
    setAuditSearch(query);
    setAuditPage(1);
    fetchAuditLogs(1, auditFilters, query);
  }, [fetchAuditLogs, auditFilters]);

  // Filter change handler
  const handleAuditFiltersChange = (newFilters: AuditFilters) => {
    setAuditFilters(newFilters);
    setAuditPage(1);
    fetchAuditLogs(1, newFilters, auditSearch);
  };

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
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="w-3 h-3" /> {status === "Accepted" ? "Prihvaćen" : "Završeno"}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="w-3 h-3" /> Na čekanju
          </span>
        );
      case "failed":
      case "Invalid Signature":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="w-3 h-3" /> {status === "Invalid Signature" ? "Nevažeći potpis" : "Neuspješno"}
          </span>
        );
      case "Replay":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
            <AlertTriangle className="w-3 h-3" /> Replay napad
          </span>
        );
      case "Ignored":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            <Ban className="w-3 h-3" /> Ignorisan
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

  // Calculate total pages
  const usersTotalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const transactionsTotalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  const conversionsTotalPages = Math.ceil(totalConversions / ITEMS_PER_PAGE);
  const auditTotalPages = Math.ceil(totalAuditLogs / ITEMS_PER_PAGE);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-hero text-white py-6 px-4 mb-0">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Admin Panel</h1>
            <p className="text-white/70 text-sm">Upravljajte korisnicima, transakcijama i postavkama</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Nazad
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <div className="mb-6 flex justify-end">
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users">Korisnici</TabsTrigger>
            <TabsTrigger value="transactions">Transakcije</TabsTrigger>
            <TabsTrigger value="conversions">Konverzije</TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Logovi
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Greške
            </TabsTrigger>
            <TabsTrigger value="ads">Reklame</TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Webhook
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Korisnici ({totalUsers})</CardTitle>
                <AdminSearchInput 
                  placeholder="Pretraži po email-u..."
                  onSearch={handleUsersSearch}
                  className="w-full sm:w-64"
                />
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema registrovanih korisnika.
                  </p>
                ) : (
                  <>
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
                          {recentUsers.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">{u.email}</td>
                              <td className="py-3 px-4">
                                {new Date(u.created_at).toLocaleDateString("bs-BA")}
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
                    <AdminPagination
                      currentPage={usersPage}
                      totalPages={usersTotalPages}
                      onPageChange={handleUsersPageChange}
                      totalItems={totalUsers}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Transakcije ({totalTransactions})</CardTitle>
                <AdminSearchInput 
                  placeholder="Pretraži po email-u, paketu, PayPal ID..."
                  onSearch={handleTransactionsSearch}
                  className="w-full sm:w-72"
                />
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema transakcija.
                  </p>
                ) : (
                  <>
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
                          {transactions.map((tx) => (
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
                    <AdminPagination
                      currentPage={transactionsPage}
                      totalPages={transactionsTotalPages}
                      onPageChange={handleTransactionsPageChange}
                      totalItems={totalTransactions}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversions Tab */}
          <TabsContent value="conversions">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Konverzije ({totalConversions})</CardTitle>
                <AdminSearchInput 
                  placeholder="Pretraži po email-u, fajlu, formatu..."
                  onSearch={handleConversionsSearch}
                  className="w-full sm:w-72"
                />
              </CardHeader>
              <CardContent>
                {loadingConversions ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : conversions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nema konverzija.
                  </p>
                ) : (
                  <>
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
                          {conversions.map((conv) => (
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
                    <AdminPagination
                      currentPage={conversionsPage}
                      totalPages={conversionsTotalPages}
                      onPageChange={handleConversionsPageChange}
                      totalItems={totalConversions}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    PayPal Webhook Audit Log ({totalAuditLogs})
                  </CardTitle>
                  <AdminSearchInput 
                    placeholder="Pretraži po event type, transmission ID, IP..."
                    onSearch={handleAuditSearch}
                    className="w-full sm:w-80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <WebhookAuditFilters onFilterChange={handleAuditFiltersChange} />
                
                {loadingAudit ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {totalAuditLogs === 0 
                      ? "Nema zabilježenih webhook događaja."
                      : "Nema rezultata za primijenjene filtere."}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vrijeme</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Event Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transmission ID</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Adresa</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Napomena</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 whitespace-nowrap">
                                {new Date(log.received_at).toLocaleString("bs-BA")}
                              </td>
                              <td className="py-3 px-4 font-mono text-xs">
                                {log.event_type || "N/A"}
                              </td>
                              <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                              <td className="py-3 px-4 font-mono text-xs max-w-[150px] truncate">
                                {log.transmission_id || "N/A"}
                              </td>
                              <td className="py-3 px-4 font-mono text-xs">
                                {log.client_ip || "N/A"}
                              </td>
                              <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground">
                                {log.notes || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <AdminPagination
                      currentPage={auditPage}
                      totalPages={auditTotalPages}
                      onPageChange={handleAuditPageChange}
                      totalItems={totalAuditLogs}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Logs Tab */}
          <TabsContent value="logs">
            <AdminConversionStats />
          </TabsContent>

          {/* Server Errors Tab */}
          <TabsContent value="errors">
            <AdminServerErrors />
          </TabsContent>

          {/* Ads Manager Tab */}
          <TabsContent value="ads">
            <AdminAdsManager />
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <div className="mt-8">
          <AdminDangerZone />
        </div>
      </div>
      <Footer />
    </div>
  );
}
