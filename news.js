// ============================================================
// news.js — reads the "news" collection from Firestore.
// Only documents with status == "published" are shown publicly.
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, query, where, orderBy, limit, getDocs, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function newsCardHTML(id, n) {
  const img = n.imageUrl || "";
  return `
  <a class="card" href="news-detail.html?id=${id}">
    ${img ? `<div class="card-media"><img src="${img}" alt="${n.title || ""}" loading="lazy"></div>` : ""}
    <span class="tag">${n.category || ""}</span>
    <h3>${n.title || ""}</h3>
    <p>${(n.excerpt || n.body || "").slice(0, 120)}${(n.excerpt || n.body || "").length > 120 ? "…" : ""}</p>
    <p class="muted" style="margin-top:14px;font-size:13px;">${fmtDate(n.publishedAt)}</p>
  </a>`;
}

export async function renderNewsList(targetEl, opts = {}) {
  const max = opts.limit || 30;
  targetEl.innerHTML = `<p class="muted">Loading…</p>`;
  try {
    const q = query(
      collection(db, "news"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      targetEl.innerHTML = `<div class="empty-state"><h3 data-i18n="empty_news">No news published yet.</h3></div>`;
      return;
    }
    targetEl.innerHTML = snap.docs.map((d) => newsCardHTML(d.id, d.data())).join("");
  } catch (e) {
    console.error("News load failed:", e);
    targetEl.innerHTML = `<div class="empty-state"><h3>Could not load news</h3><p class="muted">Check your Firebase config and Firestore rules.</p></div>`;
  }
}

export async function renderNewsDetail(targetEl) {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) { targetEl.innerHTML = `<p class="muted">No article specified.</p>`; return; }
  try {
    const snap = await getDoc(doc(db, "news", id));
    if (!snap.exists() || snap.data().status !== "published") {
      targetEl.innerHTML = `<div class="empty-state"><h3>Article not found</h3></div>`;
      return;
    }
    const n = snap.data();
    document.title = `${n.title} — PTI Sangrar`;
    targetEl.innerHTML = `
      <span class="pill">${n.category || ""}</span>
      <h1 class="mt-16">${n.title || ""}</h1>
      <p class="muted mt-8">${fmtDate(n.publishedAt)}</p>
      ${n.imageUrl ? `<div class="card-media mt-24" style="aspect-ratio:16/8;"><img src="${n.imageUrl}" alt="${n.title}"></div>` : ""}
      <div class="mt-24" style="max-width:70ch;font-size:16px;white-space:pre-line;">${n.body || ""}</div>
    `;
  } catch (e) {
    console.error("Article load failed:", e);
    targetEl.innerHTML = `<p class="muted">Could not load this article.</p>`;
  }
}
