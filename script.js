/* yaass theme — vanilla JS */
(function () {
  "use strict";

  function renderStars(el) {
    var rating = parseFloat(el.getAttribute("data-rating")) || 0;
    if (rating < 0) rating = 0;
    if (rating > 5) rating = 5;

    var full = Math.floor(rating);
    var half = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;

    var out = "";
    for (var i = 0; i < full; i++) out += '<span class="s-full">★</span>';
    if (half) out += '<span class="s-half">★</span>';
    for (var j = 0; j < empty; j++) out += '<span class="s-empty">★</span>';

    el.innerHTML = out;
    el.setAttribute("aria-label", rating + " out of 5");
    el.setAttribute("role", "img");
  }

  function initStars() {
    var nodes = document.querySelectorAll(".stars");
    for (var i = 0; i < nodes.length; i++) renderStars(nodes[i]);
  }

  /* FAQ accordion — native <details> handles open/close;
     here we ensure only one stays open at a time for a tidy feel. */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener("toggle", function () {
        if (!this.open) return;
        for (var k = 0; k < items.length; k++) {
          if (items[k] !== this) items[k].removeAttribute("open");
        }
      });
    }
  }

  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function initCtaDebug() {
    var links = document.querySelectorAll(
      'a[target="_blank"][rel~="nofollow"]'
    );
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        console.debug("CTA click:", this.href);
      });
    }
  }

  /* ===== Mobile burger menu ===== */
  function initBurger() {
    var burger = document.querySelector(".burger");
    var nav = document.getElementById("primary-nav");
    if (!burger || !nav) return;

    var icon = burger.querySelector(".burger-icon");

    function setOpen(open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (icon) icon.textContent = open ? "✕" : "☰";
    }

    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav-link")) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) setOpen(false);
    });
  }

  /* ===== Scroll reveal ===== */
  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) {
            entries[j].target.classList.add("is-visible");
            observer.unobserve(entries[j].target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    for (var k = 0; k < nodes.length; k++) observer.observe(nodes[k]);
  }

  /* ===== Countdown timer ===== */
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function initCountdown() {
    var box = document.querySelector(".countdown");
    if (!box) return;

    var hours = parseInt(box.getAttribute("data-countdown-hours"), 10);
    if (!hours || hours < 0) hours = 24;

    var span = hours * 60 * 60 * 1000;
    var storeKey = "yaass_countdown_" + hours;

    var daysEl = box.querySelector('[data-unit="days"]');
    var hoursEl = box.querySelector('[data-unit="hours"]');
    var minsEl = box.querySelector('[data-unit="minutes"]');
    var secsEl = box.querySelector('[data-unit="seconds"]');

    function getDeadline() {
      var stored = null;
      try {
        stored = parseInt(window.localStorage.getItem(storeKey), 10);
      } catch (e) {
        stored = null;
      }
      var now = Date.now();
      if (!stored || isNaN(stored) || stored <= now) {
        stored = now + span;
        try {
          window.localStorage.setItem(storeKey, String(stored));
        } catch (e) {}
      }
      return stored;
    }

    var deadline = getDeadline();

    function tick() {
      var diff = deadline - Date.now();
      if (diff <= 0) {
        deadline = Date.now() + span;
        try {
          window.localStorage.setItem(storeKey, String(deadline));
        } catch (e) {}
        diff = span;
      }

      var totalSec = Math.floor(diff / 1000);
      var d = Math.floor(totalSec / 86400);
      var h = Math.floor((totalSec % 86400) / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;

      if (daysEl) daysEl.textContent = pad(d);
      if (hoursEl) hoursEl.textContent = pad(h);
      if (minsEl) minsEl.textContent = pad(m);
      if (secsEl) secsEl.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ===== Sticky mobile CTA ===== */
  function initStickyCta() {
    var bar = document.querySelector(".sticky-cta");
    if (!bar) return;

    var hero = document.querySelector(".hero");
    var footer = document.querySelector("footer");

    var footerVisible = false;

    function heroThreshold() {
      var h = hero ? hero.offsetHeight : 0;
      return h > 0 ? h : 400;
    }

    function update() {
      var pastHero = window.pageYOffset > heroThreshold();
      var show = pastHero && !footerVisible;
      bar.classList.toggle("show", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
    }

    if (footer && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          footerVisible = entries[0].isIntersecting;
          update();
        },
        { threshold: 0 }
      );
      observer.observe(footer);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStars();
    initFaq();
    initSmoothScroll();
    initCtaDebug();
    initBurger();
    initReveal();
    initCountdown();
    initStickyCta();
  });
})();
