import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminSearchInput } from "@/components/AdminSearchInput";
import { BarChart3, Download, Loader2 } from "lucide-react";

interface ConversionLog {
  id: string;
  from_format: string;
  to_format: string;
  file_size_kb: number;
  user_email: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export function AdminConversionStats() {
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, totalSizeKb: 0, topFormat: "N/A" });

  const fetchLogs = useCallback(async (p: number, q: string) => {
    setLoading(true);
    const from = (p - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("conversion_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`from_format.ilike.%${q}%,to_format.ilike.%${q}%,user_email.ilike.%${q}%`);
    }

    const { data, count } = await query.range(from, to);
    setLogs((data as ConversionLog[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data, count } = await supabase
      .from("conversion_logs")
      .select("file_size_kb, to_format", { count: "exact" });

    if (data && data.length > 0) {
      const totalSizeKb = data.reduce((sum, r) => sum + Number(r.file_size_kb), 0);
      const formatCount: Record<string, number> = {};
      data.forEach((r) => { formatCount[r.to_format] = (formatCount[r.to_format] || 0) + 1; });
      const topFormat = Object.entries(formatCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
      setStats({ totalLogs: count || 0, totalSizeKb, topFormat });
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, search);
    fetchStats();
  }, []);

  const handlePageChange = (p: number) => { setPage(p); fetchLogs(p, search); };
  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); fetchLogs(1, q); }, [fetchLogs]);

  const handleDownloadPDF = () => {
    // Generate a simple CSV/text report (in-browser, no storage)
    const header = "ID,From,To,Size(KB),User,Date\n";
    const rows = logs.map((l) =>
      `${l.id},${l.from_format},${l.to_format},${l.file_size_kb},${l.user_email || "anonymous"},${new Date(l.created_at).toISOString()}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bh-konver-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Conversion Logs ({total})
        </CardTitle>
        <div className="flex items-center gap-3">
          <AdminSearchInput placeholder="Pretraži po formatu, email..." onSearch={handleSearch} className="w-full sm:w-64" />
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="border-accent text-accent hover:bg-accent/10">
            <Download className="w-4 h-4 mr-1" /> CSV Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalLogs}</p>
            <p className="text-xs text-muted-foreground">Ukupno logova</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/10 text-center">
            <p className="text-2xl font-bold text-accent">{(stats.totalSizeKb / 1024).toFixed(1)} MB</p>
            <p className="text-xs text-muted-foreground">Ukupna veličina</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{stats.topFormat.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">Najpopularniji format</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nema conversion logova.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Korisnik</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Konverzija</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Veličina</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{log.user_email || "anonymous"}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-muted-foreground">{log.from_format}</span>
                        {" → "}
                        <span className="font-medium text-primary">{log.to_format}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">{log.file_size_kb} KB</td>
                      <td className="py-3 px-4 text-sm">{new Date(log.created_at).toLocaleString("bs-BA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} totalItems={total} itemsPerPage={ITEMS_PER_PAGE} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
