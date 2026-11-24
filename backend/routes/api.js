import { Router } from "express";
import { login } from "../controllers/auth.js";
import { getPortfolio, updatePortfolio } from "../controllers/portfolio.js";
import { createMessage, listMessages, markMessageRead } from "../controllers/messages.js";
import { requireAuth } from "../middleware/auth.js";
import Portfolio from "../models/Portfolio.js";
import Message from "../models/Message.js";
import multer from "multer";
import { deleteMedia, downloadResume, uploadMedia, uploadResume } from "../controllers/uploads.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    callback(allowed.includes(file.mimetype) ? null : new Error("Unsupported file type"), allowed.includes(file.mimetype));
  }
});
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    callback(file.mimetype === "application/pdf" ? null : new Error("Resume must be a PDF"), file.mimetype === "application/pdf");
  }
});

const router = Router();
router.post("/auth/login", login);
router.get("/portfolio", getPortfolio);
router.put("/portfolio", requireAuth, updatePortfolio);
router.post("/messages", createMessage);
router.get("/messages", requireAuth, listMessages);
router.patch("/messages/:id/read", requireAuth, markMessageRead);
router.get("/resume/download", downloadResume);
router.post("/admin/media/upload", requireAuth, upload.single("file"), uploadMedia);
router.delete("/admin/media/:id", requireAuth, deleteMedia);
router.post("/admin/resume/upload", requireAuth, resumeUpload.single("file"), uploadResume);
router.get("/admin/dashboard", requireAuth, async (req, res) => {
  const [portfolio, messages] = await Promise.all([
    Portfolio.findOne().lean(),
    Message.find().sort({ createdAt: -1 }).lean()
  ]);
  const skills = portfolio?.skills || [];
  const projects = portfolio?.projects || [];
  res.json({
    stats: {
      projects: projects.length,
      publishedProjects: projects.filter((item) => item.published !== false).length,
      skills: skills.length,
      certificates: portfolio?.certificates?.length || 0,
      messages: messages.length,
      unreadMessages: messages.filter((item) => !item.read).length
    },
    overview: {
      status: "Live",
      lastUpdated: portfolio?.updatedAt || portfolio?.createdAt || null,
      publishedSections: Object.keys(portfolio?.settings?.sections || { profile: true, skills: true, projects: true }).length,
      mediaFiles: portfolio?.media?.length || 0,
      resumeAvailable: Boolean(portfolio?.resumeUrl)
    },
    recentMessages: messages.slice(0, 5)
  });
});
export default router;
