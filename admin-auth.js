// ============================================================
// admin-auth.js — real Firebase Authentication, checked against
// an "admins" allowlist collection in Firestore (doc ID = UID,
// field role == "admin"). This is client-side UX only; the real
// enforcement lives in firebase/firestore.rules — a user who
// isn't an approved admin cannot write to protected collections
// even if this file were bypassed.
//
// Errors are deliberately split into three distinct categories so
// a login problem is never mistaken for a different one:
//   - wrong email/password           -> "Invalid email or password."
//   - signed in, but Firestore says
//     this UID isn't an approved admin -> "not authorized" message
//   - signed in, but the Firestore READ itself was denied
//     (rules not deployed yet, or misconfigured)
//                                     -> "permission" message,
//                                        pointing at firestore.rules
// ============================================================
import { auth, db } from "../../js/firebase-config.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function isApprovedAdmin(snap) {
  return snap.exists() && snap.data().role === "admin";
}

export async function loginAdmin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  let adminSnap;
  try {
    adminSnap = await getDoc(doc(db, "admins", cred.user.uid));
  } catch (e) {
    await signOut(auth);
    const err = new Error(
      "Signed in, but Firestore denied the admin check. Your firestore.rules likely " +
      "haven't been deployed yet -- see README.md section 4."
    );
    err.code = "permission";
    throw err;
  }

  if (!isApprovedAdmin(adminSnap)) {
    await signOut(auth);
    const err = new Error(
      "This account signed in successfully, but is not on the admins list " +
      "(no admins/" + cred.user.uid + " document with role: \"admin\")."
    );
    err.code = "not-admin";
    throw err;
  }

  return cred.user;
}

// Call this at the top of every protected admin page.
// Redirects to login if not signed in or not on the admin allowlist.
export function guardAdminPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/admin/index.html";
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));
        if (!isApprovedAdmin(adminSnap)) {
          await signOut(auth);
          window.location.href = "/admin/index.html?denied=1";
          return;
        }
        const nameEl = document.querySelector("[data-admin-email]");
        if (nameEl) nameEl.textContent = user.email;
        resolve(user);
      } catch (e) {
        console.error("Admin check failed (likely firestore.rules not deployed):", e);
        window.location.href = "/admin/index.html?denied=permission";
      }
    });
  });
}

export function initLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/admin/index.html";
    });
  });
}
