// ============================================================
// admin-gallery.js — upload photos to Storage, list & delete.
// ============================================================
import { db, storage } from "../../js/firebase-config.js";
import {
  collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const form = document.getElementById("uploadForm");
const grid = document.getElementById("adminGalleryGrid");

async function loadGrid() {
  grid.innerHTML = `<p class="muted">Loading…</p>`;
  const snap = await getDocs(query(collection(db, "gallery"), orderBy("uploadedAt", "desc")));
  if (snap.empty) {
    grid.innerHTML = `<p class="muted">No photos yet — upload the first one above.</p>`;
    return;
  }
  grid.innerHTML = snap.docs.map((d) => {
    const g = d.data();
    return `
    <div class="card-plain" style="padding:10px;">
      <div class="card-media" style="margin-bottom:8px;"><img src="${g.imageUrl}" alt="${g.caption || ""}"></div>
      <p style="font-size:13px;" class="muted">${g.caption || ""}</p>
      <button class="icon-btn mt-8" data-del="${d.id}" data-path="${g.storagePath}">Delete</button>
    </div>`;
  }).join("");

  grid.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => remove(b.dataset.del, b.dataset.path)));
}

async function remove(id, storagePath) {
  if (!confirm("Delete this photo?")) return;
  try {
    if (storagePath) await deleteObject(ref(storage, storagePath)).catch(() => {});
    await deleteDoc(doc(db, "gallery", id));
    loadGrid();
  } catch (e) {
    console.error(e);
    alert("Could not delete this photo.");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = form.image.files[0];
  if (!file) return;
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading…";

  try {
    const path = `gallery/${Date.now()}_${file.name}`;
    const sRef = ref(storage, path);
    await uploadBytes(sRef, file);
    const imageUrl = await getDownloadURL(sRef);

    await addDoc(collection(db, "gallery"), {
      imageUrl,
      storagePath: path,
      caption: form.caption.value.trim(),
      status: "published",
      uploadedAt: serverTimestamp(),
    });

    form.reset();
    loadGrid();
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Could not upload this photo. Check your Firebase Storage rules.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Upload";
  }
});

loadGrid();
