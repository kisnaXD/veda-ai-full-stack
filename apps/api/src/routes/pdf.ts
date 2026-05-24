import { Router } from "express";
import { AssignmentModel } from "../models/Assignment";
import { renderPaperPdf } from "../services/pdf";

export const pdfRouter = Router();

pdfRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const doc = await AssignmentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "ready" || !doc.paper) {
      return res.status(409).json({ error: "Paper not ready" });
    }

    const buffer = await renderPaperPdf(doc.paper as never);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(doc.title || "question-paper").replace(/[^a-z0-9-_]+/gi, "_")}.pdf"`,
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});
