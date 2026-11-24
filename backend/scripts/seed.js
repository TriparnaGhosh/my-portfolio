import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";

const starterSkills = [
  { name: "HTML", category: "Frontend Development", icon: "html5" },
  { name: "CSS", category: "Frontend Development", icon: "css3" },
  { name: "JavaScript", category: "Frontend Development", icon: "javascript" },
  { name: "React JS", category: "Frontend Development", icon: "react" },
  { name: "Node.js", category: "Backend Development", icon: "nodejs" },
  { name: "Express.js", category: "Backend Development", icon: "express" },
  { name: "MongoDB", category: "Backend Development", icon: "mongodb" },
  { name: "MySQL", category: "Backend Development", icon: "mysql" },
  { name: "Python", category: "Programming & Data Science", icon: "python" },
  { name: "Pandas", category: "Programming & Data Science", icon: "pandas" },
  { name: "NumPy", category: "Programming & Data Science", icon: "numpy" },
  { name: "Matplotlib", category: "Programming & Data Science", icon: "matplotlib" },
  { name: "ANN (Artificial Neural Networks)", category: "Artificial Intelligence & Machine Learning", icon: "neuralnetwork" },
  { name: "Git & GitHub", category: "Tools & Version Control", icon: "git-github" }
];
const starterCertificates = [
  { title: "AI-Fluency", fileUrl: "/certificates/ai-fluency_certificate.pdf", published: true, order: 0 },
  { title: "Generative AI", fileUrl: "/certificates/CertificateOfCompletion_What Is Generative AI.pdf", published: true, order: 1 },
  { title: "Elements of AI", fileUrl: "/certificates/elements-of-ai_certificate.png", published: true, order: 2 },
  { title: "Prime AI/ML", fileUrl: "/certificates/prime-ai:ml_certificate.pdf", published: true, order: 3 },
  { title: "Web Development", fileUrl: "/certificates/web-development_certificate.pdf", published: true, order: 4 }
];

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured before seeding");
}
if (password.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters");
}
await connectDatabase();
await User.findOneAndUpdate({ email }, { email, password: await bcrypt.hash(password, 12) }, { upsert: true });
await Portfolio.updateOne({}, { $setOnInsert: {
  profile: { name: "Triparna Ghosh", role: "Full-stack developer", tagline: "Ideas, designed and shipped.", bio: "I create accessible, high-performing web experiences with a thoughtful eye for detail.", email: "triparnaghosh87@gmail.com", location: "India", avatar: "/images/me.jpg" },
  skills: starterSkills,
  projects: [{ title: "TinDog", description: "A playful, responsive landing page for a dog dating app.", image: "/images/me.jpg", tags: ["HTML", "CSS"], featured: true }, { title: "Portfolio website", description: "A personal space for selected work, skills, and ideas.", image: "/images/css.jpg", tags: ["HTML", "CSS"], featured: true }],
  certificates: starterCertificates,
  socials: { github: "https://github.com", linkedin: "https://linkedin.com/in/triparnaghosh", instagram: "https://instagram.com" },
  dataVersion: 1
} }, { upsert: true, setDefaultsOnInsert: true });
const portfolio = await Portfolio.findOne();
if ((portfolio.dataVersion || 0) < 1) {
  const legacyStarterSkills = [
    { name: "HTML & CSS", category: "Frontend", level: 90 },
    { name: "JavaScript", category: "Frontend", level: 78 },
    { name: "React", category: "Frontend", level: 72 },
    { name: "Java", category: "Backend", level: 65 }
  ];
  const hasLegacyStarterSkills = portfolio.skills.length === legacyStarterSkills.length
    && legacyStarterSkills.every((skill, index) => (
      portfolio.skills[index].name === skill.name
      && portfolio.skills[index].category === skill.category
      && portfolio.skills[index].level === skill.level
    ));
  if (hasLegacyStarterSkills) portfolio.skills = starterSkills;
  if (portfolio.certificates.length === 0) portfolio.certificates = starterCertificates;
  portfolio.dataVersion = 1;
  await portfolio.save();
}
console.log(`Admin seeded: ${email}`);
process.exit(0);
