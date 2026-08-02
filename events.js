// ============================================================
// events.js — reads "events" collection from Firestore.
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export async function renderEvents(targetEl) {
  targetEl.innerHTML = `<p class="muted">Loading…</p>`;
  try {
    const q = query(collection(db, "events"), where("status", "==", "published"), orderBy("eventDate", "asc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      targetEl.innerHTML = `<div class="empty-state"><h3 data-i18n="empty_events">No upcoming events.</h3></div>`;
      return;
    }
    targetEl.innerHTML = snap.docs.map((d) => {
      const e = d.data();
      return `
      <div class="card-plain grid" style="grid-template-columns:120px 1fr;align-items:center;gap:20px;margin-bottom:16px;">
        <div class="text-center" style="background:var(--paper-dim);border-radius:12px;padding:14px 8px;">
          <b style="font-family:var(--font-display);font-size:22px;display:block;">${fmtDate(e.eventDate)}</b>
        </div>
        <div>
          <h3>${e.title || ""}</h3>
          <p class="muted mt-8">${e.location || ""}</p>
          <p class="mt-8">${e.description || ""}</p>
        </div>
      </div>`;
    }).join("");
  } catch (err) {
    console.error("Events load failed:", err);
    targetEl.innerHTML = `<div class="empty-state"><h3>Could not load events</h3></div>`;
  }
}
