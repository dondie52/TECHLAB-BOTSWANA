document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revealContentFallback() {
  document.querySelectorAll(".reveal, .svc-hero-reveal").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
}

if (reducedMotion) {
  revealContentFallback();
}

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
}

function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("nav-open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
    setMenu(false);
  }
});

const filterRoot = document.querySelector("[data-pa-filters]");
const filterButtons = filterRoot ? Array.from(filterRoot.querySelectorAll("[data-filter]")) : [];
const appItems = Array.from(document.querySelectorAll("[data-app]"));
const statusEl = document.querySelector("[data-pa-status]");

function setFilter(category) {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  let visible = 0;
  appItems.forEach((item) => {
    const match = category === "all" || item.dataset.category === category;
    item.hidden = !match;
    item.classList.toggle("is-filtered-out", !match);
    if (match) visible += 1;
  });

  if (statusEl) {
    statusEl.textContent = `Showing ${visible} app${visible === 1 ? "" : "s"}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter || "all");
  });
});

if (filterButtons.length) {
  setFilter("all");
}

if (window.gsap && window.ScrollTrigger && !reducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.context(() => {
    gsap.set(".svc-hero-reveal", { y: 22, opacity: 0 });
    gsap.to(".svc-hero-reveal", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
    });

    gsap.fromTo(
      ".svc-signal-line",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".svc-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    gsap.utils.toArray(".reveal").forEach((element) => {
      gsap.from(element, {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    });

    gsap.from(".svc-cta-inner > *", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".svc-cta",
        start: "top 82%",
      },
    });
  });

  window.addEventListener(
    "load",
    () => {
      ScrollTrigger.refresh();
      if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
          requestAnimationFrame(() => {
            target.scrollIntoView({ block: "start" });
            ScrollTrigger.refresh();
          });
        }
      }
    },
    { once: true },
  );
} else {
  revealContentFallback();
}
