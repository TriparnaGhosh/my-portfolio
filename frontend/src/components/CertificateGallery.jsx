import { useEffect, useState } from "react";
import { ArrowUpRight, Award, CalendarDays, Download, X } from "lucide-react";
import { motion } from "framer-motion";

function isPdf(certificate) {
  return certificate.type === "application/pdf" || /\.pdf(?:[?#]|$)/i.test(certificate.fileUrl);
}

function CertificatePreview({ certificate, large = false }) {
  const pdf = isPdf(certificate);
  if (pdf) {
    const toolbar = large ? "toolbar=1" : "toolbar=0";
    return (
      <iframe
        src={`${certificate.fileUrl}#page=1&${toolbar}&navpanes=0`}
        title={`${certificate.title} preview`}
        loading="lazy"
      />
    );
  }
  return <img src={certificate.fileUrl} alt={certificate.title} loading={large ? "eager" : "lazy"}/>;
}

export default function CertificateGallery({ certificates, achievements }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = event => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  return (
    <section className="certificate-section" id="certificates">
      <div className="certificate-canvas">
        <div className="certificate-gallery">
          {certificates.length ? certificates.map((certificate, index) => (
            <motion.article
              className="certificate-card"
              key={certificate._id || certificate.fileUrl}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: (index % 6) * 0.07, duration: 0.45 }}
            >
              <div className="certificate-frame">
                <div className="certificate-preview">
                  <CertificatePreview certificate={certificate}/>
                  <button
                    className="certificate-open"
                    type="button"
                    onClick={() => setSelected(certificate)}
                    aria-label={`View ${certificate.title}`}
                  >
                    View certificate <ArrowUpRight size={16}/>
                  </button>
                </div>
                <div className="certificate-caption">
                  <h3>{certificate.title}</h3>
                  {certificate.issuer && <p>{certificate.issuer}</p>}
                  {certificate.issueDate && <time><CalendarDays size={13}/>{certificate.issueDate}</time>}
                </div>
              </div>
            </motion.article>
          )) : (
            <div className="certificate-empty">No published certificates are available yet.</div>
          )}
        </div>

        <footer className="certificate-heading">
          <div>
            <h2>CERTIFICATES</h2>
            <p>LEARNING <span>•</span> BUILDING <span>•</span> GROWING</p>
          </div>
          <Award className="certificate-mark" size={38} strokeWidth={1.2}/>
        </footer>
      </div>

      {achievements.length > 0 && (
        <div className="achievement-shelf">
          <p className="certificate-kicker">Beyond the certificates</p>
          <h2>Achievements</h2>
          <div className="achievement-list">
            {achievements.map((achievement, index) => (
              <article key={achievement._id || `${achievement.title}-${index}`}>
                <div>
                  <h3>{achievement.title}</h3>
                  {achievement.organization && <p>{achievement.organization}</p>}
                </div>
                {achievement.startDate && <time>{achievement.startDate}</time>}
                {achievement.description && <span>{achievement.description}</span>}
              </article>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="certificate-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section className="certificate-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title">
            <header>
              <div>
                <p className="certificate-kicker">Certificate preview</p>
                <h2 id="certificate-modal-title">{selected.title}</h2>
                {(selected.issuer || selected.issueDate) && (
                  <p className="certificate-modal-details">
                    {[selected.issuer, selected.issueDate].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <button type="button" className="certificate-close" onClick={() => setSelected(null)} aria-label="Close preview">
                <X size={20}/>
              </button>
            </header>
            <div className={`certificate-modal-preview ${isPdf(selected) ? "pdf" : ""}`}>
              <CertificatePreview certificate={selected} large/>
            </div>
            <div className="certificate-modal-actions">
              <a href={selected.fileUrl} target="_blank" rel="noreferrer">Open original <ArrowUpRight size={15}/></a>
              <a href={selected.fileUrl} download>Download <Download size={15}/></a>
              {selected.credentialUrl && <a href={selected.credentialUrl} target="_blank" rel="noreferrer">Verify credential <ArrowUpRight size={15}/></a>}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
