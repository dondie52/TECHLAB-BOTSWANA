document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revealContentFallback() {
  document.querySelectorAll(".reveal, .svc-hero-reveal, .auto-journey-step").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
  document.querySelectorAll(".auto-journey-step, .svc-feature-group").forEach((el) => {
    el.classList.add("is-active");
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

    const inboxBubbles = gsap.utils.toArray(".auto-bubble, .auto-inbox-status");
    if (inboxBubbles.length) {
      gsap.set(inboxBubbles, { y: 10, opacity: 0 });
      gsap.to(inboxBubbles, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.12,
        delay: 0.35,
        ease: "power3.out",
      });
    }

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

    const journey = document.querySelector("[data-journey]");
    const steps = gsap.utils.toArray("[data-journey-step]");
    if (journey && steps.length) {
      ScrollTrigger.create({
        trigger: journey,
        start: "top 70%",
        end: "bottom 45%",
        onUpdate: (self) => {
          const active = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          steps.forEach((step, index) => {
            step.classList.toggle("is-active", index === active);
            step.classList.toggle("is-done", index < active);
          });
        },
      });
    }

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
