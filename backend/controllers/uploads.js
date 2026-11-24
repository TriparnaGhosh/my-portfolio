import { v2 as cloudinary } from "cloudinary";
import Portfolio from "../models/Portfolio.js";

function configureCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary is not configured");
    error.status = 503;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function uploadMedia(req, res) {
  configureCloudinary();
  if (!req.file) return res.status(400).json({ message: "Choose a file to upload" });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: "Only JPG, PNG, WebP, GIF, and PDF files are allowed" });
  }

  const isPdf = req.file.mimetype === "application/pdf";
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio",
        resource_type: isPdf ? "raw" : "image",
        access_mode: "public"
      },
      (error, upload) => error ? reject(error) : resolve(upload)
    );
    stream.end(req.file.buffer);
  });

  const asset = {
    name: req.file.originalname,
    url: result.secure_url,
    type: isPdf ? "application/pdf" : req.file.mimetype,
    size: req.file.size,
    publicId: result.public_id
  };
  const portfolio = await Portfolio.findOne();
  if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
  portfolio.media = [...(portfolio.media || []), asset];
  await portfolio.save();
  res.status(201).json(asset);
}

export async function uploadResume(req, res) {
  configureCloudinary();
  if (!req.file) return res.status(400).json({ message: "Choose a PDF resume to upload" });
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Resume must be a PDF file" });
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "portfolio/resumes", resource_type: "raw", access_mode: "public" },
      (error, upload) => error ? reject(error) : resolve(upload)
    );
    stream.end(req.file.buffer);
  });

  const portfolio = await Portfolio.findOne();
  if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
  portfolio.resumeUrl = result.secure_url;
  portfolio.resumeName = req.file.originalname;
  await portfolio.save();
  res.status(201).json({ url: result.secure_url, name: req.file.originalname });
}

export async function downloadResume(req, res) {
  const portfolio = await Portfolio.findOne().lean();
  if (!portfolio?.resumeUrl) return res.status(404).json({ message: "No active resume found" });

  const upstream = await fetch(portfolio.resumeUrl);
  if (!upstream.ok) return res.status(502).json({ message: "Could not retrieve resume" });

  const rawName = String(portfolio.resumeName || "Triparna-Ghosh-Resume.pdf").replace(/[\r\n"]/g, "");
  const filename = /\.pdf$/i.test(rawName) ? rawName : `${rawName}.pdf`;
  const safeName = filename.replace(/[^\w.\- ]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  const bytes = Buffer.from(await upstream.arrayBuffer());
  res.setHeader("Content-Length", bytes.length);
  res.send(bytes);
}

export async function deleteMedia(req, res) {
  configureCloudinary();
  const portfolio = await Portfolio.findOne();
  if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
  const asset = (portfolio.media || []).find(item => String(item._id) === req.params.id);
  if (!asset) return res.status(404).json({ message: "Media asset not found" });

  if (JSON.stringify(portfolio).includes(asset.url)) {
    return res.status(409).json({ message: "Remove or replace this asset from portfolio content before deleting it" });
  }

  await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: asset.type === "application/pdf" ? "raw" : "image",
    invalidate: true
  });
  portfolio.media = (portfolio.media || []).filter(item => String(item._id) !== req.params.id);
  await portfolio.save();
  res.json({ message: "Media deleted" });
}
