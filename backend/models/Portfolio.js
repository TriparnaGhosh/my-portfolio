import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  profile: {
    name: { type: String, default: "Triparna Ghosh" },
    role: { type: String, default: "Full-stack developer" },
    tagline: { type: String, default: "I build thoughtful digital experiences." },
    bio: { type: String, default: "A developer who loves turning ideas into clean, useful products." },
    email: { type: String, default: "triparnaghosh87@gmail.com" },
    location: { type: String, default: "India" },
    avatar: { type: String, default: "/images/me.jpg" },
    phone: String,
    education: String,
    interests: [String],
    aboutImage: String
  },
  hero: {
    eyebrow: { type: String, default: "Available for new opportunities" },
    heading: { type: String, default: "Building digital experiences with care." },
    description: String,
    animatedTitles: [String],
    availability: { type: Boolean, default: true },
    locationLabel: String,
    primaryLabel: { type: String, default: "See my work" },
    primaryLink: { type: String, default: "#work" },
    secondaryLabel: { type: String, default: "Get in touch" },
    secondaryLink: { type: String, default: "#contact" },
    backgroundImage: String
  },
  about: {
    heading: String,
    introduction: String,
    description: String,
    currentFocus: String,
    stats: [{ label: String, value: String }]
  },
  skills: [{ name: String, category: String, level: Number, icon: String }],
  projects: [{
    title: String, description: String, image: String, url: String, github: String,
    tags: [String], category: String, slug: String, details: String,
    published: { type: Boolean, default: true }, featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  certificates: [{
    title: { type: String, required: true }, issuer: String, issueDate: String,
    credentialId: String, credentialUrl: String, fileUrl: String,
    published: { type: Boolean, default: true }, order: { type: Number, default: 0 }
  }],
  experience: [{
    title: String, organization: String, type: { type: String, enum: ["experience", "education", "achievement"], default: "experience" },
    startDate: String, endDate: String, current: Boolean, description: String, location: String,
    link: String, published: { type: Boolean, default: true }, order: { type: Number, default: 0 }
  }],
  socials: { github: String, linkedin: String, instagram: String, twitter: String },
  media: [{ name: String, url: String, type: String, size: Number, publicId: String }],
  resumeUrl: String,
  resumeName: String,
  settings: {
    siteName: { type: String, default: "Triparna Ghosh" },
    siteDescription: String,
    accentColor: { type: String, default: "#A78BFA" },
    maintenanceMode: { type: Boolean, default: false },
    sections: { type: Map, of: Boolean, default: { profile: true, skills: true, projects: true, contact: true } }
  },
  seo: {
    title: String, description: String, keywords: [String],
    ogTitle: String, ogDescription: String, ogImage: String, canonicalUrl: String, noIndex: Boolean
  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);
