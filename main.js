// ============================================================
// main.js — mobile nav toggle + language switching (EN / UR / SD)
// Translations are applied to any element with [data-i18n="key"].
// ============================================================

const SUPPORTED_LANGS = ["en", "ur", "sd"];
const DEFAULT_LANG = "ur";

function getSavedLang() {
  return localStorage.getItem("pti_lang") || DEFAULT_LANG;
}

async function loadLang(code) {
  // Load language file relative to the current page (./en.json, ./ur.json, ./sd.json).
  // This matches the repository layout where en.json / ur.json / sd.json live at the repo root.
  try {
    const res = await fetch(`./${code}.json`);
    if (!res.ok) throw new Error(`Language file not found: ${code} (status ${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to load language", code, err);
    // Fallback: if requested language failed, try default language file.
    if (code !== DEFAULT_LANG) {
      try {
        const res2 = await fetch(`./${DEFAULT_LANG}.json`);
        if (res2.ok) return await res2.json();
      } catch (e) { /* swallow */ }
    }
    return {};
  }
}

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict && dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict && dict[key]) el.setAttribute("placeholder", dict[key]);
  });
  document.body.setAttribute("dir", (dict && dict.dir) || "ltr");
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
