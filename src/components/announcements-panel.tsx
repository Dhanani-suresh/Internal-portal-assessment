"use client";

import { FormEvent, useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};

type AnnouncementsPanelProps = {
  currentUserEmail: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function AnnouncementsPanel({ currentUserEmail }: AnnouncementsPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadAnnouncements() {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      if (response.ok) setAnnouncements(data.announcements);
      else setError(data.error ?? "Could not load announcements.");
      setIsLoading(false);
    }
    void loadAnnouncements();
  }, []);

  async function postAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsPosting(true);
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const data = await response.json();
    setIsPosting(false);
    if (!response.ok) return setError(data.error ?? "Could not post announcement.");

    setAnnouncements((current) => [data.announcement, ...current]);
    setTitle("");
    setBody("");
    setNotice("Your announcement was published.");
  }

  async function removeAnnouncement(announcement: Announcement) {
    if (!window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return;

    setError("");
    setNotice("");
    setDeletingId(announcement.id);
    const response = await fetch(`/api/announcements/${announcement.id}`, { method: "DELETE" });
    const data = response.status === 204 ? null : await response.json();
    setDeletingId(null);
    if (!response.ok) return setError(data?.error ?? "Could not delete announcement.");

    setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
    setNotice("Announcement deleted.");
  }

  return (
    <div className="announcements-grid">
      <section className="composer-card" aria-labelledby="post-title">
        <h2 id="post-title">Share an update</h2>
        <form onSubmit={postAnnouncement} className="composer-form">
          <label>
            Headline
            <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} maxLength={100} placeholder="What should the team know?" required />
            <span className="character-count">{title.length}/100</span>
          </label>
          <label>
            Message
            <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={3} maxLength={1000} placeholder="Write a concise update..." rows={5} required />
            <span className="character-count">{body.length}/1000</span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <button className="primary-button" disabled={isPosting}>{isPosting ? "Publishing..." : "Publish announcement"}</button>
        </form>
      </section>
      <section className="feed" aria-live="polite" aria-label="Announcement feed">
        <div className="feed-heading"><h2>Latest updates</h2><span>{announcements.length} posts</span></div>
        {isLoading ? <p className="empty-state">Loading announcements...</p> : announcements.length === 0 ? <p className="empty-state">No announcements yet. Start the conversation.</p> : (
          <div className={`announcement-list${announcements.length > 3 ? " announcement-list-scrollable" : ""}`}>
            {announcements.map((announcement) => (
              <article className="announcement-card" key={announcement.id}>
                <div className="avatar" aria-hidden="true">{announcement.author.charAt(0).toUpperCase()}</div>
                <div className="announcement-content">
                  <div className="announcement-title-row">
                    <h3>{announcement.title}</h3>
                    {announcement.author === currentUserEmail && (
                      <button className="delete-button" type="button" onClick={() => void removeAnnouncement(announcement)} disabled={deletingId === announcement.id}>
                        {deletingId === announcement.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                  <p>{announcement.body}</p>
                  <footer>Posted by {announcement.author} - {formatDate(announcement.createdAt)}</footer>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
