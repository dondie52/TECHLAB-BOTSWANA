document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");
const quoteSubmitButton = quoteForm?.querySelector('button[type="submit"]');
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 640px)").matches;
const supabaseConfig = window.TECHLAB_SUPABASE ?? null;
const supabaseClient =
  window.supabase?.createClient &&
  supabaseConfig?.url &&
  supabaseConfig?.publishableKey
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
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

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!quoteForm.reportValidity()) {
    return;
  }

  const formData = new FormData(quoteForm);
  const details = {
    name: formData.get("name")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim(),
    location: formData.get("location")?.toString().trim(),
    service: formData.get("service")?.toString().trim(),
    message: formData.get("message")?.toString().trim(),
  };

  submitQuote(details).catch(() => {
    openWhatsappFallback(details, "Opening WhatsApp with your request...");
  });
});

async function submitQuote(details) {
  setFormPending(true, supabaseClient ? "Sending your request..." : "Supabase key missing. Opening WhatsApp instead...");

  if (!supabaseClient) {
    openWhatsappFallback(details, "Supabase key missing. Opening WhatsApp instead...");
    return;
  }

  const { error } = await supabaseClient.from(supabaseConfig.table || "quote_requests").insert({
    name: details.name,
    phone: details.phone,
    location: details.location,
    service: details.service,
    message: details.message,
    source: "github-pages",
  });

  if (error) {
    openWhatsappFallback(details, "Supabase submit failed. Opening WhatsApp instead...");
    return;
  }

  quoteForm?.reset();
  setFormPending(false, "Quote request sent. TechLab Botswana will follow up soon.");
}

function openWhatsappFallback(details, statusMessage) {
  const message = [
    "Hello TechLab Botswana, I would like to request a quote.",
    "",
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Location: ${details.location}`,
    `Service Needed: ${details.service}`,
    `Message: ${details.message}`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/26776984827?text=${encodeURIComponent(message)}`;
  setFormPending(false, statusMessage);
  window.open(whatsappUrl, "_blank", "noopener");
}

function setFormPending(isPending, message) {
  if (quoteSubmitButton) {
    quoteSubmitButton.disabled = isPending;
    quoteSubmitButton.textContent = isPending ? "Sending..." : "Send Request";
    if (!isPending) {
      quoteSubmitButton.textContent = "Send Request";
    }
  }

  if (formStatus) {
    formStatus.textContent = message;
  }
}

if (window.Splitting) {
  Splitting();
}

if (window.gsap && window.ScrollTrigger && !reducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  gsap.set(".hero-reveal", { y: 34, opacity: 0 });
  gsap.to(".hero-reveal", {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.12,
    ease: "power3.out",
  });

  document.querySelectorAll(".split-heading").forEach((heading) => {
    const isHeroHeading = heading.id === "hero-title";
    const targets = heading.querySelectorAll(isHeroHeading ? ".word" : ".char");
    if (!targets.length) {
      return;
    }

    gsap.from(targets, {
      scrollTrigger: {
        trigger: heading,
        start: "top 82%",
      },
      yPercent: isHeroHeading ? 28 : 42,
      opacity: 0,
      rotateX: isHeroHeading ? 0 : 18,
      duration: isHeroHeading ? 0.86 : 0.76,
      stagger: isHeroHeading ? 0.055 : 0.012,
      ease: "power3.out",
    });
  });

  gsap.utils.toArray(".scene").forEach((section) => {
    gsap.fromTo(
      section,
      { "--scene-opacity": 0 },
      {
        "--scene-opacity": 1,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 30%",
          scrub: true,
        },
      },
    );
  });

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      { y: 56, opacity: 0, scale: 0.985 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.92,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 84%",
        },
      },
    );
  });

  gsap.utils.toArray(".chapter").forEach((chapter) => {
    const visual = chapter.querySelector(".chapter-visual");
    const copy = chapter.querySelector(".chapter-copy");

    gsap.fromTo(
      chapter.querySelector(".chapter-layout"),
      { scale: 0.94, opacity: 0.45 },
      {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: chapter,
          start: "top 78%",
          end: "bottom 25%",
          scrub: true,
        },
      },
    );

    if (visual && copy) {
      gsap.fromTo(
        visual,
        { x: isMobile ? 0 : 80, y: 36, opacity: 0, rotateY: isMobile ? 0 : -10 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 72%",
          },
        },
      );

      gsap.to(visual, {
        y: isMobile ? 0 : -44,
        scrollTrigger: {
          trigger: chapter,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(copy, {
        y: isMobile ? 0 : 24,
        scrollTrigger: {
          trigger: chapter,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  });

  gsap.utils.toArray(".visual-animate").forEach((visual, index) => {
    gsap.fromTo(
      visual,
      { y: 72, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.95,
        delay: (index % 3) * 0.04,
        ease: "power3.out",
        scrollTrigger: {
          trigger: visual,
          start: "top 86%",
        },
      },
    );
  });

  gsap.utils.toArray(".service-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 70, opacity: 0, rotateX: isMobile ? 0 : 8 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.82,
        delay: (index % 3) * 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
        },
      },
    );
  });

  gsap.to(".map-frame", {
    y: isMobile ? 0 : -26,
    scrollTrigger: {
      trigger: ".nationwide",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.from(".contact-detail", {
    y: 28,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-panel",
      start: "top 84%",
    },
  });
} else {
  document.querySelectorAll(".reveal, .hero-reveal").forEach((element) => {
    element.style.opacity = "1";
  });
}

function initPaintedBackground() {
  const canvas = document.querySelector("#painted-background");
  if (!canvas || !window.THREE || reducedMotion) {
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  const pointer = new THREE.Vector2(0.5, 0.5);

  const palettes = [
    [0.02, 0.09, 0.1, 0.05, 0.28, 0.22, 0.18, 0.46, 0.5],
    [0.03, 0.12, 0.16, 0.07, 0.34, 0.32, 0.72, 0.44, 0.28],
    [0.03, 0.1, 0.14, 0.26, 0.16, 0.38, 0.82, 0.56, 0.24],
    [0.02, 0.13, 0.12, 0.32, 0.25, 0.08, 0.24, 0.62, 0.48],
    [0.07, 0.08, 0.09, 0.36, 0.18, 0.14, 0.86, 0.54, 0.34],
  ];

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: pointer },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPalette: { value: palettes[0] },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform float uScroll;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform float uPalette[9];

      mat2 rotate2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = rotate2d(0.55) * p * 2.02;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 p = uv - 0.5;
        p.x *= uResolution.x / uResolution.y;

        float t = uTime * 0.055;
        vec2 drift = vec2(t * 0.36, -t * 0.22);
        float brush = fbm(p * 2.0 + drift + uScroll * 0.42);
        float grain = fbm(p * 8.0 - drift);
        float cursor = smoothstep(0.55, 0.0, distance(uv, uPointer));

        vec3 c1 = vec3(uPalette[0], uPalette[1], uPalette[2]);
        vec3 c2 = vec3(uPalette[3], uPalette[4], uPalette[5]);
        vec3 c3 = vec3(uPalette[6], uPalette[7], uPalette[8]);

        vec3 color = mix(c1, c2, smoothstep(0.2, 0.95, brush));
        color = mix(color, c3, smoothstep(0.45, 0.92, fbm(p * 3.2 + brush + uScroll)));
        color += cursor * vec3(0.08, 0.12, 0.1);
        color += (grain - 0.5) * 0.065;
        color *= 0.92 - length(p) * 0.18;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  scene.add(new THREE.Mesh(geometry, material));

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.8);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    uniforms.uResolution.value.set(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
  }

  function updatePalette() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = window.scrollY / maxScroll;
    const scaled = scrollProgress * (palettes.length - 1);
    const index = Math.min(Math.floor(scaled), palettes.length - 2);
    const mixValue = scaled - index;
    uniforms.uScroll.value = scrollProgress;
    uniforms.uPalette.value = palettes[index].map((value, channel) => {
      return value + (palettes[index + 1][channel] - value) * mixValue;
    });
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updatePalette, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x += (event.clientX / window.innerWidth - pointer.x) * 0.16;
    pointer.y += (1 - event.clientY / window.innerHeight - pointer.y) * 0.16;
  });

  const clock = new THREE.Clock();

  function render() {
    uniforms.uTime.value = clock.getElapsedTime();
    updatePalette();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  resize();
  render();
}

initPaintedBackground();
