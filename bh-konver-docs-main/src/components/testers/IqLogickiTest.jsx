import QuizRunner from "@/components/testers/QuizRunner";

const questions = [
  { prompt: "Koji broj nastavlja niz: 2, 4, 8, 16, ...?", options: ["24", "30", "32", "34"], answer: 2 },
  { prompt: "Koji broj nedostaje: 3, 6, 11, 18, 27, ...?", options: ["34", "36", "38", "40"], answer: 2 },
  { prompt: "Koje slovo nastavlja niz: A, C, F, J, O, ...?", options: ["T", "U", "V", "W"], answer: 1 },
  { prompt: "Koji broj ne pripada nizu?", options: ["16", "25", "36", "48"], answer: 3 },
  { prompt: "Sve mape su plave. Ova fascikla je mapa. Šta sigurno slijedi?", options: ["Fascikla je plava", "Sve plave stvari su mape", "Fascikla je papirna", "Nijedan zaključak nije moguć"], answer: 0 },
];

export default function IqLogickiTest() {
  return <QuizRunner title="IQ i logički test" description="Riješite nizove i kratke zadatke logičkog zaključivanja." questions={questions} path="/testovi/logika" />;
}
