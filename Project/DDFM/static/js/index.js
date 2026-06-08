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
        rootMargin: "-40% 0px -52% 0px",
        threshold: 0,
      }
    );

    navTargets.forEach(function (item) {
      navObserver.observe(item.target);
    });
  }

  const revealTargets = Array.from(
    document.querySelectorAll(
      ".section-heading, .section-lede, .background-card, .insight-card, .overview-card, .image-shell, .gallery, .method-undergrid, .release-panel, .citation-box"
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

  const heroPanel = document.querySelector(".hero-panel");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (heroPanel && canHover && !reduceMotion.matches) {
    heroPanel.addEventListener("pointermove", function (event) {
      const rect = heroPanel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroPanel.style.setProperty("--tilt-x", y * -5 + "deg");
      heroPanel.style.setProperty("--tilt-y", x * 6 + "deg");
    });

    heroPanel.addEventListener("pointerleave", function () {
      heroPanel.style.setProperty("--tilt-x", "0deg");
      heroPanel.style.setProperty("--tilt-y", "0deg");
    });
  }

  const galleryData = {
    fusion: [
      {
        src: "static/images/IVF1.png",
        alt: "DDFM infrared-visible fusion comparison on M3FD",
        title: "M<sup>3</sup>FD: Infrared-Visible Fusion",
        text: "DDFM preserves thermal targets while keeping visible-scene texture and natural image appearance.",
        width: 2475,
        height: 850,
      },
      {
        src: "static/images/IVF2.png",
        alt: "DDFM infrared-visible fusion comparison on RoadScene",
        title: "RoadScene: Infrared-Visible Fusion",
        text: "Likelihood rectification guides the diffusion prior toward source-image details in challenging night scenes.",
        width: 2466,
        height: 699,
      },
      {
        src: "static/images/MIF.png",
        alt: "DDFM medical image fusion comparison",
        title: "MRI-CT: Medical Fusion",
        text: "DDFM fuses anatomical structures and complementary modality responses without task-specific fine-tuning.",
        width: 2223,
        height: 996,
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

    if (!image || !title || !text || !previous || !next || tabs.length === 0) {
      return;
    }

    function renderGallery(nextIndex, animate) {
      index = (nextIndex + galleryItems.length) % galleryItems.length;
      const item = galleryItems[index];

      image.src = item.src;
      image.alt = item.alt;
      image.width = item.width;
      image.height = item.height;
      gallery.style.setProperty("--gallery-aspect", item.width + " / " + item.height);
      title.innerHTML = item.title;
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
        }, 320);
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
        label.textContent = original;
        copyButton.classList.remove("is-copied");
      }, 1600);
    }

    function fallbackCopy(value) {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) {
        markCopied();
      }
    }

    copyButton.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(bibtex.textContent).then(markCopied).catch(function () {
          fallbackCopy(bibtex.textContent);
        });
      } else {
        fallbackCopy(bibtex.textContent);
      }
    });
  }
});
