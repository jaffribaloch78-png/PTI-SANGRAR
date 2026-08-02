// ============================================================
// content.js — loads editable content from Firestore doc
// settings/site_content. Nothing here is pre-filled with a name
// or quote — it stays hidden until an admin fills it in via the
// admin panel, so no real person's words are ever invented.
// ============================================================
import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function renderSiteContent() {
  try {
    const snap = await getDoc(doc(db, "settings", "site_content"));
    const data = snap.exists() ? snap.data() : {};

    const missionEl = document.querySelector('[data-content="mission"]');
    if (missionEl) missionEl.textContent = data.missionText || missionEl.textContent;

    const chairmanBlock = document.querySelector('[data-content="chairman-block"]');
    if (chairmanBlock) {
      if (data.chairmanMessage && data.chairmanName) {
        chairmanBlock.innerHTML = `
          <p style="font-family:var(--font-display);font-size:20px;font-style:italic;max-width:60ch;">"${data.chairmanMessage}"</p>
          <p class="muted mt-16">— ${data.chairmanName}</p>`;
      } else {
        chairmanBlock.style.display = "none";
      }
    }
  } catch (e) {
    console.error("Site content load failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", renderSiteContent);
