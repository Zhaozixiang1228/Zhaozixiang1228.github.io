document.addEventListener("DOMContentLoaded", function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;

  function updateScrollProgress() {
    const scrollRange = root.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? (window.scrollY / scrollRange) * 100 : 0;
    root.style.setProperty("--scroll-progress", Math.max(0, Math.min(100, progress)) + "%");
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  const navLinks = Array.from(document.querySelectorAll(".topbar-links a[href^='#']"));
  const navTargets = navLinks
    .map(function (link) {
      return {
        link: link,
        target: document.querySelector(link.getAttribute("href")),
      };
    })
    .filter(function (item) {
      return item.target;
    });

  if ("IntersectionObserver" in window && navTargets.length > 0) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          navTargets.forEach(function (item) {
            item.link.classList.toggle("is-active", item.target === entry.target);
          });
        });
      },
      {
        rootMargin: "-42% 0px -50% 0px",
        threshold: 0,
      }
    );

    navTargets.forEach(function (item) {
      navObserver.observe(item.target);
    });
  }

  const revealTargets = Array.from(
    document.querySelectorAll(
      ".section-heading, .section-lede, .console-hud span, .use-case-grid article, .concept-panel, .paper-shell, .pipeline-grid article, .architecture-card, .gallery, .recognition-stats article, .release-panel, .citation-box"
    )
  );

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    revealTargets.forEach(function (target) {
      target.classList.add("reveal-ready");
    });

    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      }
    );

    revealTargets.forEach(function (target) {
      revealObserver.observe(target);
    });
  }

  const heroConsole = document.querySelector(".hero-console");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduceMotion.matches) {
    let pointerFrame = 0;
    window.addEventListener(
      "pointermove",
      function (event) {
        if (pointerFrame) {
          return;
        }

        const x = event.clientX;
        const y = event.clientY;
        pointerFrame = window.requestAnimationFrame(function () {
          root.style.setProperty("--pointer-x", x + "px");
          root.style.setProperty("--pointer-y", y + "px");
          pointerFrame = 0;
        });
      },
      { passive: true }
    );
  }

  if (heroConsole && canHover && !reduceMotion.matches) {
    heroConsole.addEventListener("pointermove", function (event) {
      const rect = heroConsole.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroConsole.style.setProperty("--tilt-x", y * -4 + "deg");
      heroConsole.style.setProperty("--tilt-y", x * 5 + "deg");
    });

    heroConsole.addEventListener("pointerleave", function () {
      heroConsole.style.setProperty("--tilt-x", "0deg");
      heroConsole.style.setProperty("--tilt-y", "0deg");
    });
  }

  const galleryData = {
    fusion: [
      {
        src: "static/images/IVF2.png",
        alt: "EMMA infrared-visible fusion comparison on RoadScene",
        title: "RoadScene: Infrared-Visible Fusion",
        text: "Night-scene fusion preserves salient targets, high-frequency details, and illumination-robust structure.",
        width: 1096,
        height: 321,
      },
      {
        src: "static/images/IVF1.png",
        alt: "EMMA infrared-visible fusion comparison on MSRS",
        title: "MSRS: Infrared-Visible Fusion",
        text: "Thermal targets remain salient while visible-scene texture and road structure stay readable.",
        width: 1096,
        height: 289,
      },
      {
        src: "static/images/MIF.png",
        alt: "EMMA medical image fusion comparison on MRI-PET",
        title: "MRI-PET: Medical Fusion",
        text: "Functional PET response and anatomical MRI structure are integrated without fusion ground-truth labels.",
        width: 885,
        height: 353,
      },
    ],
  };

  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    const galleryName = gallery.dataset.gallery || "fusion";
    const galleryItems = galleryData[galleryName] || galleryData.fusion;
    const image = gallery.querySelector("[data-gallery-image]");
    const title = gallery.querySelector("[data-gallery-title]");
    const text = gallery.querySelector("[data-gallery-text]");
    const tabs = Array.from(gallery.querySelectorAll("[data-gallery-tab]"));
    const previous = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");
    let index = 0;
    let autoplay = null;

    if (!image || !title || !text || !previous || !next || tabs.length === 0) {
      return;
    }

    galleryItems.forEach(function (item) {
      const preload = new Image();
      preload.src = item.src;
    });

    function renderGallery(nextIndex, animate) {
      index = (nextIndex + galleryItems.length) % galleryItems.length;
      const item = galleryItems[index];

      image.src = item.src;
      image.alt = item.alt;
      image.width = item.width;
      image.height = item.height;
      title.textContent = item.title;
      text.textContent = item.text;

      tabs.forEach(function (tab, tabIndex) {
        const isActive = tabIndex === index;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      if (animate !== false && !reduceMotion.matches) {
        gallery.classList.remove("is-switching");
        window.requestAnimationFrame(function () {
          gallery.classList.add("is-switching");
        });
        window.setTimeout(function () {
          gallery.classList.remove("is-switching");
        }, 340);
      }
    }

    tabs.forEach(function (tab) {
      tab.setAttribute("role", "tab");
      tab.addEventListener("click", function () {
        const nextIndex = Number(tab.dataset.galleryTab);
        if (Number.isInteger(nextIndex)) {
          renderGallery(nextIndex);
        }
      });
    });

    gallery.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        renderGallery(index - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        renderGallery(index + 1);
      }
    });

    previous.addEventListener("click", function () {
      renderGallery(index - 1);
    });

    next.addEventListener("click", function () {
      renderGallery(index + 1);
    });

    renderGallery(0, false);

    function stopAutoplay() {
      if (!autoplay) {
        return;
      }

      window.clearInterval(autoplay);
      autoplay = null;
    }

    function startAutoplay() {
      if (reduceMotion.matches || autoplay || galleryItems.length < 2) {
        return;
      }

      autoplay = window.setInterval(function () {
        renderGallery(index + 1);
      }, 5200);
    }

    gallery.addEventListener("pointerenter", stopAutoplay);
    gallery.addEventListener("pointerleave", startAutoplay);
    gallery.addEventListener("focusin", stopAutoplay);
    gallery.addEventListener("focusout", function (event) {
      if (!gallery.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
    startAutoplay();
  });

  const copyButton = document.querySelector("[data-copy-citation]");
  const bibtex = document.getElementById("bibtex");
  if (copyButton && bibtex) {
    function markCopied() {
      const label = copyButton.querySelector("span:last-child");
      if (!label) {
        return;
      }

      const original = label.textContent;
      copyButton.classList.add("is-copied");
      label.textContent = "Copied";
      window.setTimeout(function () {
        copyButton.classList.remove("is-copied");
        label.textContent = original;
      }, 1600);
    }

    copyButton.addEventListener("click", function () {
      const citation = bibtex.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(citation).then(markCopied).catch(function () {
          markCopied();
        });
      } else {
        markCopied();
      }
    });
  }
});
