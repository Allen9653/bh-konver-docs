import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Check, Copy, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { toast } from 'sonner';

interface ExchangeRates {
  [key: string]: number;
}

const CACHE_KEY = 'bh_konver_currency_rates';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const readCache = (): { rates: ExchangeRates; timestamp: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const rates = parsed?.data?.rates;
    const timestamp = Number(parsed?.timestamp);
    return rates && typeof rates === 'object' && Number.isFinite(timestamp) ? { rates, timestamp } : null;
  } catch {
    return null; // oštećen keš ili localStorage nedostupan (npr. privatni mod)
  }
};

const writeCache = (rates: ExchangeRates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: { rates }, timestamp: Date.now() }));
  } catch {
    // keš nije kritičan
  }
};

const popularCurrencies = ['BAM', 'EUR', 'USD', 'GBP', 'CHF', 'RSD', 'HRK', 'TRY'];

export function CurrencyConverter() {
  const { t } = useTranslation();
  const { copied, copy } = useCopyToClipboard();
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('BAM');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<ExchangeRates>({});
  const [allCurrencies, setAllCurrencies] = useState<string[]>(popularCurrencies);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [failed, setFailed] = useState<boolean>(false);

  const applyRates = (nextRates: ExchangeRates, timestamp: number) => {
    setRates(nextRates);
    setAllCurrencies(Object.keys(nextRates).sort());
    setLastUpdate(new Date(timestamp));
  };

  const fetchRates = async (forceRefresh = false) => {
    setLoading(true);
    setFailed(false);
    try {
      // Prvo pokušaj keš (ako nije osvježavanje na zahtjev)
      if (!forceRefresh) {
        const cached = readCache();
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          applyRates(cached.rates, cached.timestamp);
          return;
        }
      }

      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/BAM`);
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      if (!data?.rates || typeof data.rates !== 'object') throw new Error('Unexpected rates response');

      writeCache(data.rates);
      applyRates(data.rates, Date.now());
      if (forceRefresh) toast.success(t('currencyConverter.refreshed'));
    } catch (error) {
      console.warn('Error fetching rates:', error);
      toast.error(t('currencyConverter.error'));

      // Rezervno: posljednji sačuvani kursevi (ako postoje)
      const cached = readCache();
      if (cached) {
        applyRates(cached.rates, cached.timestamp);
        toast.info(t('currencyConverter.usingCached'));
      } else {
        setFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const convertAmount = (): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !rates[fromCurrency] || !rates[toCurrency]) {
      return '0.00';
    }

    // Convert from source currency to BAM, then to target currency
    const inBAM = numAmount / rates[fromCurrency];
    const result = inBAM * rates[toCurrency];
    
    return new Intl.NumberFormat('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: result !== 0 && Math.abs(result) < 1 ? 4 : 2 }).format(result);
  };

  const ratesReady = Object.keys(rates).length > 0;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatLastUpdate = (): string => {
    if (!lastUpdate) return '';
    return lastUpdate.toLocaleString();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t('currencyConverter.title')}</CardTitle>
        <CardDescription>{t('currencyConverter.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('currencyConverter.amount')}</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="text-lg"
          />
        </div>

        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('currencyConverter.from')}</label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapCurrencies}
            disabled={loading}
            aria-label={t('currencyConverter.swap')}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('currencyConverter.to')}</label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result */}
        <div className="p-4 bg-muted rounded-lg" aria-live="polite">
          <div className="text-sm text-muted-foreground mb-1">{t('currencyConverter.result')}</div>
          {!ratesReady && loading ? (
            <Skeleton className="h-9 w-40" aria-label="Učitavanje kurseva" />
          ) : !ratesReady && failed ? (
            <p role="alert" className="text-sm text-destructive">Kursevi trenutno nisu dostupni. Provjerite vezu i pokušajte ponovo.</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 break-words text-3xl font-bold">{convertAmount()} {toCurrency}</div>
              <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={() => copy(`${convertAmount()} ${toCurrency}`)} aria-label="Kopiraj rezultat">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {/* Last Update and Refresh */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {lastUpdate && `${t('currencyConverter.lastUpdate')}: ${formatLastUpdate()}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 min-w-10"
            onClick={() => fetchRates(true)}
            disabled={loading}
            aria-label="Osvježi kurseve"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground border-t pt-2">
          {t('currencyConverter.privacyNotice')}
        </p>
      </CardContent>
    </Card>
  );
}
