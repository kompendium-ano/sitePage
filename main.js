/* =====================================================================
   Kompendium, LLC — interactions
   ===================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      menu.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Auto-tag section children as reveal targets for a staggered feel */
  document.querySelectorAll(".acc-card, .cap, .work, .infra-stat").forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 0.07 + "s";
    if (reduceMotion) { el.classList.add("is-in"); return; }
  });
  // re-observe the newly tagged ones
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io2.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".acc-card, .cap, .work, .infra-stat").forEach(function (el) { io2.observe(el); });
  }

  /* ---------- Ecosystem diagram: draw edges + interaction ---------- */
  var eco = document.getElementById("ecosystem");
  if (eco) {
    var svg = eco.querySelector(".ecosystem__svg");
    var edgesGroup = svg.querySelector(".edges");
    var core = svg.querySelector('[data-node="core"]');
    var satellites = Array.prototype.slice.call(svg.querySelectorAll('.node:not(.node--core)'));

    // Parse translate() to get node centers
    var getCenter = function (g) {
      var t = g.getAttribute("transform") || "";
      var m = t.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
      return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
    };
    var c = getCenter(core);
    var coreR = 58, satR = 38;

    satellites.forEach(function (sat) {
      var p = getCenter(sat);
      var dx = p.x - c.x, dy = p.y - c.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len;
      var x1 = c.x + ux * coreR, y1 = c.y + uy * coreR;
      var x2 = p.x - ux * satR, y2 = p.y - uy * satR;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M" + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1));
      path.setAttribute("data-edge", sat.getAttribute("data-node"));
      edgesGroup.appendChild(path);
    });

    // Content for the side panel
    var PANEL = {
      core:        ["The hub", "Kompendium", "One team across the whole Accumulate stack — from the wallet in users' hands to the nodes securing the chain."],
      wallet:      ["Product", "ACCU2 mobile wallet", "We designed and built Accumulate's official mobile wallet end to end for iOS and Android."],
      coredev:     ["Engineering", "Core development support", "We contribute directly to Accumulate's core protocol development alongside the network's engineers."],
      tooling:     ["Engineering", "Developer tooling", "A primary author of the libraries and SDKs other teams use to build on Accumulate."],
      governance:  ["Stewardship", "Network governance", "A standing member of the Accumulate governance committee, shaping the network's direction."],
      governance2: ["Protocol", "Protocol contributions", "Ongoing contributions to the protocol and specifications that define how Accumulate works."],
      validator:   ["Infrastructure", "Validator node", "We operate a validator node, helping secure consensus and keep the network live."],
      bridge:      ["Infrastructure", "Bridge node", "We run a bridge node, moving value and data between Accumulate and connected chains."]
    };
    var panel = document.getElementById("ecoPanel");
    var pLabel = panel.querySelector(".ecosystem__panel-label");
    var pTitle = panel.querySelector(".ecosystem__panel-title");
    var pBody  = panel.querySelector(".ecosystem__panel-body");

    var activate = function (key, nodeEl) {
      var data = PANEL[key];
      if (!data) return;
      pLabel.textContent = data[0];
      pTitle.textContent = data[1];
      pBody.textContent = data[2];
      svg.querySelectorAll(".node").forEach(function (n) { n.classList.remove("is-active"); });
      svg.querySelectorAll(".edges path").forEach(function (e) { e.style.opacity = "0.35"; });
      if (nodeEl) nodeEl.classList.add("is-active");
      var edge = svg.querySelector('.edges path[data-edge="' + key + '"]');
      if (edge) { edge.style.opacity = "1"; edge.style.stroke = "var(--blue)"; }
    };
    var resetEdges = function () {
      svg.querySelectorAll(".edges path").forEach(function (e) { e.style.opacity = ""; e.style.stroke = ""; });
      svg.querySelectorAll(".node").forEach(function (n) { n.classList.remove("is-active"); });
    };

    svg.querySelectorAll(".node").forEach(function (node) {
      var key = node.getAttribute("data-node");
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      var cap = node.querySelector(".node__cap, .node__cap--core");
      node.setAttribute("aria-label", cap ? cap.textContent : key);
      node.addEventListener("mouseenter", function () { activate(key, node); });
      node.addEventListener("focus", function () { activate(key, node); });
      node.addEventListener("blur", resetEdges);
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(key, node); }
      });
    });
    eco.addEventListener("mouseleave", resetEdges);
  }

  /* ---------- Count-up stats ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }
})();
