import puppeteer from "puppeteer";
import type { QuestionPaper } from "@vedaai/shared";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#16a34a",
  Moderate: "#d97706",
  Challenging: "#dc2626",
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paperHtml(p: QuestionPaper) {
  const generalInstr = p.generalInstructions
    .map((i) => `<li>${esc(i)}</li>`)
    .join("");

  const sections = p.sections
    .map(
      (sec) => `
      <section class="qp-section">
        <h2 class="qp-section-title">Section ${esc(sec.label)}</h2>
        <p class="qp-section-subtitle">${esc(sec.title)}</p>
        <p class="qp-section-instruction"><em>${esc(sec.instruction)}</em></p>
        <ol class="qp-questions">
          ${sec.questions
            .map(
              (q) => `
              <li>
                <span class="qp-q-text">${esc(q.text)}</span>
                <span class="qp-q-tags">
                  <span class="qp-badge" style="background:${
                    DIFFICULTY_COLOR[q.difficulty] || "#5e5e5e"
                  }">${esc(q.difficulty)}</span>
                  <span class="qp-marks">[${q.marks} Marks]</span>
                </span>
              </li>`,
            )
            .join("")}
        </ol>
      </section>`,
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; }
  .qp-header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; }
  .qp-school { font-size: 22px; font-weight: 700; }
  .qp-sub { font-size: 14px; margin-top: 4px; }
  .qp-meta { display: flex; justify-content: space-between; margin: 14px 0 6px; font-weight: 600; font-size: 13px; }
  .qp-general { margin: 0 0 12px 18px; font-size: 12px; }
  .qp-info { margin: 12px 0 16px; font-size: 13px; line-height: 2.1; }
  .qp-info .row span { display: inline-block; min-width: 180px; border-bottom: 1px dotted #5e5e5e; }
  .qp-section { margin-top: 18px; page-break-inside: avoid; }
  .qp-section-title { text-align: center; font-size: 16px; margin: 8px 0; }
  .qp-section-subtitle { text-align: center; font-weight: 700; margin: 0; font-size: 13px; }
  .qp-section-instruction { text-align: center; margin: 4px 0 10px; font-size: 12px; color: #444; }
  .qp-questions { padding-left: 22px; font-size: 13px; line-height: 1.55; }
  .qp-questions li { margin-bottom: 10px; }
  .qp-q-tags { white-space: nowrap; margin-left: 8px; }
  .qp-badge { color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 6px; font-weight: 700; letter-spacing: 0.3px; font-family: Arial, sans-serif; }
  .qp-marks { font-size: 12px; color: #444; font-weight: 600; margin-left: 6px; }
  .qp-end { text-align: center; margin-top: 22px; font-weight: 700; letter-spacing: 1px; }
</style></head>
<body>
  <div class="qp-header">
    <div class="qp-school">${esc(p.schoolName)}</div>
    <div class="qp-sub">Subject: ${esc(p.subject)} &nbsp;|&nbsp; Class: ${esc(p.grade)}</div>
  </div>
  <div class="qp-meta">
    <span>Time Allowed: ${esc(p.timeAllowed)}</span>
    <span>Maximum Marks: ${p.totalMarks}</span>
  </div>
  <ol class="qp-general">${generalInstr}</ol>
  <div class="qp-info">
    <div class="row">Name: <span></span> &nbsp;&nbsp; Roll Number: <span></span></div>
    <div class="row">Class: ${esc(p.grade)} &nbsp; Section: <span></span></div>
  </div>
  ${sections}
  <div class="qp-end">End of Question Paper</div>
</body></html>`;
}

export async function renderPaperPdf(paper: QuestionPaper): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(paperHtml(paper), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
