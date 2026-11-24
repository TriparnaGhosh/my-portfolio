import { motion } from "framer-motion";

export default function SkillCard({ skill, index }) {
  const ConceptIcon = skill.icon;

  return (
    <motion.article
      className={`skill-card skill-tone-${index % 4}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.025 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: (index % 5) * 0.045, duration: 0.35 }}
    >
      <div className="skill-card-logo" aria-hidden="true">
        {skill.icons?.map((icon) => (
          <svg key={icon.slug} viewBox="0 0 24 24" style={{ color: `#${icon.hex}` }}>
            <path fill="currentColor" d={icon.path}/>
          </svg>
        ))}
        {skill.image && <img src={skill.image} alt="" loading="lazy"/>}
        {ConceptIcon && <ConceptIcon size={38} strokeWidth={1.8} aria-hidden="true"/>}
      </div>
      <span className="skill-card-name">{skill.name}</span>
    </motion.article>
  );
}
