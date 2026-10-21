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
    bgLight: "#efebe7",
    bgDark: "#171515",
    versions: [
      "images/artwork-3-main.webp",
      "images/artwork-3-v1.webp",
      "images/artwork-3-v2.webp",
      "images/artwork-3-v3.webp",
      "images/artwork-3-v4.webp"
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

// Timelapses playlist configuration
const timelapses = [
  {
    src: "videos/timelapse-1.mp4",
    poster: "videos/timelapse-poster-1.webp"
  },
  {
    src: "videos/timelapse-2.mp4",
    poster: "videos/timelapse-poster-2.webp"
  },
  {
    src: "videos/timelapse-3.mp4",
    poster: "videos/timelapse-poster-3.webp"
  },
  {
    src: "videos/timelapse-4.mp4",
    poster: "videos/timelapse-poster-4.webp"
  },
  {
    src: "videos/timelapse-5.mp4",
    poster: "videos/timelapse-poster-5.webp"
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

    // Scroll cue on the first artwork only
    if (artIndex === 0) {
      const cue = document.createElement("div");
      cue.id = "scroll-cue";
      cue.className = "scroll-cue";
      cue.setAttribute("aria-hidden", "true");
      cue.innerHTML = `
        <svg viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      section.appendChild(cue);
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
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
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

// Theme toggle button setup (accessible switch with localStorage support)
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // Retrieve theme from localStorage; default to light
  let currentTheme = "light";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      currentTheme = saved;
    }
  } catch (e) {
    currentTheme = "light";
  }

  // Set theme on html
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggleBtn.setAttribute("aria-checked", currentTheme === "dark" ? "true" : "false");

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    toggleBtn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}

    // Re-check current visible artwork to apply matching muted tint
    const viewportMiddle = window.innerHeight / 2;
    const sections = Array.from(document.querySelectorAll(".artwork-section"));
    const activeSection = sections.find((sec) => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
    }) || sections[0];

    if (activeSection) {
      const targetBg = theme === "dark" ? activeSection.dataset.bgDark : activeSection.dataset.bgLight;
      if (targetBg) {
        document.body.style.setProperty("--bg-current", targetBg);
      }
    }
  };

  toggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

// Setup scroll cue removal when scrolling past ~40px
function setupScrollCue() {
  const cue = document.getElementById("scroll-cue");
  if (!cue) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      cue.classList.add("is-hidden");
      setTimeout(() => {
        if (cue && cue.parentNode) {
          cue.parentNode.removeChild(cue);
        }
      }, 500);
      window.removeEventListener("scroll", onScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

// Setup timelapse video playlist, preloading, autoplay on scroll and tap pause/play
function setupTimelapseVideo() {
  const video = document.getElementById("timelapse-video");
  if (!video || !timelapses.length) return;

  let currentClipIndex = 0;
  let nextClipPreloaded = false;
  let preloaderVideo = null;

  // Preload the next clip's metadata / buffer when the current one is halfway through
  const preloadNextClip = () => {
    if (nextClipPreloaded) return;
    nextClipPreloaded = true;
    const nextIndex = (currentClipIndex + 1) % timelapses.length;
    preloaderVideo = document.createElement("video");
    preloaderVideo.preload = "auto";
    preloaderVideo.src = timelapses[nextIndex].src;
  };

  // Monitor playback progress to trigger halfway preloading
  video.addEventListener("timeupdate", () => {
    if (video.duration && video.currentTime > video.duration / 2) {
      preloadNextClip();
    }
  });

  // When current clip finishes, advance to the next clip in artwork order (looping back to 1)
  video.addEventListener("ended", () => {
    currentClipIndex = (currentClipIndex + 1) % timelapses.length;
    nextClipPreloaded = false;
    const nextClip = timelapses[currentClipIndex];
    video.src = nextClip.src;
    video.poster = nextClip.poster;
    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If user prefers reduced motion, do not autoplay, keep poster visible
  if (!prefersReducedMotion) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay was prevented (e.g. browser policy)
              });
            }
          } else {
            video.pause();
          }
        });
      },
      {
        root: null,
        threshold: 0.5
      }
    );

    videoObserver.observe(video);
  }

  // Tapping or clicking toggles pause/play
  video.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  setupThemeToggle();
  setupScrollObserver();
  setupScrollCue();
  setupTimelapseVideo();
  preloadVariants();
});
