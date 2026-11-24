import { Router } from "express";
import { login } from "../controllers/auth.js";
import { getPortfolio, updatePortfolio } from "../controllers/portfolio.js";
import { createMessage, deleteMessage, listMessages, markMessageRead } from "../controllers/messages.js";
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
    if (allowed.includes(file.mimetype)) return callback(null, true);
    const error = new Error("Unsupported file type");
    error.status = 400;
    callback(error);
  }
});
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (file.mimetype === "application/pdf") return callback(null, true);
    const error = new Error("Resume must be a PDF");
    error.status = 400;
    callback(error);
  }
});

const router = Router();
const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.post("/auth/login", asyncHandler(login));
router.get("/portfolio", asyncHandler(getPortfolio));
router.put("/portfolio", requireAuth, asyncHandler(updatePortfolio));
router.post("/messages", asyncHandler(createMessage));
router.get("/messages", requireAuth, asyncHandler(listMessages));
router.patch("/messages/:id/read", requireAuth, asyncHandler(markMessageRead));
router.delete("/messages/:id", requireAuth, asyncHandler(deleteMessage));
router.get("/resume/download", asyncHandler(downloadResume));
router.post("/admin/media/upload", requireAuth, upload.single("file"), asyncHandler(uploadMedia));
router.delete("/admin/media/:id", requireAuth, asyncHandler(deleteMedia));
router.post("/admin/resume/upload", requireAuth, resumeUpload.single("file"), asyncHandler(uploadResume));
router.get("/admin/dashboard", requireAuth, asyncHandler(async (req, res) => {
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
}));
export default router;
