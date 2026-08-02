// ============================================================
// admin-submissions.js — read-only list of form submissions,
// with status updates for complaints (new → in_progress → resolved).
// Public users can only CREATE these documents (see firestore.rules);
// only admins can read or update them.
// ============================================================
import { db } from "../../js/firebase-config.js";
import {
  collection, getDocs, doc, updateDoc, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const tabs = document.querySelectorAll("[data-tab]");
const tableBody = document.getElementById("subList");
const theadRow = document.getElementById("subHead");

const CONFIGS = {
  members: { cols: ["name", "phone", "cnic", "address", "email"], headers: ["Name", "Phone", "CNIC", "Address", "Email"] },
  volunteers: { cols: ["name", "phone", "unionCouncil", "interest"], headers: ["Name", "Phone", "Union Council", "Interest"] },
  complaints: { cols: ["name", "phone", "subject", "message"], headers: ["Name", "Phone", "Subject", "Message"], hasStatus: true },
  messages: { cols: ["name", "phone", "message"], headers: ["Name", "Phone", "Message"] },
};

let current = "complaints";

async function load(tabName) {
  current = tabName;
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tabName));
  const cfg = CONFIGS[tabName];
  theadRow.innerHTML = cfg.headers.map((h) => `<th>${h}</th>`).join("") + (cfg.hasStatus ? "<th>Status</th>" : "") + "<th></th>";
  tableBody.innerHTML = `<tr><td colspan="8">Loading…</td></tr>`;

  const snap = await getDocs(query(collection(db, tabName), orderBy("submittedAt", "desc")));
  if (snap.empty) {
    tableBody.innerHTML = `<tr><td colspan="8">No submissions yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = snap.docs.map((d) => {
    const data = d.data();
    const cells = cfg.cols.map((c) => `<td>${(data[c] || "").toString().slice(0, 80)}</td>`).join("");
    const statusCell = cfg.hasStatus
      ? `<td>
           <select data-status-for="${d.id}">
             <option value="new" ${data.status === "new" ? "selected" : ""}>New</option>
             <option value="in_progress" ${data.status === "in_progress" ? "selected" : ""}>In Progress</option>
             <option value="resolved" ${data.status === "resolved" ? "selected" : ""}>Resolved</option>
           </select>
         </td>`
      : "";
    return `<tr>${cells}${statusCell}<td></td></tr>`;
  }).join("");

  if (cfg.hasStatus) {
    tableBody.querySelectorAll("[data-status-for]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        try {
          await updateDoc(doc(db, tabName, sel.dataset.statusFor), { status: sel.value });
        } catch (e) {
          console.error(e);
          alert("Could not update status.");
        }
      });
    });
  }
}

tabs.forEach((t) => t.addEventListener("click", () => load(t.dataset.tab)));
load(current);
