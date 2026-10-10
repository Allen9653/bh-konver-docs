import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

export default function QuizRunner({ title, description, questions, path }) {
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const complete = answeredCount === questions.length;
  const score = answers.reduce((total, answer, index) => total + (answer === questions[index].answer ? 1 : 0), 0);
  const feedback = score === questions.length ? "Odlično! Tačno ste odgovorili na sva pitanja." : score >= Math.ceil(questions.length / 2) ? "Dobar rezultat. Pregledajte označene odgovore i pokušajte ponovo." : "Nastavite vježbati i pokušajte ponovo.";

  const resetQuiz = () => {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={`${title} | BH KONVER`} description={`${description} Interaktivni online kviz s bodovanjem i prikazom rezultata.`} path={path} jsonLd={{ "@type": "Quiz", name: title, description }} />
      <Navbar activeCategory="TESTOVI" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/testovi" className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Svi testovi</Link>
        <header className="mb-7 mt-5 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">BH KONVER · TEST</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description} Odgovorite na {questions.length} pitanja.</p>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); if (complete) setSubmitted(true); }} className="space-y-4">
          {questions.map((question, questionIndex) => {
            const selected = answers[questionIndex];
            const isCorrect = selected === question.answer;
            return (
              <fieldset key={question.prompt} className="rounded-lg border border-border bg-card p-5 sm:p-6" disabled={submitted}>
                <legend className="w-full font-semibold leading-6 text-foreground"><span className="mr-2 text-primary">{String(questionIndex + 1).padStart(2, "0")}</span>{question.prompt}</legend>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const chosen = selected === optionIndex;
                    const correctAnswer = submitted && optionIndex === question.answer;
                    const wrongAnswer = submitted && chosen && !isCorrect;
                    return (
                      <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${correctAnswer ? "border-emerald-500 bg-emerald-500/10 text-foreground" : wrongAnswer ? "border-destructive bg-destructive/10 text-foreground" : chosen ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground/80 hover:bg-muted"}`}>
                        <input type="radio" name={`question-${questionIndex}`} checked={chosen} onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))} className="accent-primary" />
                        <span className="flex-1">{option}</span>
                        {correctAnswer && <Check className="h-4 w-4 text-emerald-600" aria-label="Tačan odgovor" />}
                        {wrongAnswer && <X className="h-4 w-4 text-destructive" aria-label="Netačan odgovor" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            {submitted ? <div aria-live="polite"><p className="font-semibold text-foreground">Rezultat: <span className="text-primary">{score} / {questions.length}</span></p><p className="mt-1 text-sm text-muted-foreground">{feedback}</p></div> : <p className="text-sm text-muted-foreground">Odgovoreno: {answeredCount} / {questions.length}</p>}
            {submitted ? <button type="button" onClick={resetQuiz} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" aria-hidden="true" />Pokušaj ponovo</button> : <button type="submit" disabled={!complete} className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">Prikaži rezultat</button>}
          </div>
        </form>
      </main>
      <Footer activeCategory="TESTOVI" />
    </div>
  );
}
