import React, { useState } from 'react';
import { ChevronDown, Info, CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface ToolInfoGuideProps {
  title: string;
  description: string;
  steps: string[];
  benefits: string[];
  faqs: FaqItem[];
}

export const ToolInfoGuide: React.FC<ToolInfoGuideProps> = ({
  title,
  description,
  steps,
  benefits,
  faqs,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="mt-12 space-y-8 border-t border-slate-200 pt-8 dark:border-slate-800">
      {/* Sekcija 1: O alatu */}
      <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Info className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Šta je {title}?
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Sekcija 2: Korak po korak uputstvo */}
      <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kako se koristi alat?
          </h2>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                {idx + 1}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sekcija 3: Prednosti i preporuke */}
      <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Zašto odabrati BH KONVER?
          </h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Sekcija 4: Česta pitanja (FAQ) */}
      {faqs && faqs.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Česta pitanja (FAQ)
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-slate-800"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium text-slate-900 dark:text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-slate-100 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};