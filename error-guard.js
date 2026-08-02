// ============================================================
// error-guard.js — plain (non-module) script, loaded first on
// every page. Catches script/module errors and unhandled promise
// rejections (e.g. Firebase init or permission failures) and
// shows a visible banner instead of a silent blank page.
// Safe to ignore in normal operation — it never touches the DOM
// unless something actually failed.
// ============================================================
(function () {
  var shown = false;
  function showBanner(msg) {
    if (shown) return;
    shown = true;
    var b = document.createElement("div");
    b.setAttribute("role", "alert");
    b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;background:#8A2E22;color:#fff;" +
      "padding:14px 18px;font:13.5px/1.5 -apple-system,Segoe UI,Arial,sans-serif;direction:ltr;text-align:left;";
    b.innerHTML =
      "<b>Something failed to load.</b> Open the browser console (F12) for details. " +
      "Common causes: <code>js/firebase-config.js</code> keys are wrong, or Firestore/Storage " +
      "rules aren't deployed yet.<br><span style='opacity:.85'>" +
      String(msg).replace(/</g, "&lt;").slice(0, 200) + "</span>";
    document.addEventListener("DOMContentLoaded", function () { document.body.prepend(b); });
    if (document.body) document.body.prepend(b);
  }
  window.addEventListener("error", function (e) {
    if (e && (e.message || (e.error && e.error.message))) {
      showBanner(e.message || e.error.message);
    }
  });
  window.addEventListener("unhandledrejection", function (e) {
    var msg = e && e.reason ? (e.reason.message || String(e.reason)) : "Unknown error";
    showBanner(msg);
  });
})();
