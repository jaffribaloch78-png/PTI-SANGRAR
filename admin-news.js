// ============================================================
// admin-news.js — Create / edit / delete news articles.
// Images upload to Firebase Storage; the URL is stored on the
// Firestore document. Writes are only permitted for UIDs listed
// in the /admins collection (enforced by firestore.rules).
// ============================================================
import { db, storage } from "../../js/firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const listEl = document.getElementById("newsList");
const form = document.getElementById("newsForm");
const formTitle = document.getElementById("formTitle");
const editIdField = document.getElementById("editId");
const cancelBtn = document.getElementById("cancelEdit");

function statusBadge(s) {
  return `<span class="status-badge ${s}">${s}</span>`;
}

async function loadList() {
  listEl.innerHTML = `<tr><td colspan="4">Loading…</td></tr>`;
  const snap = await getDocs(query(collection(db, "news"), orderBy("createdAt", "desc")));
  if (snap.empty) {
    listEl.innerHTML = `<tr><td colspan="4">No news items yet — add the first one above.</td></tr>`;
    return;
  }
  listEl.innerHTML = snap.docs.map((d) => {
    const n = d.data();
    return `
    <tr>
      <td>${n.title || ""}</td>
      <td>${n.category || ""}</td>
      <td>${statusBadge(n.status || "draft")}</td>
      <td>
        <button class="icon-btn" data-edit="${d.id}">Edit</button>
        <button class="icon-btn" data-del="${d.id}">Delete</button>
      </td>
    </tr>`;
  }).join("");

  listEl.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => loadForEdit(b.dataset.edit)));
  listEl.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => removeItem(b.dataset.del)));
}

async function loadForEdit(id) {
  const snap = await getDoc(doc(db, "news", id));
  if (!snap.exists()) return;
  const n = snap.data();
  editIdField.value = id;
  form.title.value = n.title || "";
  form.category.value = n.category || "";
  form.excerpt.value = n.excerpt || "";
  form.body.value = n.body || "";
  form.status.value = n.status || "draft";
  form.dataset.existingImage = n.imageUrl || "";
  form.dataset.hadPublishedAt = n.publishedAt ? "1" : "";
  formTitle.textContent = "Edit News";
  cancelBtn.style.display = "inline-flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeItem(id) {
  if (!confirm("Delete this news item? This cannot be undone.")) return;
  await deleteDoc(doc(db, "news", id));
  loadList();
}

function resetForm() {
  form.reset();
  editIdField.value = "";
  form.dataset.existingImage = "";
  form.dataset.hadPublishedAt = "";
  formTitle.textContent = "Add News";
  cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    let imageUrl = form.dataset.existingImage || "";
    const file = form.image.files[0];
    if (file) {
      const path = `news/${Date.now()}_${file.name}`;
      const sRef = ref(storage, path);
      await uploadBytes(sRef, file);
      imageUrl = await getDownloadURL(sRef);
    }

    const payload = {
      title: form.title.value.trim(),
      category: form.category.value.trim(),
      excerpt: form.excerpt.value.trim(),
      body: form.body.value.trim(),
      status: form.status.value,
      imageUrl,
      updatedAt: serverTimestamp(),
    };

    if (editIdField.value) {
      if (payload.status === "published" && form.dataset.hadPublishedAt !== "1") {
        payload.publishedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "news", editIdField.value), payload);
    } else {
      payload.createdAt = serverTimestamp();
      if (payload.status === "published") payload.publishedAt = serverTimestamp();
      await addDoc(collection(db, "news"), payload);
    }

    resetForm();
    loadList();
  } catch (err) {
    console.error("Save failed:", err);
    alert("Could not save this article. Check your Firebase rules and connection.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save";
  }
});

loadList();
