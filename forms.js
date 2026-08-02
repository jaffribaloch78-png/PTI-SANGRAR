// ============================================================
// forms.js — handles public submission forms (membership,
// volunteer, complaints). Each form has data-collection="name"
// on the <form> tag. Submissions are CREATE-only from the public
// side — see firebase/firestore.rules. Nobody but admin can read
// these back.
// ============================================================
import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const PHONE_RE = /^[0-9+\-\s]{7,15}$/;
const CNIC_RE = /^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/;

function showMsg(form, type, text) {
  let msg = form.querySelector(".form-msg");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "form-msg";
    form.prepend(msg);
  }
  msg.className = `form-msg ${type}`;
  msg.textContent = text;
}

function validate(form) {
  const name = form.querySelector('[name="name"]');
  const phone = form.querySelector('[name="phone"]');
  const cnic = form.querySelector('[name="cnic"]');

  if (name && name.value.trim().length < 3) {
    return "Please enter your full name.";
  }
  if (phone && !PHONE_RE.test(phone.value.trim())) {
    return "Please enter a valid phone number.";
  }
  if (cnic && cnic.value.trim() && !CNIC_RE.test(cnic.value.trim())) {
    return "Please enter a valid CNIC number (e.g. 12345-1234567-1).";
  }
  return null;
}

function initSubmitForm(form) {
  const collectionName = form.dataset.collection;
  const submitBtn = form.querySelector('[type="submit"]');
  const dict = () => window.__dict || {};

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const err = validate(form);
    if (err) { showMsg(form, "err", err); return; }

    const data = {};
    new FormData(form).forEach((val, key) => { data[key] = typeof val === "string" ? val.trim() : val; });
    data.status = "new";
    data.submittedAt = serverTimestamp();
    data.source = "website";

    const originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = dict().form_sending || "Sending…"; }

    try {
      await addDoc(collection(db, collectionName), data);
      showMsg(form, "ok", dict().form_success || "Thank you — received.");
      form.reset();
    } catch (e) {
      console.error(`Submit to ${collectionName} failed:`, e);
      showMsg(form, "err", dict().form_error || "Something went wrong. Please try again.");
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form[data-collection]").forEach(initSubmitForm);
});
