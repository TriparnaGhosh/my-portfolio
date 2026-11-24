import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import SkillCard from "../components/SkillCard";
import CertificateGallery from "../components/CertificateGallery";
import Navbar from "../components/Navbar";
import { skillGroups } from "../data/skills";
import certificateAssets from "virtual:portfolio-certificates";

const fallback = {
  profile: { name: "Triparna Ghosh", role: "Full-stack developer", tagline: "Ideas, designed and shipped.", bio: "I create accessible, high-performing web experiences with a thoughtful eye for detail.", email: "triparnaghosh87@gmail.com", location: "India", avatar: "/images/me.jpg" },
  skills: [{ name: "HTML & CSS", category: "Frontend", level: 90 }, { name: "JavaScript", category: "Frontend", level: 78 }, { name: "React", category: "Frontend", level: 72 }, { name: "Java", category: "Backend", level: 65 }],
  projects: [{ title: "TinDog", description: "A playful, responsive landing page for a dog dating app.", tags: ["HTML", "CSS"], image: "/images/me.jpg" }, { title: "Portfolio website", description: "A personal space for selected work, skills, and ideas.", tags: ["HTML", "CSS"], image: "/images/css.jpg" }],
  certificates: [],
  experience: [],
  socials: {}
};

function certificateFileName(url = "") {
  const fileName = String(url).split(/[?#]/)[0].split("/").pop() || "";
  return decodeURIComponent(fileName).toLowerCase();
}

function titleFromCertificateFile(fileName = "") {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^certificateofcompletion[_\s-]*/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export default function Home() {
  const [data, setData] = useState(fallback);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const processTrackRef = useRef(null);
  const skillsTrackRef = useRef(null);
  useEffect(() => { api.get("/portfolio").then(({ data }) => data.profile && setData({ ...fallback, ...data })).catch(() => {}); }, []);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let processOffset = window.innerWidth;
    let skillsOffset = -window.innerWidth;
    let direction = -1;
    let frame = null;

    const animateMarquee = () => {
      const processTrack = processTrackRef.current;
      const skillsTrack = skillsTrackRef.current;
      const speed = 0.65;

      if (processTrack) {
        const firstSpan = processTrack.querySelector("span");
        const spanWidth = firstSpan?.getBoundingClientRect().width || 1;
        processOffset += direction * speed;
        if (processOffset <= -spanWidth) processOffset += spanWidth;
        if (processOffset >= window.innerWidth) processOffset -= spanWidth;
        processTrack.style.transform = `translate3d(${processOffset}px, 0, 0)`;
      }

      if (skillsTrack) {
        const firstSpan = skillsTrack.querySelector("span");
        const spanWidth = firstSpan?.getBoundingClientRect().width || 1;
        skillsOffset -= direction * speed;
        if (skillsOffset <= -spanWidth) skillsOffset += spanWidth;
        if (skillsOffset >= window.innerWidth) skillsOffset -= spanWidth;
        skillsTrack.style.transform = `translate3d(${skillsOffset}px, 0, 0)`;
      }

      frame = window.requestAnimationFrame(animateMarquee);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (scrollDelta > 0) direction = -1;
      if (scrollDelta < 0) direction = 1;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    frame = window.requestAnimationFrame(animateMarquee);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  const { profile, skills, projects, socials, resumeUrl, resumeName } = data;
  const certificates = useMemo(() => {
    const saved = (data.certificates || []).filter(item => item.published !== false && item.fileUrl);
    const localNames = new Set(certificateAssets.map(asset => asset.name.toLowerCase()));
    const local = certificateAssets.map(asset => {
      const metadata = saved.find(item => certificateFileName(item.fileUrl) === asset.name.toLowerCase());
      return {
        ...asset,
        ...metadata,
        fileUrl: asset.url,
        title: metadata?.title || titleFromCertificateFile(asset.name)
      };
    });
    const uploaded = saved
      .filter(item => !localNames.has(certificateFileName(item.fileUrl)))
      .map(item => ({ ...item, title: item.title || titleFromCertificateFile(certificateFileName(item.fileUrl)) }));
    return [...local, ...uploaded].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
  }, [data.certificates]);
  const achievements = useMemo(
    () => (data.experience || [])
      .filter(item => item.type === "achievement" && item.published !== false)
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)),
    [data.experience]
  );
  const resumeDownloadUrl = `${api.defaults.baseURL}/resume/download`;
  async function submit(event) {
    event.preventDefault(); setStatus("Sending…");
    try { await api.post("/messages", form); setForm({ name: "", email: "", message: "" }); setStatus("Message sent — thank you!"); }
    catch (error) { setStatus(error.response?.data?.message || "Could not send message."); }
  }
  return <main>
    <Navbar email={profile.email} resumeUrl={resumeUrl && resumeDownloadUrl} resumeName={resumeName}/>
    <section className="hero" id="top"><motion.div className="hero-copy" initial={{ opacity: 0, x: -90 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 85, damping: 13, delay: 0.1 }}><p className="eyebrow"><Sparkles size={15}/> Available for new opportunities</p><h1>Hi, I’m<br/><em>Triparna</em> 👋</h1><p className="hero-text">A passionate developer who loves turning creative ideas into beautiful, interactive, and meaningful digital experiences.</p><div className="hero-actions"><a className="button primary" href="#work">See my work <ArrowUpRight size={17}/></a>{resumeUrl ? <a className="button resume-button" href={resumeDownloadUrl} download={resumeName || "Triparna-Ghosh-Resume.pdf"}>Download resume <Download size={17}/></a> : <a className="text-link" href="#contact">Get in touch</a>}</div></motion.div><motion.div className="hero-art" initial={{ opacity: 0, x: 110, rotate: 5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 75, damping: 12, delay: 0.2 }}><div className="orb"/><div className="portrait-frame"><img src="/images/miii-cutout.png" alt={profile.name}/></div></motion.div></section>
    <section className="cross-straps" aria-label="Process and skills">
      <div className="marquee marquee-process" aria-label="Design, develop, deliver">
        <div className="marquee-track" ref={processTrackRef}>
          <span>Design <b>·</b> Develop <b>·</b> Deliver <b>·</b></span>
          <span aria-hidden="true">Design <b>·</b> Develop <b>·</b> Deliver <b>·</b></span>
          <span aria-hidden="true">Design <b>·</b> Develop <b>·</b> Deliver <b>·</b></span>
        </div>
      </div>
      <div className="marquee marquee-skills" aria-label="Skills">
        <div className="marquee-track" ref={skillsTrackRef}>
          {Array.from({ length: 3 }).map((_, copyIndex) => (
            <span key={copyIndex} aria-hidden={copyIndex > 0}>
              {skills.map((skill, index) => (
                <span className="skill-chip" key={`${copyIndex}-${skill.name}`}>
                  {skill.name}{index < skills.length - 1 && <b>·</b>}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
    <section className="section" id="work">
      <div className="section-heading">
        <p className="eyebrow">Selected work</p>
        <h2>From Concept<br/><em>to Creation</em></h2>
      </div>
      <div className="projects">
        {projects.map((project, index) => (
          <motion.article
            className="project-card"
            key={project.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -36 : 36, y: 24 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 90, damping: 18 }}
          >
            <div className="project-polaroid">
              <div className="project-image">
                <img src={project.image} alt={project.title} loading="lazy"/>
              </div>
              <h3 className="polaroid-title">{project.title}</h3>
              <span className="project-number">0{index + 1}</span>
            </div>
            <div className="project-meta">
              <div>
                <p>{project.description}</p>
                <div className="tags">{project.tags?.map(tag => <span key={tag}>{tag}</span>)}</div>
              </div>
              <a href={project.url || "#"} aria-label={`View ${project.title}`}><ArrowUpRight/></a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
    <CertificateGallery certificates={certificates} achievements={achievements}/>
    <section className="section about-grid" id="about">
      <div className="section-heading">
        <p className="eyebrow">About me</p>
        <h2>My Tech<br/><em>Arsenal</em></h2>
        <p className="muted tech-intro">A collection of technologies and tools I use to build, experiment, and bring creative ideas to life through code.</p>
      </div>
      <div className="skill-list" id="skills">
        <h3 className="skills-heading">Skills</h3>
        <div className="skill-groups">
          {skillGroups.map((group, groupIndex) => {
            const indexOffset = skillGroups.slice(0, groupIndex).reduce((total, item) => total + item.skills.length, 0);
            return (
              <div className="skill-group" key={group.category}>
                <h4 className="skill-group-title">{group.category}</h4>
                <div className="skill-grid">
                  {group.skills.map((skill, skillIndex) => (
                    <SkillCard key={skill.name} skill={skill} index={indexOffset + skillIndex}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    <section className="contact-section" id="contact"><p className="eyebrow">Say hello</p><h2>Have a good idea?<br/><em>Let’s talk.</em></h2><form onSubmit={submit}><input required placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/><input required type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/><textarea required placeholder="Tell me a little about it…" rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})}/><button className="button primary" type="submit">Send message <ArrowUpRight size={17}/></button><small>{status}</small></form></section>
    <footer><span>© {new Date().getFullYear()} {profile.name}</span><div className="socials">{socials.linkedin && <a href={socials.linkedin}><Linkedin size={18}/></a>}{socials.github && <a href={socials.github}><Github size={18}/></a>}<a href={`mailto:${profile.email}`}><Mail size={18}/></a></div></footer>
  </main>;
}
