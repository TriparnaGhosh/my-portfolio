import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";

await connectDatabase();
const email = process.env.ADMIN_EMAIL || "triparna@example.com";
const password = process.env.ADMIN_PASSWORD || "change-me-before-deploying";
await User.findOneAndUpdate({ email }, { email, password: await bcrypt.hash(password, 12) }, { upsert: true });
await Portfolio.findOneAndUpdate({}, {
  profile: { name: "Triparna Ghosh", role: "Full-stack developer", tagline: "Ideas, designed and shipped.", bio: "I create accessible, high-performing web experiences with a thoughtful eye for detail.", email: "triparnaghosh87@gmail.com", location: "India", avatar: "/images/me.jpg" },
  skills: [{ name: "HTML & CSS", category: "Frontend", level: 90 }, { name: "JavaScript", category: "Frontend", level: 78 }, { name: "React", category: "Frontend", level: 72 }, { name: "Java", category: "Backend", level: 65 }],
  projects: [{ title: "TinDog", description: "A playful, responsive landing page for a dog dating app.", image: "/images/me.jpg", tags: ["HTML", "CSS"], featured: true }, { title: "Portfolio website", description: "A personal space for selected work, skills, and ideas.", image: "/images/css.jpg", tags: ["HTML", "CSS"], featured: true }],
  socials: { github: "https://github.com", linkedin: "https://linkedin.com/in/triparnaghosh", instagram: "https://instagram.com" }
}, { upsert: true, new: true });
console.log(`Admin seeded: ${email}`);
process.exit(0);
