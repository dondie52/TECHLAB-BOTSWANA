document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");
const quoteSubmitButton = quoteForm?.querySelector('button[type="submit"]');
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supabaseConfig = window.TECHLAB_SUPABASE ?? null;
const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

let supabaseClient = null;
let supabaseLoadPromise = null;

function revealContentFallback() {
  document.querySelectorAll(".reveal, .hero-reveal, .visual-animate").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
}

if (reducedMotion) {
  revealContentFallback();
}

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

function loadSupabaseScript() {
  if (window.supabase?.createClient) {
    return Promise.resolve();
  }

  if (supabaseLoadPromise) {
    return supabaseLoadPromise;
  }

  supabaseLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SUPABASE_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Supabase"));
    document.head.appendChild(script);
  });

  return supabaseLoadPromise;
}

async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseConfig?.url || !supabaseConfig?.publishableKey) {
    return null;
  }

  try {
    await loadSupabaseScript();
  } catch {
    return null;
  }

  if (!window.supabase?.createClient) {
    return null;
  }

  supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

async function submitQuote(details) {
  setFormPending(true, "Sending your request...");

  const client = await getSupabaseClient();

  if (!client) {
    openWhatsappFallback(details, "Opening WhatsApp with your request...");
    return;
  }

  const { error } = await client.from(supabaseConfig.table || "quote_requests").insert({
    name: details.name,
    phone: details.phone,
    location: details.location,
    service: details.service,
    message: details.message,
    source: "github-pages",
  });

  if (error) {
    openWhatsappFallback(details, "Opening WhatsApp with your request...");
    return;
  }

  quoteForm?.reset();
  setFormPending(false, "Request sent. TechLab Botswana will follow up soon.");
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

  const whatsappUrl = `https://wa.me/15559398213?text=${encodeURIComponent(message)}`;
  setFormPending(false, statusMessage);
  window.open(whatsappUrl, "_blank", "noopener");
}

function setFormPending(isPending, message) {
  if (quoteSubmitButton) {
    quoteSubmitButton.disabled = isPending;
    quoteSubmitButton.textContent = isPending ? "Sending..." : "Send Request";
  }

  if (formStatus) {
    formStatus.textContent = message;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
    setMenu(false);
  }
});

if (window.gsap && window.ScrollTrigger && !reducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(".hero-reveal", { y: 28, opacity: 0 });
  gsap.to(".hero-reveal", {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
  });

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
        },
      },
    );
  });

  gsap.utils.toArray(".chapter").forEach((chapter) => {
    const visual = chapter.querySelector(".chapter-visual");
    const copy = chapter.querySelector(".chapter-copy");

    if (visual) {
      gsap.fromTo(
        visual,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 78%",
          },
        },
      );
    }

    if (copy) {
      gsap.fromTo(
        copy,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 78%",
          },
        },
      );
    }
  });

  gsap.utils.toArray(".visual-animate").forEach((visual, index) => {
    gsap.fromTo(
      visual,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: (index % 3) * 0.04,
        ease: "power3.out",
        scrollTrigger: {
          trigger: visual,
          start: "top 88%",
        },
      },
    );
  });

  gsap.utils.toArray(".service-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        delay: (index % 3) * 0.04,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 92%",
        },
      },
    );
  });

  gsap.from(".contact-detail", {
    y: 24,
    opacity: 0,
    duration: 0.65,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-panel",
      start: "top 86%",
    },
  });
} else {
  revealContentFallback();
}
