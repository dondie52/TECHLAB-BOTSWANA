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

    const ensureInViewReveals = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 40) {
          gsap.set(el, { opacity: 1, y: 0 });
        }
      });
    };
    ScrollTrigger.addEventListener("refresh", ensureInViewReveals);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const gallery = document.querySelector("[data-gallery]");
      const galleryPin = gallery?.querySelector("[data-gallery-pin]");
      const galleryProgress = gallery?.querySelector("[data-gallery-progress]");
      const galleryPrev = gallery?.querySelector("[data-gallery-prev]");
      const galleryNext = gallery?.querySelector("[data-gallery-next]");
      const galleryMarkers = [...(gallery?.querySelectorAll("[data-gallery-goto]") || [])];
      const projects = gsap.utils.toArray("[data-project]");

      if (!gallery || !galleryPin || !projects.length) return;

      gallery.classList.add("is-enhanced");

      let activeIndex = 0;
      let transitioning = false;
      let transitionTl = null;
      let st;

      const formatIndex = (index) =>
        `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;

      const setUiState = (index) => {
        if (galleryProgress) galleryProgress.textContent = formatIndex(index);
        galleryMarkers.forEach((marker, i) => {
          const on = i === index;
          marker.classList.toggle("is-active", on);
          marker.setAttribute("aria-selected", String(on));
        });
        if (galleryPrev) galleryPrev.disabled = index <= 0;
        if (galleryNext) galleryNext.disabled = index >= projects.length - 1;
      };

      const setProjectInteractivity = (project, on) => {
        project.querySelectorAll("a, button").forEach((el) => {
          if (on) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", "-1");
        });
      };

      const applyInstant = (index) => {
        transitionTl?.kill();
        transitionTl = null;
        transitioning = false;
        projects.forEach((project, i) => {
          const on = i === index;
          project.classList.toggle("is-active", on);
          project.setAttribute("aria-hidden", String(!on));
          if (on) project.setAttribute("aria-current", "true");
          else project.removeAttribute("aria-current");
          setProjectInteractivity(project, on);
          gsap.set(project, {
            opacity: on ? 1 : 0,
            x: 0,
            visibility: on ? "visible" : "hidden",
            pointerEvents: on ? "auto" : "none",
          });
          const visual = project.querySelector(".svc-project-visual");
          const info = project.querySelector(".svc-project-info");
          if (visual) gsap.set(visual, { clearProps: "transform,opacity" });
          if (info) gsap.set(info, { clearProps: "transform,opacity" });
        });
        activeIndex = index;
        setUiState(index);
      };

      const goTo = (index, direction = 1) => {
        const next = Math.max(0, Math.min(projects.length - 1, index));
        if (next === activeIndex) {
          setUiState(next);
          return;
        }

        transitionTl?.kill();
        transitioning = true;

        const current = projects[activeIndex];
        const incoming = projects[next];
        const dir = direction >= 0 ? 1 : -1;

        incoming.classList.add("is-active");
        incoming.setAttribute("aria-hidden", "false");
        incoming.setAttribute("aria-current", "true");
        setProjectInteractivity(incoming, true);
        current.removeAttribute("aria-current");
        setProjectInteractivity(current, false);
        setUiState(next);

        const visualOut = current.querySelector(".svc-project-visual");
        const infoOut = current.querySelector(".svc-project-info");
        const visualIn = incoming.querySelector(".svc-project-visual");
        const infoIn = incoming.querySelector(".svc-project-info");

        gsap.set(incoming, { visibility: "visible", opacity: 1, x: 0, pointerEvents: "auto" });
        gsap.set(visualIn, { x: 36 * dir, opacity: 0 });
        gsap.set(infoIn, { y: 14, opacity: 0 });

        transitionTl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 0.85 },
          onComplete: () => {
            current.classList.remove("is-active");
            current.setAttribute("aria-hidden", "true");
            gsap.set(current, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
            gsap.set([visualOut, infoOut, visualIn, infoIn], { clearProps: "transform,opacity" });
            activeIndex = next;
            setUiState(next);
            transitioning = false;
            transitionTl = null;
          },
        });

        transitionTl
          .to(visualOut, { x: -28 * dir, opacity: 0 }, 0)
          .to(infoOut, { y: -10, opacity: 0, duration: 0.5 }, 0)
          .to(visualIn, { x: 0, opacity: 1 }, 0.08)
          .to(infoIn, { y: 0, opacity: 1, duration: 0.65 }, 0.14);
      };

      applyInstant(0);

      const indexFromProgress = (progress) => {
        const steps = projects.length - 1;
        if (steps <= 0) return 0;
        return Math.round(progress * steps);
      };

      const scrollToIndex = (index) => {
        const clamped = Math.max(0, Math.min(projects.length - 1, index));
        if (!st) {
          applyInstant(clamped);
          return;
        }
        const steps = projects.length - 1;
        const progress = steps <= 0 ? 0 : clamped / steps;
        const target = st.start + (st.end - st.start) * progress;
        window.scrollTo({ top: target, behavior: "auto" });
        ScrollTrigger.update();
        goTo(clamped, clamped >= activeIndex ? 1 : -1);
      };

      st = ScrollTrigger.create({
        trigger: galleryPin,
        start: "top top",
        end: () => {
          const projectCount = projects.length;
          const transitionDistance = window.innerHeight * 0.9;
          const totalDistance = transitionDistance * Math.max(projectCount - 1, 0);
          return `+=${totalDistance}`;
        },
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (value) => {
            const steps = projects.length - 1;
            if (steps <= 0) return 0;
            return Math.round(value * steps) / steps;
          },
          duration: { min: 0.1, max: 0.25 },
          delay: 0.16,
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          const next = indexFromProgress(self.progress);
          if (next !== activeIndex && !transitioning) {
            goTo(next, self.direction);
          }
        },
        onRefresh: (self) => {
          applyInstant(indexFromProgress(self.progress));
        },
      });

      galleryPrev?.addEventListener("click", () => scrollToIndex(activeIndex - 1));
      galleryNext?.addEventListener("click", () => scrollToIndex(activeIndex + 1));
      galleryMarkers.forEach((marker) => {
        marker.addEventListener("click", () => {
          const index = Number(marker.dataset.galleryGoto);
          if (Number.isFinite(index)) scrollToIndex(index);
        });
      });

      const onKey = (event) => {
        if (!ScrollTrigger.isInViewport(galleryPin)) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollToIndex(activeIndex + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollToIndex(activeIndex - 1);
        }
      };
      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
        gallery.classList.remove("is-enhanced");
        projects.forEach((project) => {
          project.classList.add("is-active");
          project.setAttribute("aria-hidden", "false");
          project.removeAttribute("aria-current");
          gsap.set(project, { clearProps: "all" });
        });
        st?.kill();
      };
    });

    mm.add("(max-width: 768px)", () => {
      const gallery = document.querySelector("[data-gallery]");
      gallery?.classList.remove("is-enhanced");
      document.querySelectorAll("[data-project]").forEach((project) => {
        project.classList.add("is-active");
        project.setAttribute("aria-hidden", "false");
        project.removeAttribute("aria-current");
        gsap.set(project, { clearProps: "all" });
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
            target.querySelectorAll(".reveal").forEach((el) => {
              gsap.set(el, { opacity: 1, y: 0 });
            });
          });
        }
      }
    },
    { once: true },
  );
} else {
  revealContentFallback();
  document.querySelectorAll("[data-project]").forEach((project) => {
    project.classList.add("is-active");
    project.setAttribute("aria-hidden", "false");
  });
}
