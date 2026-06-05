/**
 * Scripts de arranque inyectados en el <head> del layout raíz mediante
 * dangerouslySetInnerHTML. Deben ejecutarse antes de la hidratación y, por
 * ser contenido inline opaco para React 19, no disparan el warning
 * "Encountered a script tag while rendering React component".
 */

export const THEME_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var saved = window.localStorage.getItem("portfolio-theme");
    var theme = saved === "light" || saved === "dark" ? saved : "dark";
    var doc = document.documentElement;
    doc.setAttribute("data-theme", theme);
    if (theme === "light") {
      doc.style.setProperty("--bg-color", "#e8eaed");
      doc.style.setProperty("--loading-bg", "#f1f2f4");
    } else {
      doc.style.setProperty("--bg-color", "#323232");
      doc.style.setProperty("--loading-bg", "#1f1f1f");
    }
  } catch (_err) {}
})();`;

export const HYDRATION_SANITIZER_SCRIPT = `(function () {
  function run() {
    try {
      function stripBisAttrs(node) {
        if (!node || node.nodeType !== 1) return;
        node.removeAttribute("bis_skin_checked");
        node.removeAttribute("bis_register");
        node.removeAttribute("bis_use");
      }
      function cleanBisAttributes(root) {
        stripBisAttrs(root);
        var scope = root && root.querySelectorAll ? root : document;
        var nodes = scope.querySelectorAll("[bis_skin_checked], [bis_register], [bis_use]");
        for (var i = 0; i < nodes.length; i++) stripBisAttrs(nodes[i]);
      }
      cleanBisAttributes(document.documentElement);
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          if (mutation.type === "attributes") {
            stripBisAttrs(mutation.target);
          }
          if (mutation.type === "childList") {
            for (var j = 0; j < mutation.addedNodes.length; j++) {
              cleanBisAttributes(mutation.addedNodes[j]);
            }
          }
        }
      });
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["bis_skin_checked", "bis_register", "bis_use"]
      });
      setTimeout(function () { observer.disconnect(); }, 5000);
    } catch (_err) {}
  }
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run);
  } else {
    setTimeout(run, 200);
  }
})();`;
