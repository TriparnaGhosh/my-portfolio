import Portfolio from "../models/Portfolio.js";

const editableFields = [
  "profile", "hero", "about", "skills", "projects", "certificates",
  "experience", "socials", "settings", "seo"
];

export async function getPortfolio(req, res) {
  const portfolio = await Portfolio.findOne().lean();
  res.json(portfolio || {});
}

export async function updatePortfolio(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Portfolio data must be an object" });
  }
  const changes = Object.fromEntries(
    editableFields.filter(field => Object.hasOwn(req.body, field)).map(field => [field, req.body[field]])
  );
  const updated = await Portfolio.findOneAndUpdate({}, {
    $set: { ...changes, updatedAt: new Date() }
  }, {
    new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true
  });
  res.json(updated);
}
