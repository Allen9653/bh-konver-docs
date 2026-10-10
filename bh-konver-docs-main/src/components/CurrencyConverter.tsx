import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ExchangeRates {
  [key: string]: number;
}

const CACHE_KEY = 'bh_konver_currency_rates';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const popularCurrencies = ['BAM', 'EUR', 'USD', 'GBP', 'CHF', 'RSD', 'HRK', 'TRY'];

export function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('BAM');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<ExchangeRates>({});
  const [allCurrencies, setAllCurrencies] = useState<string[]>(popularCurrencies);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < CACHE_DURATION) {
            setRates(data.rates);
            setAllCurrencies(Object.keys(data.rates).sort());
            setLastUpdate(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from free API (using exchangerate-api.com free tier)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/BAM`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const data = await response.json();
      
      // Cache the results
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      setRates(data.rates);
      setAllCurrencies(Object.keys(data.rates).sort());
      setLastUpdate(new Date());
      
      if (forceRefresh) {
        toast.success(t('currencyConverter.refreshed'));
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error(t('currencyConverter.error'));
      
      // Try to use cached data as fallback
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        setRates(data.rates);
        setAllCurrencies(Object.keys(data.rates).sort());
        setLastUpdate(new Date(timestamp));
        toast.info(t('currencyConverter.usingCached'));
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
    
    return result.toFixed(2);
  };

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
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">{t('currencyConverter.result')}</div>
          <div className="text-3xl font-bold">
            {convertAmount()} {toCurrency}
          </div>
        </div>

        {/* Last Update and Refresh */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {lastUpdate && `${t('currencyConverter.lastUpdate')}: ${formatLastUpdate()}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRates(true)}
            disabled={loading}
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
