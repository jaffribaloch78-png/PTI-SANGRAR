// ============================================================
// gallery.js — reads "gallery" collection (images uploaded via
// admin panel to Firebase Storage, metadata stored in Firestore).
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, query, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function renderGallery(targetEl) {
  targetEl.innerHTML = `<p class="muted">Loading…</p>`;
  try {
    const q = query(collection(db, "gallery"), where("status", "==", "published"), orderBy("uploadedAt", "desc"), limit(60));
    const snap = await getDocs(q);
    if (snap.empty) {
      targetEl.innerHTML = `<div class="empty-state"><h3 data-i18n="empty_gallery">No photos uploaded yet.</h3></div>`;
      return;
    }
    targetEl.innerHTML = snap.docs.map((d) => {
      const g = d.data();
      return `<div class="card-media" style="margin:0;"><img src="${g.imageUrl}" alt="${g.caption || ""}" loading="lazy"></div>`;
    }).join("");
  } catch (e) {
    console.error("Gallery load failed:", e);
    targetEl.innerHTML = `<div class="empty-state"><h3>Could not load gallery</h3></div>`;
  }
}
