// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Mobile nav
const navToggle = $(".nav-toggle");
const navLinks = $("#nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close nav after click (mobile)
  $$("[data-link]").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Scroll reveal (IntersectionObserver)
const revealEls = $$("[data-reveal]");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = Number(el.getAttribute("data-reveal-delay") || 0);
      setTimeout(() => el.classList.add("in"), delay);
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Active nav link based on section in view
const sections = ["about", "skills", "projects", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navMap = new Map();
$$(".nav-links a").forEach((a) => {
  const hash = a.getAttribute("href");
  if (hash && hash.startsWith("#")) navMap.set(hash.slice(1), a);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      // clear all
      navMap.forEach((a) => a.classList.remove("active"));
      const active = navMap.get(id);
      if (active) active.classList.add("active");
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((s) => sectionObserver.observe(s));

// Project modal
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalDesc = $("#modalDesc");
const modalStack = $("#modalStack");
const modalLinks = $("#modalLinks");

function openModal({ title, desc, stack, links }) {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  if (modalTitle) modalTitle.textContent = title || "Project";
  if (modalDesc) modalDesc.textContent = desc || "";
  if (modalStack) modalStack.textContent = stack || "";

  if (modalLinks) {
    modalLinks.innerHTML = "";
    (links || []).forEach((l) => {
      const a = document.createElement("a");
      a.className = "btn";
      a.textContent = l.label || "Link";
      a.href = l.href || "#";
      a.target = "_blank";
      a.rel = "noreferrer";
      modalLinks.appendChild(a);
    });
  }

  // lock scroll
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$$("[data-project]").forEach((card) => {
  card.setAttribute("tabindex", "0");
  card.addEventListener("click", () => {
    const title = card.getAttribute("data-title");
    const desc = card.getAttribute("data-desc");
    const stack = card.getAttribute("data-stack");
    let links = [];
    try {
      links = JSON.parse(card.getAttribute("data-links") || "[]");
    } catch {}
    openModal({ title, desc, stack, links });
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });
});

$$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Animated counters
const counters = $$("[data-counter]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute("data-counter") || 0);
      animateCount(el, target, 800);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);

counters.forEach((c) => counterObserver.observe(c));

function animateCount(el, target, durationMs) {
  const start = performance.now();
  const from = 0;

  function tick(now) {
    const t = Math.min(1, (now - start) / durationMs);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(from + (target - from) * eased);
    el.textContent = String(value);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

