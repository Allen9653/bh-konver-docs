import QuizRunner from "@/components/testers/QuizRunner";

const questions = [
  { prompt: "Kako se postupa na saobraćajnom znaku STOP?", options: ["Samo usporiti", "Potpuno zaustaviti vozilo i nastaviti kada je sigurno", "Zaustaviti se samo ako ima pješaka", "Nastaviti ako nema vozila"], answer: 1 },
  { prompt: "Šta je vozač dužan uraditi kada pješak prelazi obilježeni pješački prelaz?", options: ["Dati mu prednost i po potrebi zaustaviti vozilo", "Zvučnim signalom upozoriti pješaka", "Nastaviti ako je ograničenje brzine ispoštovano", "Preteći drugo vozilo"], answer: 0 },
  { prompt: "Šta znači neprekinuta uzdužna linija na kolovozu?", options: ["Dozvoljeno je preticanje", "Zabranjeno je prelaziti preko nje", "Označava parking", "Označava autobusku traku"], answer: 1 },
  { prompt: "Na raskrsnici puteva iste važnosti, kome se u pravilu daje prednost?", options: ["Vozilu koje dolazi s lijeve strane", "Vozilu koje dolazi s desne strane", "Većem vozilu", "Vozilu koje se brže kreće"], answer: 1 },
  { prompt: "Kako treba postupiti kada se približava vozilo hitne pomoći sa uključenim posebnim svjetlosnim i zvučnim signalima?", options: ["Nastaviti istom brzinom", "Omogućiti mu prolaz i bezbjedno se skloniti", "Pratiti ga kako bi se brže prošla kolona", "Zaustaviti se nasred raskrsnice"], answer: 1 },
];

export default function SaobracajniTest() {
  return <QuizRunner title="Saobraćajni test" description="Provjerite osnovno poznavanje znakova, prednosti prolaza i ponašanja u saobraćaju." questions={questions} path="/testovi/saobracajni" />;
}
