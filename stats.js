// ============================================================
// stats.js — the homepage stats strip shows REAL counts from
// Firestore (no invented numbers, per "no fake data").
// Falls back to 0 for any collection that's still empty.
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, query, where, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

async function countOf(col, field, value) {
  try {
    const q = field ? query(collection(db, col), where(field, "==", value)) : collection(db, col);
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (e) {
    console.error(`Count failed for ${col}:`, e);
    return 0;
  }
}

function animateTo(el, target) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || target === 0) { el.textContent = target.toLocaleString(); return; }
  let cur = 0;
  const step = Math.max(1, Math.round(target / 40));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = cur.toLocaleString();
  }, 25);
}

export async function renderStats() {
  const els = {
    news: document.querySelector('[data-stat="news"]'),
    volunteers: document.querySelector('[data-stat="volunteers"]'),
    events: document.querySelector('[data-stat="events"]'),
    complaints: document.querySelector('[data-stat="complaints"]'),
  };
  const [news, volunteers, events, complaints] = await Promise.all([
    countOf("news", "status", "published"),
    countOf("volunteers"),
    countOf("events", "status", "published"),
    countOf("complaints", "status", "resolved"),
  ]);
  if (els.news) animateTo(els.news, news);
  if (els.volunteers) animateTo(els.volunteers, volunteers);
  if (els.events) animateTo(els.events, events);
  if (els.complaints) animateTo(els.complaints, complaints);
}

document.addEventListener("DOMContentLoaded", renderStats);
