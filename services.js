document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revealContentFallback() {
  document.querySelectorAll(".reveal, .svc-hero-reveal, .svc-feature-group, .svc-process-step").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
  document.querySelectorAll(".svc-feature-group").forEach((group) => {
    group.classList.add("is-active");
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

/* ---------- Service finder ---------- */
const FINDER_MAP = {
  security: {
    label: "Recommended: Security Systems",
    copy: "CCTV with recording and mobile viewing is usually the right starting point for shops, offices and homes.",
    message: "Hello TechLab Botswana, I would like help with CCTV installation. My location is ______.",
    anchor: "#security",
  },
  pos: {
    label: "Recommended: Retail Technology",
    copy: "A POS terminal with printer, cash drawer and basic staff guidance keeps everyday checkout reliable.",
    message: "Hello TechLab Botswana, I would like help with a POS system. My location is ______.",
    anchor: "#retail",
  },
  website: {
    label: "Recommended: Websites & Digital",
    copy: "A clean responsive website with contact and WhatsApp integration helps customers find and trust your business. Open the Websites page for packages and selected work.",
    message: "Hello TechLab Botswana, I would like help with a website. My location is ______.",
    href: "websites.html",
  },
  automation: {
    label: "Recommended: Messaging Automation",
    copy: "A shared inbox with auto-replies and lead routing keeps WhatsApp and social enquiries from getting lost. Open the Automation page for packages.",
    message: "Hello TechLab Botswana, I would like help with messaging automation. My location is ______.",
    href: "automation.html",
  },
  repair: {
    label: "Recommended: Computer Repairs",
    copy: "Diagnostics, slow-computer troubleshooting and software fixes are handled from our Mahalapye workshop.",
    message: "Hello TechLab Botswana, I would like help with computer repairs. My location is ______.",
    anchor: "#infrastructure",
  },
  wifi: {
    label: "Recommended: Wi-Fi & Networking",
    copy: "Router setup, coverage improvement and small-office networking usually solve unreliable connections.",
    message: "Hello TechLab Botswana, I would like help with Wi-Fi and networking. My location is ______.",
    anchor: "#infrastructure",
  },
  office: {
    label: "Recommended: Office Technology Setup",
    copy: "Printers, shared devices and software setup can be configured as one practical office stack.",
    message: "Hello TechLab Botswana, I would like help setting up office technology. My location is ______.",
    anchor: "#infrastructure",
  },
  support: {
    label: "Recommended: Business IT Support",
    copy: "Scheduled maintenance, remote troubleshooting and on-site support keep systems productive after installation.",
    message: "Hello TechLab Botswana, I would like ongoing IT support. My location is ______.",
    anchor: "#infrastructure",
  },
  unsure: {
    label: "Recommended: Start with a conversation",
    copy: "Tell us what is not working and where you are. We will recommend a practical next step.",
    message: "Hello TechLab Botswana, I am not sure which service I need. My location is ______. Can you help me figure out the right solution?",
    anchor: "#cta",
  },
};

const finder = document.querySelector("[data-finder]");
const finderResult = document.querySelector("[data-finder-result]");
const finderLabel = document.querySelector("[data-finder-label]");
const finderCopy = document.querySelector("[data-finder-copy]");
const finderWa = document.querySelector("[data-finder-wa]");
const finderOptions = [...(finder?.querySelectorAll(".svc-finder-option") || [])];

function selectFinderOption(button) {
  const key = button.dataset.service;
  const entry = FINDER_MAP[key];
  if (!entry) return;

  finderOptions.forEach((option) => {
    option.setAttribute("aria-selected", String(option === button));
  });

  finderResult.classList.remove("is-updating");
  void finderResult.offsetWidth;
  finderResult.classList.add("is-updating");

  finderLabel.textContent = entry.label;
  finderCopy.textContent = entry.copy;
  finderWa.href = `https://wa.me/26776984827?text=${encodeURIComponent(entry.message)}`;
  finderResult.hidden = false;

  document.querySelectorAll(".svc-pin-section, .svc-infra").forEach((el) => {
    el.classList.remove("is-highlighted");
  });

  if (entry.href) {
    const explore = finderResult.querySelector("[data-finder-explore]");
    if (explore) {
      explore.hidden = false;
      explore.href = entry.href;
      explore.textContent = entry.href.includes("automation") ? "Open Automation page" : "Open Websites page";
    }
    return;
  }

  const explore = finderResult.querySelector("[data-finder-explore]");
  if (explore) explore.hidden = true;

  const target = document.querySelector(entry.anchor);
  target?.classList.add("is-highlighted");
}

finderOptions.forEach((button) => {
  button.addEventListener("click", () => selectFinderOption(button));
});

finder?.addEventListener("keydown", (event) => {
  const currentIndex = finderOptions.indexOf(document.activeElement);
  if (currentIndex < 0) return;

  let next = currentIndex;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    next = (currentIndex + 1) % finderOptions.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    next = (currentIndex - 1 + finderOptions.length) % finderOptions.length;
  } else if (event.key === "Home") {
    event.preventDefault();
    next = 0;
  } else if (event.key === "End") {
    event.preventDefault();
    next = finderOptions.length - 1;
  } else {
    return;
  }

  finderOptions[next].focus();
});

/* ---------- Infrastructure selector ---------- */
const INFRA_CONTENT = {
  repairs: {
    heading: "Computer Repairs",
    node: "computers",
    items: [
      "Laptop diagnostics",
      "Slow-computer troubleshooting",
      "Software faults",
      "Storage and memory upgrades",
      "Operating-system installation",
    ],
  },
  wifi: {
    heading: "Wi-Fi & Networking",
    node: "router",
    items: [
      "Router setup",
      "Wi-Fi coverage improvement",
      "Small-office networks",
      "Network cabling",
      "Connectivity troubleshooting",
    ],
  },
  printers: {
    heading: "Printers & Office Equipment",
    node: "printers",
    items: [
      "Printer installation",
      "Wireless printing",
      "Driver setup",
      "Shared-office printing",
      "Printer troubleshooting",
    ],
  },
  software: {
    heading: "Software & Device Setup",
    node: "computers",
    items: [
      "Operating-system setup",
      "Application installation",
      "Software updates",
      "Antivirus installation",
      "New-computer setup",
    ],
  },
  backup: {
    heading: "Data Backup",
    node: "backup",
    items: [
      "Local backup setup",
      "Cloud backup configuration",
      "File-transfer assistance",
      "Basic data-recovery assessment",
      "Ongoing backup checks",
    ],
  },
  email: {
    heading: "Business Email & Cloud",
    node: "support",
    items: [
      "Professional email setup",
      "Domain email connection",
      "Account configuration",
      "Email across computers and phones",
      "Cloud file-sharing setup",
    ],
  },
  support: {
    heading: "Business IT Support",
    node: "support",
    items: [
      "Scheduled maintenance",
      "Remote troubleshooting",
      "On-site support",
      "Office technology setup",
      "Ongoing technical assistance",
    ],
  },
  nationwide: {
    heading: "Nationwide Support",
    node: "internet",
    items: [
      "Mahalapye workshop base",
      "Remote assistance",
      "Mobile technician coordination",
      "Support across Botswana",
      "Practical next-step guidance",
    ],
  },
};

const infraBoard = document.querySelector("[data-infra-board]");
const infraTabs = [...(infraBoard?.querySelectorAll("[data-infra-tab]") || [])];
const infraHeading = infraBoard?.querySelector("[data-infra-heading]");
const infraList = infraBoard?.querySelector("[data-infra-list]");

function setInfraActive(tab) {
  const key = tab.dataset.infraTab;
  const entry = INFRA_CONTENT[key];
  if (!entry) return;

  infraTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });

  infraHeading.textContent = entry.heading;
  infraList.innerHTML = entry.items.map((item) => `<li>${item}</li>`).join("");

  infraBoard.querySelectorAll(".svc-node, .svc-line").forEach((el) => {
    el.classList.remove("is-active");
  });
  infraBoard.querySelectorAll(`[data-node="${entry.node}"], [data-line="${entry.node}"]`).forEach((el) => {
    el.classList.add("is-active");
  });
  infraBoard.querySelector('[data-node="hub"]')?.classList.add("is-active");
}

infraTabs.forEach((tab) => {
  tab.addEventListener("click", () => setInfraActive(tab));
});

if (infraTabs[0]) {
  setInfraActive(infraTabs[0]);
}

/* ---------- Lazy media ---------- */
const loadedVideos = new WeakSet();

function hydrateVideo(video) {
  if (!video || loadedVideos.has(video)) return;
  const sources = video.querySelectorAll("source[data-src]");
  if (!sources.length) return;

  sources.forEach((source) => {
    source.src = source.dataset.src;
    source.removeAttribute("data-src");
  });
  video.load();
  loadedVideos.add(video);

  const onReady = () => {
    video.classList.add("is-ready");
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };

  if (video.readyState >= 1) onReady();
  else video.addEventListener("loadedmetadata", onReady, { once: true });
}

function observeNearMedia() {
  const videos = document.querySelectorAll("video[data-scrub-video]");
  if (!("IntersectionObserver" in window)) {
    videos.forEach(hydrateVideo);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          hydrateVideo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "35% 0px" },
  );

  videos.forEach((video) => observer.observe(video));
}

observeNearMedia();

function createScrubController(video) {
  let raf = 0;
  let target = 0;
  let active = false;

  const tick = () => {
    raf = 0;
    if (!video.duration || Number.isNaN(video.duration)) return;
    const next = Math.min(Math.max(target, 0), video.duration - 0.05);
    if (Math.abs(video.currentTime - next) > 0.04) {
      try {
        video.currentTime = next;
      } catch {
        /* ignore seek failures */
      }
    }
    if (active) raf = requestAnimationFrame(tick);
  };

  return {
    setProgress(progress) {
      if (!video.duration) return;
      target = progress * video.duration;
      active = true;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    pause() {
      active = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
  };
}

function activateFeatureGroup(section, progress) {
  const groups = [...section.querySelectorAll("[data-feature-group]")];
  if (!groups.length) return;
  const index = Math.min(groups.length - 1, Math.floor(progress * groups.length));
  groups.forEach((group, i) => group.classList.toggle("is-active", i === index));
}

/* ---------- GSAP ---------- */
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

    mm.add("(min-width: 901px)", () => {
      const cctvSection = document.querySelector('[data-pin-section="cctv"]');
      const cctvStage = cctvSection?.querySelector("[data-pin-stage]");
      const cctvVideo = cctvSection?.querySelector("[data-scrub-video]");
      const cctvScrub = cctvVideo ? createScrubController(cctvVideo) : null;

      if (cctvStage) {
        const cctvTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: cctvSection,
            start: "top top",
            end: "+=160%",
            scrub: true,
            pin: cctvStage,
            anticipatePin: 1,
            onEnter: () => hydrateVideo(cctvVideo),
            onEnterBack: () => hydrateVideo(cctvVideo),
            onUpdate: (self) => {
              activateFeatureGroup(cctvSection, Math.min(1, Math.max(0, (self.progress - 0.28) / 0.45)));
              cctvScrub?.setProgress(self.progress);
            },
            onLeave: () => cctvScrub?.pause(),
            onLeaveBack: () => cctvScrub?.pause(),
          },
        });

        cctvTl
          .fromTo(cctvSection.querySelector(".svc-pin-media"), { xPercent: 8, opacity: 0.85 }, { xPercent: 0, opacity: 1, duration: 0.25 }, 0)
          .fromTo(".svc-cctv .svc-focus-brackets", { opacity: 0.35, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.18 }, 0.15)
          .fromTo(".svc-cctv .svc-scanline", { top: "18%", opacity: 0 }, { top: "68%", opacity: 0.7, duration: 0.28 }, 0.35)
          .to(cctvSection.querySelector(".svc-pin-media"), { scale: 1.12, xPercent: 3, duration: 0.22 }, 0.72)
          .to(".svc-cctv .svc-lens-mask", { opacity: 0.8, duration: 0.16 }, 0.8);
      }

      const posSection = document.querySelector('[data-pin-section="pos"]');
      const posStage = posSection?.querySelector("[data-pin-stage]");
      const posVideo = posSection?.querySelector("[data-scrub-video]");
      const posScrub = posVideo ? createScrubController(posVideo) : null;

      if (posStage) {
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: posSection,
            start: "top top",
            end: "+=150%",
            scrub: true,
            pin: posStage,
            anticipatePin: 1,
            onEnter: () => hydrateVideo(posVideo),
            onEnterBack: () => hydrateVideo(posVideo),
            onUpdate: (self) => {
              activateFeatureGroup(posSection, Math.min(1, Math.max(0, (self.progress - 0.25) / 0.5)));
              posScrub?.setProgress(self.progress);
            },
            onLeave: () => posScrub?.pause(),
            onLeaveBack: () => posScrub?.pause(),
          },
        })
          .fromTo(posSection.querySelector(".svc-pin-media"), { scale: 0.97, opacity: 0.85 }, { scale: 1, opacity: 1, duration: 0.22 }, 0)
          .fromTo(".svc-receipt-paper", { height: 0, opacity: 0 }, { height: 96, opacity: 1, duration: 0.22 }, 0.35)
          .fromTo(".svc-confirm-pulse", { opacity: 0, scale: 0.75 }, { opacity: 0.7, scale: 1.1, duration: 0.14 }, 0.72)
          .to(posSection.querySelector(".svc-pin-media"), { scale: 1.08, duration: 0.18 }, 0.8);
      }

      /* Gallery handled in separate matchMedia below */
    });

    mm.add("(min-width: 769px)", () => {
      if (reducedMotion) return;

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

    mm.add("(max-width: 900px)", () => {
      document.querySelectorAll(".svc-feature-group").forEach((group) => {
        group.classList.toggle("is-active", true);
        group.style.opacity = "1";
      });

      if (window.matchMedia("(max-width: 768px)").matches) {
        const gallery = document.querySelector("[data-gallery]");
        gallery?.classList.remove("is-enhanced");
        document.querySelectorAll("[data-project]").forEach((project) => {
          project.classList.add("is-active");
          project.setAttribute("aria-hidden", "false");
          project.removeAttribute("aria-current");
          gsap.set(project, { clearProps: "all" });
        });
      }

      gsap.utils.toArray(".svc-pin-section").forEach((section) => {
        const media = section.querySelector(".svc-pin-media");
        const copy = section.querySelector(".svc-pin-copy");
        if (media) {
          gsap.fromTo(
            media,
            { y: 18, opacity: 0.75 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 82%" },
            },
          );
        }
        if (copy) {
          gsap.fromTo(
            copy,
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: copy, start: "top 88%" },
            },
          );
        }
      });
    });

    const processSection = document.querySelector(".svc-process");
    if (processSection) {
      const steps = gsap.utils.toArray(".svc-process-step");
      const fill = document.querySelector("[data-process-fill]");

      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: processSection,
          start: "top 70%",
          end: "bottom 55%",
          scrub: true,
          onUpdate: (self) => {
            const active = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
            steps.forEach((step, index) => {
              step.classList.toggle("is-active", index === active);
              step.classList.toggle("is-done", index < active);
            });
          },
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

    const heroVideo = document.querySelector(".svc-hero-video");
    if (heroVideo) {
      const heroScrub = createScrubController(heroVideo);
      ScrollTrigger.create({
        trigger: ".svc-hero",
        start: "top top",
        end: "bottom top",
        onEnter: () => hydrateVideo(heroVideo),
        onEnterBack: () => hydrateVideo(heroVideo),
        onUpdate: (self) => heroScrub.setProgress(Math.min(self.progress * 0.8, 1)),
        onLeave: () => heroScrub.pause(),
        onLeaveBack: () => heroScrub.pause(),
      });
    }
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

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.querySelectorAll("video").forEach((video) => video.pause());
    }
  });
} else {
  revealContentFallback();
  document.querySelectorAll(".svc-feature-group").forEach((group) => {
    group.classList.add("is-active");
  });
}
