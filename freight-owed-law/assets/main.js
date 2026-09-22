/* Carrier Counsel — site scripts (no dependencies) */
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  // Mark current page in nav
  var here = location.pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "/index.html");
  document.querySelectorAll(".nav a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var target = new URL(href, location.href).pathname.replace(/\/$/, "/index.html");
    if (target === here) a.setAttribute("aria-current", "page");
  });

  // Reveal-on-scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Claim evaluation form
  var form = document.querySelector("form[data-claim-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      if (form.querySelector('[name="_gotcha"]').value) return; // honeypot

      var data = new FormData(form);
      var action = form.getAttribute("action") || "";
      var configured = action && action.indexOf("YOUR_FORM_ID") === -1;

      if (!configured) {
        // No form backend configured yet: fall back to a pre-filled email.
        var to = form.getAttribute("data-mailto") || "intake@carriercounsel.com";
        var lines = [];
        data.forEach(function (v, k) { if (k !== "_gotcha" && v) lines.push(k + ": " + v); });
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Claim evaluation request") +
          "&body=" + encodeURIComponent(lines.join("\n"));
        status.textContent = "Opening your email client with the details pre-filled. If nothing opens, email " + to + " directly.";
        status.classList.add("ok");
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = "Sending…";
      fetch(action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error("bad status"); })
        .then(function () {
          form.reset();
          status.textContent = "Thanks. We received your request and will reach out within one business day.";
          status.classList.add("ok");
        })
        .catch(function () {
          status.textContent = "Something went wrong sending the form. Please email intake@carriercounsel.com.";
          status.classList.add("err");
        })
        .finally(function () { btn.disabled = false; btn.textContent = "Request free evaluation"; });
    });
  }
})();
