// ==========================================================================
// ARTWORKS CONFIGURATION
// Add, reorder, or update artworks and variants here.
// bgLight / bgDark provide soft, muted ambient tints per artwork.
// ==========================================================================
const artworks = [
  {
    id: "artwork-1",
    alt: "Surreal artwork 1",
    width: 1600,
    height: 1600,
    bgLight: "#f1ede6",
    bgDark: "#181719",
    versions: [
      "images/artwork-1-main.webp",
      "images/artwork-1-v1.webp",
      "images/artwork-1-v2.webp"
    ]
  },
  {
    id: "artwork-2",
    alt: "Surreal artwork 2",
    width: 1600,
    height: 1200,
    bgLight: "#edf2ee",
    bgDark: "#141817",
    versions: [
      "images/artwork-2-main.webp",
      "images/artwork-2-v1.webp"
    ]
  },
  {
    id: "artwork-3",
    alt: "Surreal artwork 3",
    width: 1200,
    height: 1600,
    bgLight: "#f7eeed",
    bgDark: "#1b1616",
    versions: [
      "images/artwork-3-main.webp",
      "images/artwork-3-v1.webp",
      "images/artwork-3-v2.webp",
      "images/artwork-3-v3.webp"
    ]
  },
  {
    id: "artwork-4",
    alt: "Surreal artwork 4",
    width: 1600,
    height: 1600,
    bgLight: "#f7f1e9",
    bgDark: "#1a1815",
    versions: [
      "images/artwork-4-main.webp"
    ]
  },
  {
    id: "artwork-5",
    alt: "Surreal artwork 5",
    width: 1600,
    height: 1200,
    bgLight: "#eff0f2",
    bgDark: "#16171a",
    versions: [
      "images/artwork-5-main.webp",
      "images/artwork-5-v1.webp"
    ]
  }
];

// Preload all variant images so crossfading never flashes blank
function preloadVariants() {
  artworks.forEach((art) => {
    if (art.versions.length > 1) {
      art.versions.slice(1).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  });
}

// Render gallery sections dynamically
function renderGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const fragment = document.createDocumentFragment();

  artworks.forEach((art, artIndex) => {
    const section = document.createElement("section");
    section.className = "artwork-section";
    section.id = art.id;
    section.dataset.bgLight = art.bgLight;
    section.dataset.bgDark = art.bgDark;

    const stage = document.createElement("div");
    stage.className = "artwork-stage";

    const hasVariants = art.versions.length > 1;
    const container = document.createElement("div");
    container.className = `artwork-container${hasVariants ? " is-interactive" : ""}`;
    container.setAttribute("data-current-index", "0");
    if (hasVariants) {
      container.setAttribute("role", "button");
      container.setAttribute("tabindex", "0");
      container.setAttribute("aria-label", `${art.alt}. Click or tap to view alternate variant.`);
    }

    // Generate stacked image elements
    art.versions.forEach((src, vIndex) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = `artwork-img${vIndex === 0 ? " is-active" : ""}`;
      img.width = art.width;
      img.height = art.height;
      img.style.aspectRatio = `${art.width} / ${art.height}`;
      img.alt = vIndex === 0 ? `${art.alt}, default` : `${art.alt}, variant ${vIndex}`;

      // Lazy load every image except the first artwork's primary image
      if (artIndex === 0 && vIndex === 0) {
        img.loading = "eager";
        img.fetchPriority = "high";
      } else {
        img.loading = "lazy";
      }

      container.appendChild(img);
    });

    stage.appendChild(container);

    // Indicator dots (only if multiple variants exist)
    if (hasVariants) {
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "variant-dots";
      dotsContainer.setAttribute("aria-hidden", "true");

      art.versions.forEach((_, vIndex) => {
        const dot = document.createElement("span");
        dot.className = `variant-dot${vIndex === 0 ? " is-active" : ""}`;
        dotsContainer.appendChild(dot);
      });

      stage.appendChild(dotsContainer);

      // Tap / Click handling to cycle variants
      const cycleVariant = () => {
        const currentIndex = parseInt(container.getAttribute("data-current-index") || "0", 10);
        const nextIndex = (currentIndex + 1) % art.versions.length;
        container.setAttribute("data-current-index", String(nextIndex));

        const images = container.querySelectorAll(".artwork-img");
        images.forEach((img, i) => {
          img.classList.toggle("is-active", i === nextIndex);
        });

        const dots = dotsContainer.querySelectorAll(".variant-dot");
        dots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === nextIndex);
        });
      };

      container.addEventListener("click", cycleVariant);
      container.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cycleVariant();
        }
      });
    }

    section.appendChild(stage);
    fragment.appendChild(section);
  });

  gallery.appendChild(fragment);
}

// Background tint shifting on scroll
function setupScrollObserver() {
  const sections = document.querySelectorAll(".artwork-section");
  if (!sections.length) return;

  const updateBackground = (section) => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const targetBg = isDark ? section.dataset.bgDark : section.dataset.bgLight;
    if (targetBg) {
      document.body.style.setProperty("--bg-current", targetBg);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateBackground(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.55 // Fires when the artwork is predominantly in viewport
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

// Theme toggle button setup (allows switching between light & dark previews)
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = prefersDark ? "dark" : "light";
  document.body.setAttribute("data-theme", initialTheme);
  toggleBtn.querySelector(".theme-label").textContent = initialTheme === "dark" ? "Dark" : "Light";

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", nextTheme);
    toggleBtn.querySelector(".theme-label").textContent = nextTheme === "dark" ? "Dark" : "Light";

    // Re-check current visible artwork to apply matching muted tint
    const viewportMiddle = window.innerHeight / 2;
    const sections = Array.from(document.querySelectorAll(".artwork-section"));
    const activeSection = sections.find((sec) => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
    }) || sections[0];

    if (activeSection) {
      const targetBg = nextTheme === "dark" ? activeSection.dataset.bgDark : activeSection.dataset.bgLight;
      if (targetBg) {
        document.body.style.setProperty("--bg-current", targetBg);
      }
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  setupThemeToggle();
  setupScrollObserver();
  preloadVariants();
});
