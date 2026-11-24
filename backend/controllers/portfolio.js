import Portfolio from "../models/Portfolio.js";

export async function getPortfolio(req, res) {
  const portfolio = await Portfolio.findOne().lean();
  res.json(portfolio || {});
}

export async function updatePortfolio(req, res) {
  const updated = await Portfolio.findOneAndUpdate({}, { ...req.body, updatedAt: new Date() }, {
    new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true
  });
  res.json(updated);
}
