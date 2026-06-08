document.addEventListener("DOMContentLoaded", function () {
  const galleryData = {
    fusion: [
      {
        src: "static/images/MSRS_00706N-1.png",
        alt: "MSRS infrared-visible image fusion comparison",
        title: "MSRS: Infrared-Visible Fusion",
        text: "CDDFuse preserves salient infrared targets while recovering visible texture and scene structure.",
        width: 1088,
        height: 390,
      },
      {
        src: "static/images/RoadScene_04602-1.png",
        alt: "RoadScene infrared-visible image fusion comparison",
        title: "RoadScene: Infrared-Visible Fusion",
        text: "The fused image balances global visibility, local texture, and thermal target saliency.",
        width: 1088,
        height: 268,
      },
      {
        src: "static/images/MRI_PET16-1.png",
        alt: "MRI-PET medical image fusion comparison",
        title: "MRI-PET: Medical Fusion",
        text: "CDDFuse combines MRI anatomical structure with PET functional highlight in a single fused image.",
        width: 1088,
        height: 535,
      },
    ],
    downstream: [
      {
        src: "static/images/sm_OD00110-1.png",
        alt: "Infrared-visible object detection visualization on M3FD",
        title: "Infrared-visible Object Detection on M<sup>3</sup>FD",
        text: "Detection comparison on fused images, highlighting target localization under challenging visibility.",
        width: 1498,
        height: 585,
      },
      {
        src: "static/images/sm_OD02716-1.png",
        alt: "Infrared-visible object detection visualization on M3FD",
        title: "Infrared-visible Object Detection on M<sup>3</sup>FD",
        text: "A second M3FD detection example showing how fused imagery supports downstream recognition.",
        width: 1498,
        height: 585,
      },
      {
        src: "static/images/sm_00746N-1.png",
        alt: "Infrared-visible semantic segmentation visualization on MSRS",
        title: "Infrared-visible Semantic Segmentation on MSRS",
        text: "Segmentation comparison on fused images, emphasizing object boundaries and scene layout.",
        width: 1498,
        height: 468,
      },
      {
        src: "static/images/sm_01206N-1.png",
        alt: "Infrared-visible semantic segmentation visualization on MSRS",
        title: "Infrared-visible Semantic Segmentation on MSRS",
        text: "A second MSRS segmentation example with fused-image semantic predictions.",
        width: 1498,
        height: 468,
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

    function renderGallery(nextIndex) {
      index = (nextIndex + galleryItems.length) % galleryItems.length;
      const item = galleryItems[index];
      image.src = item.src;
      image.alt = item.alt;
      image.width = item.width;
      image.height = item.height;
      title.innerHTML = item.title;
      text.textContent = item.text;
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle("is-active", tabIndex === index);
        tab.setAttribute("aria-selected", tabIndex === index ? "true" : "false");
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const nextIndex = Number(tab.dataset.galleryTab);
        if (Number.isInteger(nextIndex)) {
          renderGallery(nextIndex);
        }
      });
    });

    previous.addEventListener("click", function () {
      renderGallery(index - 1);
    });

    next.addEventListener("click", function () {
      renderGallery(index + 1);
    });

    renderGallery(0);
  });

  const copyButton = document.querySelector("[data-copy-citation]");
  const bibtex = document.getElementById("bibtex");
  if (copyButton && bibtex) {
    function markCopied() {
      const label = copyButton.querySelector("span:last-child");
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
      if (navigator.clipboard) {
        navigator.clipboard.writeText(bibtex.textContent).then(markCopied).catch(function () {
          fallbackCopy(bibtex.textContent);
        });
      } else {
        fallbackCopy(bibtex.textContent);
      }
    });
  }
});
