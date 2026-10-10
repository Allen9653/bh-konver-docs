import QuizRunner from "@/components/testers/QuizRunner";

const questions = [
  { prompt: "Koji je glavni grad Bosne i Hercegovine?", options: ["Mostar", "Sarajevo", "Banja Luka", "Tuzla"], answer: 1 },
  { prompt: "Koja je najduža rijeka koja jednim dijelom protiče kroz Bosnu i Hercegovinu?", options: ["Neretva", "Una", "Sava", "Drina"], answer: 2 },
  { prompt: "Koje godine je održan ZAVNOBiH u Mrkonjić Gradu?", options: ["1878.", "1918.", "1943.", "1992."], answer: 2 },
  { prompt: "Kako se zove poznati most iz osmanskog perioda u Mostaru?", options: ["Latinska ćuprija", "Stari most", "Arslanagića most", "Most Mehmed-paše"], answer: 1 },
  { prompt: "Koji je službeni oblik valute Bosne i Hercegovine?", options: ["Bosanska marka", "Konvertibilna marka", "Dinar Bosne", "Hercegovačka marka"], answer: 1 },
];

export default function OpsteZnanjeKviz() {
  return <QuizRunner title="Opšte znanje o BiH" description="Provjerite znanje iz geografije, historije i kulture Bosne i Hercegovine." questions={questions} path="/testovi/opste-znanje" />;
}
