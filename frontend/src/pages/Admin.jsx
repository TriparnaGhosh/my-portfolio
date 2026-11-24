import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Archive, ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, Check,
  ChevronDown, CircleUserRound, FileText, FolderKanban, Globe2, GraduationCap,
  Image, LayoutDashboard, LogOut, Mail, Menu, Pencil, Plus, Search, Settings,
  ShieldCheck, Sparkles, Trash2, Upload, UserRound, X, Zap
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { skillIconNames } from "../data/skills";

const emptyPortfolio = {
  profile: {}, hero: {}, about: {}, skills: [], projects: [], certificates: [],
  experience: [], socials: {}, settings: {}, seo: {}, media: []
};

const navGroups = [
  { label: "Overview", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Website content", items: [
    { id: "profile", label: "Profile", icon: UserRound }, { id: "hero", label: "Hero section", icon: Sparkles },
    { id: "about", label: "About me", icon: CircleUserRound }, { id: "skills", label: "Skills", icon: Zap },
    { id: "projects", label: "Projects", icon: FolderKanban }, { id: "certificates", label: "Certificates", icon: ShieldCheck },
    { id: "experience", label: "Experience & education", icon: GraduationCap }
  ] },
  { label: "Communication", items: [{ id: "messages", label: "Messages", icon: Mail }, { id: "socials", label: "Social links", icon: Globe2 }] },
  { label: "Configuration", items: [{ id: "media", label: "Media library", icon: Image }, { id: "resume", label: "Resume manager", icon: FileText }, { id: "settings", label: "Website settings", icon: Settings }, { id: "seo", label: "SEO settings", icon: BarChart3 }] }
];

const titles = Object.fromEntries(navGroups.flatMap(group => group.items.map(item => [item.id, item.label])));

function Field({ label, value, onChange, multiline = false, type = "text", placeholder, required = false, disabled = false, options }) {
  const Control = multiline ? "textarea" : "input";
  return <label className="cms-field"><span>{label}</span>{options ? <select value={value ?? ""} required={required} disabled={disabled} onChange={event => onChange(event.target.value)}><option value="">Choose one</option>{options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select> : <Control type={type} value={value ?? ""} placeholder={placeholder} required={required} disabled={disabled} onChange={event => onChange(event.target.value)} />}</label>;
}

function EmptyState({ title, text, action, onAction }) {
  return <div className="cms-empty"><div className="empty-icon"><FolderKanban size={20} /></div><strong>{title}</strong><p>{text}</p>{action && <button className="cms-button primary" onClick={onAction}><Plus size={16} /> {action}</button>}</div>;
}

function Modal({ title, children, onClose }) {
  return <div className="cms-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="cms-modal"><div className="modal-heading"><div><p className="cms-kicker">Content editor</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>{children}</div></div>;
}

export default function Admin() {
  const { user, signIn, signOut } = useAuth();
  const [credentials, setCredentials] = useState({ password: "" });
  const [portfolio, setPortfolio] = useState(null);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const savingRef = useRef(false);
  const searchResults = useMemo(() => {
    if (!search.trim() || !portfolio) return [];
    const query = search.toLowerCase();
    const sources = [
      ["projects", portfolio.projects, item => item.title],
      ["skills", portfolio.skills, item => item.name],
      ["certificates", portfolio.certificates, item => item.title],
      ["experience", portfolio.experience, item => item.title],
      ["messages", messages, item => `${item.name} ${item.email} ${item.message}`],
      ["media", portfolio.media, item => item.name]
    ];
    return sources.flatMap(([section, items, label]) => items.filter(item => String(label(item) || "").toLowerCase().includes(query)).slice(0, 3).map(item => ({ section, label: label(item) }))).slice(0, 8);
  }, [messages, portfolio, search]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadWorkspace() {
      setError("");
      const [portfolioResult, messagesResult] = await Promise.allSettled([
        api.get("/portfolio"),
        api.get("/messages")
      ]);
      if (cancelled) return;

      if (portfolioResult.status === "fulfilled") {
        setPortfolio({
          ...emptyPortfolio,
          ...portfolioResult.value.data,
          profile: { ...emptyPortfolio.profile, ...portfolioResult.value.data?.profile },
          hero: { ...emptyPortfolio.hero, ...portfolioResult.value.data?.hero },
          about: { ...emptyPortfolio.about, ...portfolioResult.value.data?.about },
          settings: { ...emptyPortfolio.settings, ...portfolioResult.value.data?.settings },
          seo: { ...emptyPortfolio.seo, ...portfolioResult.value.data?.seo },
          socials: { ...emptyPortfolio.socials, ...portfolioResult.value.data?.socials }
        });
      } else {
        setPortfolio(null);
      }

      if (messagesResult.status === "fulfilled") {
        setMessages(messagesResult.value.data || []);
      } else {
        setMessages([]);
      }

      const failedResult = portfolioResult.status === "rejected"
        ? portfolioResult
        : messagesResult.status === "rejected"
          ? messagesResult
          : null;
      if (failedResult) {
        const status = failedResult.reason?.response?.status;
        const message = failedResult.reason?.response?.data?.message;
        if (status === 401) {
          signOut();
          setError("Your session expired. Please sign in again.");
        } else {
          setError(message || "Some workspace data could not be loaded.");
        }
      }
    }

    loadWorkspace();
    return () => { cancelled = true; };
  }, [user, loadAttempt]);

  if (!user) return <Login credentials={credentials} setCredentials={setCredentials} signIn={signIn} error={error} setError={setError} />;
  if (!portfolio) return <div className="cms-loading">{error ? <><p className="form-error">{error}</p><button className="cms-button primary" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Retry loading workspace</button><button className="cms-button secondary" onClick={signOut}>Sign out</button></> : <><div className="loading-mark">TG</div><p>Loading your workspace…</p></>}</div>;

  async function save(nextPortfolio = portfolio, message = "Changes saved") {
    if (savingRef.current) {
      setError("A save is already in progress. Please wait.");
      return false;
    }
    savingRef.current = true;
    try {
      const { data } = await api.put("/portfolio", nextPortfolio);
      setPortfolio({ ...emptyPortfolio, ...data }); setNotice(message); setError("");
      window.setTimeout(() => setNotice(""), 3000);
      return true;
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not save changes.");
      return false;
    } finally {
      savingRef.current = false;
    }
  }
  function update(key, value) { setPortfolio(current => ({ ...current, [key]: value })); }

  return <div className="cms-shell">
    <aside className={`cms-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="cms-brand"><div className="brand-mark">TG</div><div><strong>Portfolio CMS</strong><small>ADMIN PANEL</small></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <button className={active === item.id ? "active" : ""} key={item.id} onClick={() => { setActive(item.id); setSidebarOpen(false); }}><Icon size={17} /><span>{item.label}</span>{item.id === "messages" && messages.some(message => !message.read) && <b className="nav-count">{messages.filter(message => !message.read).length}</b>}</button>; })}</div>)}</nav>
      <div className="sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={16} /> View live website</a><button onClick={signOut}><LogOut size={16} /> Sign out</button></div>
    </aside>
    <main className="cms-main">
      <header className="cms-topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><i>/</i><strong>{titles[active]}</strong></div><div className="top-actions"><div className="global-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search content…" /></div><button className="top-icon"><Bell size={18} />{messages.some(message => !message.read) && <i />}</button><a className="view-button" href="/" target="_blank" rel="noreferrer">View site <ArrowUpRight size={15} /></a><div className="user-pill"><div className="avatar">TG</div><span>{user.email}</span><ChevronDown size={14} /></div></div></header>
      {searchResults.length > 0 && <div className="global-results">{searchResults.map((result, index) => <button key={`${result.section}-${index}`} onClick={() => { setActive(result.section); setSearch(""); }}><Search size={14} /><span>{result.label}</span><small>{titles[result.section]}</small></button>)}</div>}
      <div className="cms-content">{notice && <div className="cms-toast"><Check size={16} /> {notice}</div>}{error && <div className="cms-error">{error}<button onClick={() => setError("")}><X size={14} /></button></div>}
        {active === "dashboard" && <Dashboard portfolio={portfolio} messages={messages} setActive={setActive} />}
        {active === "profile" && <Profile portfolio={portfolio} update={update} save={save} />}
        {active === "hero" && <Hero portfolio={portfolio} update={update} save={save} />}
        {active === "about" && <About portfolio={portfolio} update={update} save={save} />}
        {active === "skills" && <CollectionEditor title="Skills" subtitle="Keep your toolkit current and easy to scan." field="skills" portfolio={portfolio} save={save} kind="skill" />}
        {active === "projects" && <CollectionEditor title="Projects" subtitle="Curate the work you want visitors to remember." field="projects" portfolio={portfolio} save={save} kind="project" />}
        {active === "certificates" && <CollectionEditor title="Certificates" subtitle="Manage credentials and supporting proof points." field="certificates" portfolio={portfolio} save={save} kind="certificate" />}
        {active === "experience" && <CollectionEditor title="Experience & education" subtitle="Tell the story behind your craft." field="experience" portfolio={portfolio} save={save} kind="experience" />}
        {active === "messages" && <Messages messages={messages} setMessages={setMessages} setError={setError} setNotice={setNotice} />}
        {active === "socials" && <Socials portfolio={portfolio} update={update} save={save} />}
        {active === "media" && <Media portfolio={portfolio} update={update} save={save} setNotice={setNotice} />}
        {active === "resume" && <Resume portfolio={portfolio} update={update} save={save} setNotice={setNotice} />}
        {active === "settings" && <SettingsPage portfolio={portfolio} update={update} save={save} />}
        {active === "seo" && <Seo portfolio={portfolio} update={update} save={save} />}
      </div>
    </main>
  </div>;
}

function Login({ credentials, setCredentials, signIn, error, setError }) {
  return <div className="cms-login"><div className="login-card"><div className="brand-mark">TG</div><p className="cms-kicker">Private workspace</p><h1>Welcome back.</h1><p className="login-copy">Sign in to manage every detail of your portfolio.</p><form onSubmit={async event => { event.preventDefault(); setError(""); try { await signIn(credentials.password); } catch (loginError) { setError(loginError.response?.data?.message || "Sign in failed."); } }}><Field label="Password" type="password" value={credentials.password} required onChange={value => setCredentials({ ...credentials, password: value })} /><button type="submit" className="cms-button primary full">Sign in <ArrowUpRight size={16} /></button>{error && <p className="form-error">{error}</p>}</form></div></div>;
}

function PageIntro({ eyebrow, title, subtitle, action, onAction }) {
  return <div className="page-intro"><div><p className="cms-kicker">{eyebrow || "Content management"}</p><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="cms-button primary" onClick={onAction}><Plus size={16} /> {action}</button>}</div>;
}

function Dashboard({ portfolio, messages, setActive }) {
  const unread = messages.filter(message => !message.read).length;
  const stats = [{ label: "Total projects", value: portfolio.projects.length, detail: "Across your portfolio", icon: FolderKanban }, { label: "Published projects", value: portfolio.projects.filter(project => project.published !== false).length, detail: "Visible on your site", icon: Globe2 }, { label: "Skills", value: portfolio.skills.length, detail: "In your toolkit", icon: Zap }, { label: "Certificates", value: portfolio.certificates.length, detail: "Credentials collected", icon: ShieldCheck }, { label: "Total messages", value: messages.length, detail: "People got in touch", icon: Mail }, { label: "Unread messages", value: unread, detail: unread ? "Needs your attention" : "Inbox is clear", icon: Bell }];
  return <><PageIntro eyebrow="Overview" title="Welcome back, Triparna." subtitle="Here's what's happening with your portfolio today." /><div className="stats-grid">{stats.map(stat => { const Icon = stat.icon; return <div className="stat-card" key={stat.label}><div className="stat-top"><span>{stat.label}</span><Icon size={18} /></div><strong>{stat.value}</strong><small>{stat.detail}</small></div>; })}</div><div className="dashboard-grid"><section className="cms-card status-card"><div className="card-title"><div><p className="cms-kicker">Website overview</p><h2>Everything is live.</h2></div><span className="status-dot"><i /> Live</span></div><div className="status-details"><div><span>Last updated</span><strong>{portfolio.updatedAt ? new Date(portfolio.updatedAt).toLocaleDateString() : "Not yet"}</strong></div><div><span>Content collections</span><strong>{portfolio.skills.length + portfolio.projects.length + portfolio.certificates.length}</strong></div><div><span>Resume</span><strong>{portfolio.resumeUrl ? "Available" : "Not uploaded"}</strong></div></div><a className="cms-button secondary" href="/" target="_blank" rel="noreferrer">Visit live website <ArrowUpRight size={15} /></a></section><section className="cms-card quick-card"><div className="card-title"><div><p className="cms-kicker">Quick actions</p><h2>Make an update.</h2></div><Zap size={19} /></div><div className="quick-actions">{[["projects", "Add new project", FolderKanban], ["skills", "Add a skill", Zap], ["certificates", "Upload certificate", ShieldCheck], ["profile", "Edit profile", UserRound]].map(([id, label, Icon]) => <button key={id} onClick={() => setActive(id)}><Icon size={17} />{label}<ArrowUpRight size={14} /></button>)}</div></section></div><section className="cms-card recent-card"><div className="card-title"><div><p className="cms-kicker">Inbox</p><h2>Recent messages</h2></div><button className="text-button" onClick={() => setActive("messages")}>View all <ArrowUpRight size={14} /></button></div>{messages.length ? messages.slice(0, 5).map(message => <div className="message-row" key={message._id}><div className={`message-avatar ${message.read ? "" : "unread"}`}>{message.name?.slice(0, 1).toUpperCase()}</div><div className="message-main"><strong>{message.name}</strong><span>{message.email}</span></div><p>{message.message}</p><time>{new Date(message.createdAt).toLocaleDateString()}</time></div>) : <EmptyState title="Your inbox is quiet" text="Contact form submissions will appear here." />}</section></>;
}

function Profile({ portfolio, update, save }) {
  const profile = portfolio.profile || {};
  return <><PageIntro title="Profile" subtitle="The details visitors use to get to know you." /><section className="cms-card form-card"><div className="form-section"><p className="cms-kicker">Personal information</p><div className="field-grid"><Field label="Full name" value={profile.name} onChange={value => update("profile", { ...profile, name: value })} /><Field label="Professional title" value={profile.role} onChange={value => update("profile", { ...profile, role: value })} /><Field label="Email" type="email" value={profile.email} onChange={value => update("profile", { ...profile, email: value })} /><Field label="Location" value={profile.location} onChange={value => update("profile", { ...profile, location: value })} /></div><Field label="Short introduction" value={profile.tagline} onChange={value => update("profile", { ...profile, tagline: value })} /><Field label="Biography" multiline value={profile.bio} onChange={value => update("profile", { ...profile, bio: value })} /></div><div className="form-section"><p className="cms-kicker">Profile media</p><Field label="Profile image URL" value={profile.avatar} onChange={value => update("profile", { ...profile, avatar: value })} placeholder="/images/me.jpg" /><Field label="About image URL" value={profile.aboutImage} onChange={value => update("profile", { ...profile, aboutImage: value })} /></div><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save changes <Check size={16} /></button></div></section></>;
}

function Hero({ portfolio, update, save }) {
  const hero = portfolio.hero || {};
  const set = (key, value) => update("hero", { ...hero, [key]: value });
  return <><PageIntro title="Hero section" subtitle="Shape the first impression visitors have of your work." /><div className="split-layout"><section className="cms-card form-card"><div className="form-section"><p className="cms-kicker">Hero content</p><Field label="Introductory label" value={hero.eyebrow} onChange={value => set("eyebrow", value)} /><Field label="Main heading" multiline value={hero.heading} onChange={value => set("heading", value)} /><Field label="Description" multiline value={hero.description} onChange={value => set("description", value)} /><Field label="Location label" value={hero.locationLabel} onChange={value => set("locationLabel", value)} /></div><div className="form-section"><p className="cms-kicker">Call to action</p><div className="field-grid"><Field label="Primary button" value={hero.primaryLabel} onChange={value => set("primaryLabel", value)} /><Field label="Primary link" value={hero.primaryLink} onChange={value => set("primaryLink", value)} /><Field label="Secondary button" value={hero.secondaryLabel} onChange={value => set("secondaryLabel", value)} /><Field label="Secondary link" value={hero.secondaryLink} onChange={value => set("secondaryLink", value)} /></div></div><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save hero <Check size={16} /></button></div></section><section className="preview-card"><div className="preview-label"><span>Live preview</span><span className="status-dot"><i /> Draft preview</span></div><div className="hero-preview"><p>{hero.eyebrow || "Available for new opportunities"}</p><h2>{hero.heading || "Building digital experiences with care."}</h2><span>{hero.description || portfolio.profile?.bio}</span><div><b>{hero.primaryLabel || "See my work"}</b><em>{hero.secondaryLabel || "Get in touch"}</em></div></div></section></div></>;
}

function About({ portfolio, update, save }) {
  const about = portfolio.about || {};
  const set = (key, value) => update("about", { ...about, [key]: value });
  return <><PageIntro title="About me" subtitle="Give the about section more context and personality." /><section className="cms-card form-card"><div className="field-grid"><Field label="Section heading" value={about.heading} onChange={value => set("heading", value)} /><Field label="Current focus" value={about.currentFocus} onChange={value => set("currentFocus", value)} /></div><Field label="Introduction" multiline value={about.introduction} onChange={value => set("introduction", value)} /><Field label="Additional description" multiline value={about.description} onChange={value => set("description", value)} /><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save about section <Check size={16} /></button></div></section></>;
}

function CollectionEditor({ title, subtitle, field, portfolio, save, kind }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("");
  const items = portfolio[field] || [];
  const visible = items.filter(item => Object.values(item).join(" ").toLowerCase().includes(filter.toLowerCase()));
  const labels = { skill: ["name", "category", "icon"], project: ["title", "category", "description"], certificate: ["title", "issuer", "issueDate"], experience: ["title", "organization", "type"] }[kind];
  const blank = { [labels[0]]: "", [labels[1]]: "", [labels[2]]: "", published: true, featured: false, ...(kind === "experience" ? { type: "experience" } : {}), ...(kind === "project" ? { tags: [] } : {}) };
  async function commit(item) {
    const next = modal.index === -1 ? [...items, item] : items.map((entry, index) => index === modal.index ? item : entry);
    return save({ ...portfolio, [field]: next }, `${title} updated`);
  }
  async function remove(index) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    await save({ ...portfolio, [field]: next }, `${title} item removed`);
  }
  return <><PageIntro title={title} subtitle={subtitle} action={`Add ${kind}`} onAction={() => setModal({ index: -1, item: blank })} /><section className="cms-card collection-card"><div className="collection-toolbar"><div className="global-search"><Search size={16} /><input value={filter} onChange={event => setFilter(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></div><span>{visible.length} items</span></div>{visible.length ? <div className="collection-list">{visible.map((item, index) => <div className="collection-row" key={item._id || `${item[labels[0]]}-${index}`}><div className="collection-symbol">{kind === "skill" ? <Zap size={17} /> : kind === "certificate" ? <ShieldCheck size={17} /> : kind === "experience" ? <GraduationCap size={17} /> : <FolderKanban size={17} />}</div><div className="collection-main"><strong>{item[labels[0]] || "Untitled"}</strong><span>{item[labels[1]] || "No category"} {item[labels[2]] && `· ${String(item[labels[2]]).slice(0, 70)}`}</span></div><span className={`badge ${item.published === false ? "muted" : "success"}`}>{item.published === false ? "Draft" : "Published"}</span><button className="icon-button" onClick={() => setModal({ index: items.indexOf(item), item: { ...item } })}><Pencil size={16} /></button><button className="icon-button danger" onClick={() => remove(items.indexOf(item))}><Trash2 size={16} /></button></div>)}</div> : <EmptyState title={`No ${title.toLowerCase()} yet`} text="Add your first item to start building this collection." action={`Add ${kind}`} onAction={() => setModal({ index: -1, item: blank })} />}</section>{modal && <ItemModal kind={kind} item={modal.item} onClose={() => setModal(null)} onSave={commit} />}</>;
}

function ItemModal({ kind, item, onClose, onSave }) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const labels = { skill: [["name", "Skill name"], ["category", "Category"], ["icon", "Icon name"]], project: [["title", "Project title"], ["category", "Category"], ["description", "Short description"], ["image", "Thumbnail URL"], ["url", "Live URL"], ["github", "GitHub URL"], ["tags", "Technology tags (comma separated)"]], certificate: [["title", "Certificate title"], ["issuer", "Issuing organization"], ["issueDate", "Issue date"], ["credentialUrl", "Credential URL"], ["fileUrl", "Certificate file URL"]], experience: [["title", "Title"], ["organization", "Organization"], ["type", "Type (experience, education, achievement)"], ["startDate", "Start date"], ["endDate", "End date"], ["description", "Description"]] }[kind];
  const requiredKey = { skill: "name", project: "title", certificate: "title", experience: "title" }[kind];
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const nextItem = { ...draft };
    if (kind === "project") {
      nextItem.tags = Array.isArray(draft.tags)
        ? draft.tags
        : String(draft.tags || "").split(",").map(tag => tag.trim()).filter(Boolean);
    }
    try {
      if (await onSave(nextItem)) onClose();
    } finally {
      setSaving(false);
    }
  }
  return <Modal title={`${item.name || item.title ? "Edit" : "Add"} ${kind}`} onClose={onClose}><form className="modal-form" onSubmit={submit}>{labels.map(([key, label]) => <Field key={key} label={label} multiline={["description", "tags"].includes(key)} value={key === "tags" && Array.isArray(draft[key]) ? draft[key].join(", ") : draft[key]} onChange={value => set(key, value)} required={key === requiredKey || (kind === "experience" && key === "type") || (kind === "certificate" && key === "fileUrl")} disabled={saving} options={kind === "experience" && key === "type" ? ["experience", "education", "achievement"] : kind === "skill" && key === "icon" ? skillIconNames : undefined} />)}<label className="toggle-field"><input type="checkbox" checked={draft.published !== false} disabled={saving} onChange={event => set("published", event.target.checked)} /><span>Visible on public website</span></label><div className="form-actions"><button type="button" className="cms-button secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="cms-button primary" disabled={saving}>{saving ? "Saving…" : "Save item"} <Check size={16} /></button></div></form></Modal>;
}

function Messages({ messages, setMessages, setError, setNotice }) {
  const [selected, setSelected] = useState(messages[0]);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!selected || !messages.some(message => message._id === selected._id)) setSelected(messages[0] || null);
  }, [messages, selected]);
  async function toggleRead(message) {
    try {
      const { data } = await api.patch(`/messages/${message._id}/read`);
      setMessages(current => current.map(item => item._id === message._id ? data : item));
      setSelected(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update the message.");
    }
  }
  async function deleteMessage(message) {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/messages/${message._id}`);
      const remaining = messages.filter(item => item._id !== message._id);
      setMessages(remaining);
      setSelected(remaining[0] || null);
      setNotice("Message deleted");
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the message.");
    } finally {
      setDeleting(false);
    }
  }
  return <><PageIntro title="Messages" subtitle="A calm place to respond to people reaching out." /><div className="inbox-layout cms-card"><div className="inbox-list"><div className="inbox-filter"><Mail size={16} /> {messages.length} conversations</div>{messages.map(message => <button className={`inbox-item ${selected?._id === message._id ? "selected" : ""}`} key={message._id} onClick={() => setSelected(message)}><div className={`message-avatar ${message.read ? "" : "unread"}`}>{message.name?.slice(0, 1).toUpperCase()}</div><div><strong>{message.name}</strong><span>{message.email}</span><p>{message.message}</p></div>{!message.read && <i />}</button>)}</div><div className="message-detail">{selected ? <><div className="detail-heading"><div className="message-avatar large">{selected.name?.slice(0, 1).toUpperCase()}</div><div><h2>{selected.name}</h2><span>{selected.email} · {new Date(selected.createdAt).toLocaleString()}</span></div></div><p className="detail-copy">{selected.message}</p><div className="form-actions"><a className="cms-button primary" href={`mailto:${selected.email}`}>Reply by email <ArrowUpRight size={15} /></a>{!selected.read && <button className="cms-button secondary" onClick={() => toggleRead(selected)}>Mark as read</button>}<button className="icon-button danger" aria-label="Delete message" title="Delete message" onClick={() => deleteMessage(selected)} disabled={deleting}><Trash2 size={16} /></button></div></> : <EmptyState title="Select a message" text="Choose a conversation to view its details." />}</div></div></>;
}

function Socials({ portfolio, update, save }) {
  const socials = portfolio.socials || {};
  return <><PageIntro title="Social links" subtitle="Keep your public profile links accurate and discoverable." /><section className="cms-card form-card"><div className="field-grid">{["github", "linkedin", "instagram", "twitter"].map(key => <Field key={key} label={key} value={socials[key]} onChange={value => update("socials", { ...socials, [key]: value })} placeholder="https://" />)}</div><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save social links <Check size={16} /></button></div></section></>;
}

function Media({ portfolio, update, save, setNotice }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const media = portfolio.media || [];
  async function uploadFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    let next = [...media];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/admin/media/upload", formData);
        next = [...next, data];
        update("media", next);
      }
      setNotice("Uploaded to Cloudinary");
    } catch (error) {
      setUploadError(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  async function removeAsset(asset) {
    if (!window.confirm(`Delete "${asset.name}" from the media library?`)) return;
    try {
      await api.delete(`/admin/media/${asset._id}`);
      const next = media.filter(item => item._id !== asset._id);
      update("media", next);
      setNotice("Media deleted");
    } catch (error) {
      setUploadError(error.response?.data?.message || "Could not delete media");
    }
  }
  return <><PageIntro title="Media library" subtitle="Upload and manage reusable images and PDFs in Cloudinary." /><section className="cms-card form-card"><label className="media-dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }}><Upload size={22} /><strong>{uploading ? "Uploading…" : "Drop files here or click to browse"}</strong><span>JPG, PNG, WebP, GIF or PDF · up to 10 MB</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={event => uploadFiles(event.target.files)} /></label>{uploadError && <p className="form-error media-error">{uploadError}</p>}</section><section className="media-grid">{media.length ? media.map((asset, index) => <div className="media-card" key={asset._id || `${asset.url}-${index}`}><div className="media-preview">{asset.type?.startsWith("image") ? <img src={asset.url} alt="" /> : <FileText size={28} />}</div><strong>{asset.name}</strong><span>{asset.type}</span><div className="media-actions"><a href={asset.url} target="_blank" rel="noreferrer" className="icon-button"><ArrowUpRight size={15} /></a><button className="icon-button danger" onClick={() => removeAsset(asset)}><Trash2 size={15} /></button></div></div>) : <div className="cms-card"><EmptyState title="Your library is empty" text="Upload images or PDFs to start your Cloudinary library." /></div>}</section></>;
}

function Resume({ portfolio, update, save, setNotice }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  async function uploadResumeFile(file) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/admin/resume/upload", formData);
      update("resumeUrl", data.url);
      update("resumeName", data.name);
      setNotice("Resume uploaded to Cloudinary");
    } catch (error) {
      setUploadError(error.response?.data?.message || "Resume upload failed");
    } finally {
      setUploading(false);
    }
  }
  return <><PageIntro title="Resume manager" subtitle="Upload one active PDF resume to Cloudinary." /><section className="cms-card form-card"><div className="resume-banner"><div className="file-icon"><FileText size={22} /></div><div><strong>{portfolio.resumeName || "No resume uploaded"}</strong><span>{portfolio.resumeUrl || "Upload a PDF below"}</span></div>{portfolio.resumeUrl && <a href={portfolio.resumeUrl} target="_blank" rel="noreferrer" className="icon-button"><ArrowUpRight size={16} /></a>}</div><label className="media-dropzone"><Upload size={22} /><strong>{uploading ? "Uploading…" : "Choose a PDF resume"}</strong><span>PDF · up to 10 MB</span><input type="file" accept="application/pdf" onChange={event => uploadResumeFile(event.target.files[0])} /></label>{uploadError && <p className="form-error media-error">{uploadError}</p>}<div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save resume details <Check size={16} /></button></div></section></>;
}

function SettingsPage({ portfolio, update, save }) {
  const settings = portfolio.settings || {};
  const set = (key, value) => update("settings", { ...settings, [key]: value });
  return <><PageIntro title="Website settings" subtitle="Control the defaults and visibility of your public site." /><section className="cms-card form-card"><div className="field-grid"><Field label="Website name" value={settings.siteName} onChange={value => set("siteName", value)} /><Field label="Accent color" value={settings.accentColor} onChange={value => set("accentColor", value)} /></div><Field label="Website description" multiline value={settings.siteDescription} onChange={value => set("siteDescription", value)} /><label className="toggle-field"><input type="checkbox" checked={settings.maintenanceMode === true} onChange={event => set("maintenanceMode", event.target.checked)} /><span>Enable maintenance mode</span></label><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save settings <Check size={16} /></button></div></section></>;
}

function Seo({ portfolio, update, save }) {
  const seo = portfolio.seo || {};
  const set = (key, value) => update("seo", { ...seo, [key]: value });
  return <><PageIntro title="SEO settings" subtitle="Make your portfolio easier to discover and share." /><section className="cms-card form-card"><Field label="Page title" value={seo.title} onChange={value => set("title", value)} /><Field label="Meta description" multiline value={seo.description} onChange={value => set("description", value)} /><Field label="Keywords (comma separated)" value={seo.keywords?.join(", ")} onChange={value => set("keywords", value.split(",").map(keyword => keyword.trim()).filter(Boolean))} /><div className="field-grid"><Field label="Canonical URL" value={seo.canonicalUrl} onChange={value => set("canonicalUrl", value)} /><Field label="Social sharing image URL" value={seo.ogImage} onChange={value => set("ogImage", value)} /></div><div className="form-actions"><button className="cms-button primary" onClick={() => save()}>Save SEO settings <Check size={16} /></button></div></section></>;
}
