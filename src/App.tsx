import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, CalendarDays, Check, ChevronDown, CircleHelp, CloudUpload, Filter, ImagePlus, Images, LogOut, Menu, RefreshCw, ShieldCheck, Sparkles, X } from "lucide-react";
import { api, type Admin, type Photo } from "./lib/api";

function dateLabel(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}
function dateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function formatBytes(bytes: number) {
  if (!bytes) return "—";
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().slice(0, 10));
  const [caption, setCaption] = useState("");

  const loadPhotos = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams({ status, limit: "25", offset: String(page * 25) });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const result = await api.photos(params);
      setPhotos(result.data);
      setTotal(result.pagination.total);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load photos."); }
  }, [status, from, to, page]);

  useEffect(() => {
    api.me().then(result => setAdmin(result.admin)).catch(() => setAdmin(null)).finally(() => setChecking(false));
  }, []);
  useEffect(() => { if (admin) void loadPhotos(); }, [admin, loadPhotos]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const publishedCount = useMemo(() => photos.filter(photo => photo.published_at).length, [photos]);
  const unpublishedCount = photos.length - publishedCount;

  async function handleLogin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setLoginError("");
    try { const result = await api.login(email.trim(), password); setAdmin(result.admin); setPassword(""); }
    catch (err) { setLoginError(err instanceof Error ? err.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }
  async function handleLogout() {
    try { await api.logout(); } finally { setAdmin(null); setPhotos([]); }
  }
  async function togglePublish(photo: Photo) {
    setWorkingId(photo.id); setError(""); setNotice("");
    try {
      await api.publish(photo.id, !photo.published_at);
      setNotice(photo.published_at ? "Photo moved to drafts." : "Photo published successfully.");
      await loadPhotos();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update photo."); }
    finally { setWorkingId(""); }
  }
  function chooseFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Choose a JPG, PNG or WebP image."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be 10 MB or smaller."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(file); setPreview(URL.createObjectURL(file)); setError("");
  }

  if (checking) return <div className="boot-screen"><div className="loader-mark">ॐ</div><span>Preparing your workspace</span></div>;
  if (!admin) return <main className="login-shell">
    <section className="login-art">
      <div className="art-top"><span className="temple-mark">ॐ</span><span>MANKALESHWAR MAHADEV</span></div>
      <div className="art-copy"><span className="eyebrow light">THE TEMPLE ADMINISTRATION</span><h1>Seva, with<br/><em>care and devotion.</em></h1><p>A quiet space to preserve and share the daily moments of Mankaleshwar Mahadev.</p></div>
      <div className="art-footer"><span>ॐ नमः शिवाय</span><span>EST. WITH DEVOTION</span></div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <div className="mobile-symbol">ॐ</div><span className="eyebrow">ADMINISTRATOR ACCESS</span>
        <h2>Welcome back</h2><p className="muted">Sign in to manage temple photos and publications.</p>
        <form onSubmit={handleLogin} className="login-form">
          <label>Email address<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com"/></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"/></label>
          {loginError && <div className="inline-error">{loginError}</div>}
          <button className="primary-btn full" disabled={busy}>{busy ? <><span className="spinner"/> Signing in…</> : <>Sign in <span>→</span></>}</button>
        </form>
        <div className="secure-note"><ShieldCheck size={15}/> Protected administrator session</div>
      </div>
      <div className="login-bottom">Mankaleshwar Mahadev Temple <span>•</span> Official admin portal</div>
    </section>
  </main>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-symbol">ॐ</div><div><strong>Mankaleshwar</strong><small>MAHADEV TEMPLE</small></div><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-link active"><Images size={18}/> Photo library <span className="nav-count">{total}</span></button>
      <div className="side-label side-label-lower">TEMPLE</div>
      <div className="temple-note"><div className="note-icon"><Sparkles size={16}/></div><strong>Every photo tells<br/>a story of devotion.</strong><p>Preserve each day's darshan for the community.</p></div>
      <div className="sidebar-bottom"><div className="admin-avatar">{admin.email.slice(0,1).toUpperCase()}</div><div className="admin-meta"><strong>Administrator</strong><span>{admin.email}</span></div><button className="icon-btn logout-btn" onClick={handleLogout} title="Sign out"><LogOut size={17}/></button></div>
    </aside>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>Photo library</strong></div><div className="topbar-right"><span className="status-dot"/> System operational <div className="top-avatar">{admin.email.slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">CONTENT MANAGEMENT <span>·</span> PHOTOS</div><h1>Photo library</h1><p>Manage darshan photographs and choose the date each moment belongs to.</p></div><button className="primary-btn" onClick={() => { setUploadOpen(true); setNotice(""); }}><ImagePlus size={17}/> Add photo</button></div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><Images size={18}/></div><span>Total photos</span><strong>{total}</strong><small>Across your library</small></div>
          <div className="stat-card"><div className="stat-icon green"><Check size={18}/></div><span>Published on this page</span><strong>{publishedCount}</strong><small>Visible to visitors</small></div>
          <div className="stat-card"><div className="stat-icon amber"><Activity size={18}/></div><span>Drafts on this page</span><strong>{unpublishedCount}</strong><small>Only visible to admins</small></div>
        </div>
        <section className="library-section">
          <div className="section-heading"><div><h2>All photographs</h2><p>Review, filter and control what visitors can see.</p></div><button className="subtle-btn" onClick={() => void loadPhotos()}><RefreshCw size={15}/> Refresh</button></div>
          <div className="filters">
            <div className="filter-title"><Filter size={16}/> Filters</div>
            <label className="filter-control"><span>Publication</span><div className="select-wrap"><select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}><option value="all">All photos</option><option value="published">Published</option><option value="unpublished">Drafts</option></select><ChevronDown size={15}/></div></label>
            <label className="filter-control"><span>Photo date from</span><input type="date" value={from} max={to || undefined} onChange={e => { setFrom(e.target.value); setPage(0); }}/></label>
            <label className="filter-control"><span>Photo date to</span><input type="date" value={to} min={from || undefined} onChange={e => { setTo(e.target.value); setPage(0); }}/></label>
            <button className="clear-btn" onClick={() => { setStatus("all"); setFrom(""); setTo(""); setPage(0); }}>Clear</button>
          </div>
          {notice && <div className="notice"><Check size={16}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
          {error && <div className="inline-error page-error">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={15}/></button></div>}
          <div className="table-wrap">
            <table><thead><tr><th>PHOTOGRAPH</th><th>PHOTO DATE <span className="th-hint">(SELECTED DATE)</span></th><th>UPLOADED</th><th>FILE SIZE</th><th>STATUS</th><th className="actions-head">ACTION</th></tr></thead>
              <tbody>{photos.map(photo => <tr key={photo.id}><td><div className="photo-cell"><img src={photo.media_url} alt={photo.caption || "Temple photograph"} loading="lazy"/><div><strong>{photo.caption || photo.original_filename || "Temple photograph"}</strong><small>{photo.original_filename || photo.id.slice(0, 8)}</small></div></div></td><td><div className="date-cell"><CalendarDays size={15}/>{dateLabel(photo.photo_date)}</div></td><td className="uploaded-cell">{dateTime(photo.uploaded_at)}</td><td className="size-cell">{formatBytes(photo.file_size_bytes)}</td><td><span className={`status-pill ${photo.published_at ? "published" : "draft"}`}><i/>{photo.published_at ? "Published" : "Draft"}</span></td><td><button className={`action-btn ${photo.published_at ? "unpublish" : "publish"}`} disabled={workingId === photo.id} onClick={() => void togglePublish(photo)}>{workingId === photo.id ? <span className="spinner dark"/> : photo.published_at ? "Unpublish" : "Publish"}</button></td></tr>)}
              </tbody>
            </table>
            {!photos.length && <div className="empty-state"><div className="empty-icon"><Images size={24}/></div><strong>No photographs found</strong><p>{error ? "Resolve the error above and refresh." : "There are no photos matching these filters yet."}</p></div>}
          </div>
          <div className="table-footer"><span>Showing {photos.length ? page * 25 + 1 : 0}–{page * 25 + photos.length} of {total} photos</span><div><button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button><button className="page-btn" disabled={(page + 1) * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
        </section>
        <footer className="page-footer"><span>ॐ नमः शिवाय</span><span>MAHANKALESHWAR MAHADEV · ADMINISTRATION</span></footer>
      </div>
    </main>
    {uploadOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setUploadOpen(false); }}><section className="upload-modal"><div className="modal-head"><div><span className="eyebrow">ADD TO THE ARCHIVE</span><h2>Upload a photograph</h2></div><button className="icon-btn" onClick={() => setUploadOpen(false)} aria-label="Close"><X size={19}/></button></div>
      <div className="upload-unavailable"><CircleHelp size={18}/><div><strong>Upload is not connected yet</strong><p>The backend currently has photo listing and publish controls, but no secure upload endpoint or configured storage provider. This form is a preview only; no file will be sent or saved.</p></div></div>
      <label className="upload-drop">{preview ? <img className="upload-preview" src={preview} alt="Selected upload preview"/> : <><CloudUpload size={27}/><strong>Choose an image to preview</strong><span>JPG, PNG or WebP · Up to 10 MB</span></>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseFile(e.target.files?.[0])}/></label>
      {selectedFile && <div className="selected-file"><span>{selectedFile.name}</span><button onClick={() => { setSelectedFile(null); setPreview(""); }}><X size={14}/></button></div>}
      <label className="modal-label">Photo date <span>This is the date shown in the public gallery</span><input type="date" value={photoDate} onChange={e => setPhotoDate(e.target.value)} required/></label>
      <label className="modal-label">Caption <span>Optional</span><input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Morning darshan"/></label>
      <div className="modal-actions"><button className="subtle-btn" onClick={() => setUploadOpen(false)}>Close</button><button className="primary-btn" disabled title="Waiting for backend upload endpoint"><CloudUpload size={16}/> Upload unavailable</button></div>
    </section></div>}
  </div>;
}
