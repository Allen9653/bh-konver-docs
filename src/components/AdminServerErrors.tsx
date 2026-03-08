import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPagination } from "@/components/AdminPagination";
import { AdminSearchInput } from "@/components/AdminSearchInput";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ServerError {
  id: string;
  error_message: string;
  error_code: string | null;
  file_name: string | null;
  from_format: string | null;
  to_format: string | null;
  file_size_kb: number | null;
  user_email: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export function AdminServerErrors() {
  const [errors, setErrors] = useState<ServerError[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchErrors = useCallback(async (p: number, q: string) => {
    setLoading(true);
    const from = (p - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("server_errors" as any)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`error_message.ilike.%${q}%,file_name.ilike.%${q}%,user_email.ilike.%${q}%`);
    }

    const { data, count } = await query.range(from, to);
    setErrors((data as unknown as ServerError[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchErrors(page, search);
  }, []);

  const handlePageChange = (p: number) => { setPage(p); fetchErrors(p, search); };
  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); fetchErrors(1, q); }, [fetchErrors]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Card className="border-destructive/30">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Greške pri konverziji ({total})
        </CardTitle>
        <AdminSearchInput placeholder="Pretraži po grešci, fajlu, email..." onSearch={handleSearch} className="w-full sm:w-64" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : errors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nema zabilježenih grešaka. 🎉</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Korisnik</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Fajl</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Konverzija</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Greška</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((err) => (
                    <tr key={err.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{err.user_email || "anonymous"}</td>
                      <td className="py-3 px-4 text-sm max-w-[150px] truncate">{err.file_name || "N/A"}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-muted-foreground">{err.from_format || "?"}</span>
                        {" → "}
                        <span className="font-medium text-destructive">{err.to_format || "?"}</span>
                      </td>
                      <td className="py-3 px-4 text-sm max-w-[250px] truncate text-destructive">{err.error_message}</td>
                      <td className="py-3 px-4 text-sm">{new Date(err.created_at).toLocaleString("bs-BA")}</td>
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
