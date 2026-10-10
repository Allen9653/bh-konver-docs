import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";

interface WebhookAuditFiltersProps {
  onFilterChange: (filters: AuditFilters) => void;
}

export interface AuditFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  eventType: string;
}

export const WebhookAuditFilters = ({ onFilterChange }: WebhookAuditFiltersProps) => {
  const [filters, setFilters] = useState<AuditFilters>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    eventType: "all",
  });

  const handleChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters: AuditFilters = {
      status: "all",
      dateFrom: "",
      dateTo: "",
      eventType: "all",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.status !== "all" || 
    filters.dateFrom !== "" || 
    filters.dateTo !== "" ||
    filters.eventType !== "all";

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filteri</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="w-4 h-4 mr-1" /> Očisti filtere
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-xs">Status</Label>
          <Select value={filters.status} onValueChange={(v) => handleChange("status", v)}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Svi statusi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="Accepted">Prihvaćen</SelectItem>
              <SelectItem value="Invalid Signature">Nevažeći potpis</SelectItem>
              <SelectItem value="Replay">Replay napad</SelectItem>
              <SelectItem value="Ignored">Ignorisan</SelectItem>
              <SelectItem value="Error">Greška</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Event Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="event-filter" className="text-xs">Tip eventa</Label>
          <Select value={filters.eventType} onValueChange={(v) => handleChange("eventType", v)}>
            <SelectTrigger id="event-filter">
              <SelectValue placeholder="Svi eventi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi eventi</SelectItem>
              <SelectItem value="PAYMENT.SALE.COMPLETED">PAYMENT.SALE.COMPLETED</SelectItem>
              <SelectItem value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</SelectItem>
              <SelectItem value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label htmlFor="date-from" className="text-xs">Od datuma</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange("dateFrom", e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label htmlFor="date-to" className="text-xs">Do datuma</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange("dateTo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
