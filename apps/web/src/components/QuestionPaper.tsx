import type { QuestionPaper as PaperType } from "@vedaai/shared";
import { DifficultyBadge } from "./DifficultyBadge";

export function QuestionPaper({ paper }: { paper: PaperType }) {
  return (
    <article className="paper-font text-ink">
      <header className="text-center pb-3 border-b-2 border-ink/80">
        <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight">{paper.schoolName}</h1>
        <p className="mt-1 text-[15px] sm:text-[16px] font-semibold">
          Subject: {paper.subject} &nbsp;•&nbsp; Class: {paper.grade}
        </p>
      </header>

      <div className="flex justify-between items-baseline mt-4 text-[14px] sm:text-[15px] font-semibold">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      {paper.generalInstructions?.length > 0 && (
        <ol className="list-decimal pl-5 mt-3 text-[13px] sm:text-[14px] space-y-1 text-ink-muted">
          {paper.generalInstructions.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ol>
      )}

      <div className="mt-6 mb-2 text-[14px] sm:text-[15px] leading-[2.2] tracking-wide">
        <div>Name: <span className="inline-block min-w-[200px] border-b border-dotted border-ink/60 align-bottom" /></div>
        <div>Roll Number: <span className="inline-block min-w-[200px] border-b border-dotted border-ink/60 align-bottom" /></div>
        <div>Class: {paper.grade} &nbsp; Section: <span className="inline-block min-w-[120px] border-b border-dotted border-ink/60 align-bottom" /></div>
      </div>

      {paper.sections.map((section) => (
        <section key={section.label} className="mt-8">
          <h2 className="text-center text-[18px] sm:text-[20px] font-bold">Section {section.label}</h2>
          <p className="text-center text-[15px] font-semibold mt-1">{section.title}</p>
          <p className="text-center italic text-[13px] text-ink-muted mt-0.5">{section.instruction}</p>

          <ol className="mt-4 space-y-3 list-decimal pl-6 text-[14px] sm:text-[15px] leading-relaxed">
            {section.questions.map((q) => (
              <li key={`${section.label}-${q.number}`} className="pl-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="flex-1 min-w-[60%]">{q.text}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <DifficultyBadge level={q.difficulty} />
                    <span className="text-[12px] font-bold text-ink-muted whitespace-nowrap">
                      [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="text-center font-bold tracking-widest mt-10 text-[14px] text-ink-muted">
        END OF QUESTION PAPER
      </p>
    </article>
  );
}
