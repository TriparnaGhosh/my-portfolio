import Message from "../models/Message.js";

export async function createMessage(req, res) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "Name, email, and message are required" });
  const saved = await Message.create({ name, email, message });
  res.status(201).json({ message: "Thanks — your message has been received.", id: saved.id });
}

export async function listMessages(req, res) {
  res.json(await Message.find().sort({ createdAt: -1 }).lean());
}

export async function markMessageRead(req, res) {
  const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.json(message);
}
