import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";

type UnitType = "length" | "weight" | "temperature";

interface ConversionUnit {
  type: UnitType;
  from: string;
  to: string;
  convert: (value: number) => number;
}

const CONVERSIONS: ConversionUnit[] = [
  {
    type: "length",
    from: "cm",
    to: "inch",
    convert: (cm) => cm / 2.54,
  },
  {
    type: "length",
    from: "inch",
    to: "cm",
    convert: (inch) => inch * 2.54,
  },
  {
    type: "weight",
    from: "kg",
    to: "lbs",
    convert: (kg) => kg * 2.20462,
  },
  {
    type: "weight",
    from: "lbs",
    to: "kg",
    convert: (lbs) => lbs / 2.20462,
  },
  {
    type: "temperature",
    from: "°C",
    to: "°F",
    convert: (c) => (c * 9) / 5 + 32,
  },
  {
    type: "temperature",
    from: "°F",
    to: "°C",
    convert: (f) => ((f - 32) * 5) / 9,
  },
];

export const UnitConverter = () => {
  const { t } = useTranslation();
  const [selectedConversion, setSelectedConversion] = useState<ConversionUnit>(CONVERSIONS[0]);
  const [inputValue, setInputValue] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const handleConvert = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const converted = selectedConversion.convert(numValue);
      setResult(converted.toFixed(2));
    } else {
      setResult("");
    }
  };

  const handleConversionChange = (index: string) => {
    const conversion = CONVERSIONS[parseInt(index)];
    setSelectedConversion(conversion);
    setInputValue("");
    setResult("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label>{t('unitConverter.selectConversion')}</Label>
          <Select onValueChange={handleConversionChange} defaultValue="0">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONVERSIONS.map((conv, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {t(`unitConverter.conversions.${conv.from.toLowerCase()}_to_${conv.to.toLowerCase().replace('°', '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label>{selectedConversion.from}</Label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleConvert(e.target.value)}
              placeholder={t('unitConverter.inputValue')}
            />
          </div>

          <div className="flex items-center justify-center md:mb-2">
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div>
            <Label>{selectedConversion.to}</Label>
            <Input type="text" value={result} readOnly placeholder={t('unitConverter.result')} />
          </div>
        </div>
      </div>
    </Card>
  );
};
