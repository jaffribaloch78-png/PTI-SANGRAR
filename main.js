// ============================================================
// main.js — mobile nav toggle + language switching (EN / UR / SD)
// Translations are applied to any element with [data-i18n="key"].
// This loader is robust: it tries multiple paths so hosting under
// a subpath or root both work (./lang/, ./, and /).
// ============================================================

const SUPPORTED_LANGS = ["en", "ur", "sd"];
const DEFAULT_LANG = "ur";

function getSavedLang() {
  return localStorage.getItem("pti_lang") || DEFAULT_LANG;
}

async function tryFetchPaths(paths) {
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        console.debug("Loaded language file:", p);
        return res.json();
      }
    } catch (e) {
      // continue to next
    }
  }
  throw new Error("All language fetch attempts failed: " + paths.join(", "));
}

async function loadLang(code) {
  // Candidate locations (try in order):
  // 1) ./lang/{code}.json (if you later move files into /lang/)
  // 2) ./{code}.json (current repo root)
  // 3) /{code}.json (absolute root)
  // 4) fallback to en.json if requested file missing
  const paths = [
    `./lang/${code}.json`,
    `./${code}.json`,
    `/${code}.json`,
  ];
  try {
    return await tryFetchPaths(paths);
  } catch (e) {
    console.warn("Failed to load language", code, "; falling back to English.");
    // final fallback: explicit English paths
    const fallback = [`./en.json`, `./lang/en.json`, `/en.json`];
    try {
      return await tryFetchPaths(fallback);
    } catch (err) {
      console.error("Failed to load fallback language files.", err);
      return {};
    }
  }
}

function setElementTextPreserveChildren(el, text) {
  // Replace only the first direct TEXT_NODE child, preserve other child elements (icons, spans).
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = text;
      return;
    }
  }
  // No direct text node found — prepend the text node so icons remain visually after text.
  el.insertBefore(document.createTextNode(text), el.firstChild);
}

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict && typeof dict[key] !== 'undefined') {
      setElementTextPreserveChildren(el, dict[key]);
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict && typeof dict[key] !== 'undefined') el.setAttribute("placeholder", dict[key]);
  });
  // apply direction; if not present, don't override existing dir to avoid flash
  if (dict && dict.dir) {
    document.body.setAttribute("dir", dict.dir);
  }
  document.documentElement.setAttribute("lang", window.__currentLang || DEFAULT_LANG);
  document.body.classList.toggle("lang-sd", window.__currentLang === "sd");
}

async function setLang(code) {
  if (!SUPPORTED_LANGS.includes(code)) code = DEFAULT_LANG;
  window.__currentLang = code;
  localStorage.setItem("pti_lang", code);
  const dict = await loadLang(code);
  window.__dict = dict;
  applyTranslations(dict);
  document.querySelectorAll(".lang-switch button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === code);
  });
}

function initLangSwitch() {
  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
  // ensure we set current lang after wiring buttons
  setLang(getSavedLang());
}

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.style.display === "flex";
    links.style.display = open ? "none" : "flex";
  });
}

// Animated count-up for .stat b[data-count], respects reduced motion
function initStatCounters() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".stat b[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReduced) { el.textContent = target.toLocaleString(); return; }
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = cur.toLocaleString();
    }, 25);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitch();
  initNavToggle();
  initStatCounters();
});
