let slides = document.querySelectorAll(".carousel-slide");
let dots = document.querySelectorAll(".dot");

let index = 0;
let duration = 8000; // 8s
let timeoutId;
let zoomInNext = true;

function showSlide(i) {
    const previousSlide = slides[index];
    if (previousSlide) {
        const previousImg = previousSlide.querySelector("img");
        if (previousImg) {
            // Keep the current visual state while the old slide fades out.
            const currentTransform = getComputedStyle(previousImg).transform;
            previousImg.style.transform = currentTransform === "none" ? "scale(1.02)" : currentTransform;
        }
    }

    slides.forEach(slide => slide.classList.remove("active", "zoom-in", "zoom-out"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[i].classList.add("active");
    slides[i].classList.add(zoomInNext ? "zoom-in" : "zoom-out");
    dots[i].classList.add("active");

    index = i;
    zoomInNext = !zoomInNext;

    // relancer l'autoplay proprement
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        showSlide((index + 1) % slides.length);
    }, duration);
}

slides.forEach((slide) => {
    slide.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "opacity") return;
        if (slide.classList.contains("active")) return;

        const img = slide.querySelector("img");
        if (img) {
            // Reset once hidden so next activation starts from clean keyframes.
            img.style.transform = "";
        }
    });
});

// boutons
document.querySelector(".next").onclick = () => {
    showSlide((index + 1) % slides.length);
};

document.querySelector(".prev").onclick = () => {
    showSlide((index - 1 + slides.length) % slides.length);
};

// dots
dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        showSlide(i);
    });
});

// démarrage
window.addEventListener("load", () => {

    // retirer toute slide active au départ
    slides.forEach(slide => slide.classList.remove("active"));

    // forcer le navigateur à recalculer le layout
    void document.body.offsetHeight;

    // activer la première slide
    showSlide(0);

});

// CAROUSEL DE MARQUES (animation continue + pop-up)
const carousel = document.querySelector('.brands-carousel-vertical');
const track = document.querySelector('.brands-track-vertical');

if (carousel && track) {
    const anim = track.getAnimations()[0];

    if (anim) {
        anim.playbackRate = 1;
        anim.play();
    }

    const brandsModal = document.querySelector('.brands-modal-overlay');
    const brandsModalGrid = brandsModal?.querySelector('.brands-modal-grid');
    const brandsModalBody = brandsModal?.querySelector('.brands-modal-body');
    const scrollUpBtn = brandsModal?.querySelector('.brands-modal-scroll-btn.up');
    const scrollDownBtn = brandsModal?.querySelector('.brands-modal-scroll-btn.down');
    const closeButton = brandsModal?.querySelector('.brands-modal-close');

    const updateScrollBtns = () => {
        if (!brandsModalBody) return;
        const atTop = brandsModalBody.scrollTop <= 2;
        const atBottom = brandsModalBody.scrollTop + brandsModalBody.clientHeight >= brandsModalBody.scrollHeight - 2;
        scrollUpBtn?.classList.toggle('is-hidden', atTop);
        scrollDownBtn?.classList.toggle('is-hidden', atBottom);
    };

    brandsModalBody?.addEventListener('scroll', updateScrollBtns, { passive: true });
    scrollUpBtn?.addEventListener('click', () => brandsModalBody.scrollBy({ top: -150, behavior: 'smooth' }));
    scrollDownBtn?.addEventListener('click', () => brandsModalBody.scrollBy({ top: 150, behavior: 'smooth' }));

    const getBrands = () => {
        const allBrands = Array.from(track.querySelectorAll('span'))
            .map((item) => item.textContent.trim())
            .filter(Boolean);

        return [...new Set(allBrands)];
    };

    const lockScrollbar = () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            const currentPadding = window.getComputedStyle(document.body).paddingRight;
            const basePadding = parseFloat(currentPadding) || 0;
            document.body.style.paddingRight = `${basePadding + scrollbarWidth}px`;
        }
    };

    const unlockScrollbar = () => {
        document.body.style.paddingRight = '';
    };

    const closeBrandsModal = () => {
        if (!brandsModal || !brandsModal.classList.contains('is-open')) return;

        brandsModal.classList.remove('is-open');
        brandsModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('brands-modal-open');
        unlockScrollbar();
        window.unlockBodyScroll?.();

        if (anim) {
            anim.playbackRate = 1;
            anim.play();
        }
    };

    const openBrandsModal = () => {
        if (!brandsModal || !brandsModalGrid) return;

        const brandItems = getBrands()
            .map((brand) => `<li class="brands-modal-item">${brand}</li>`)
            .join('');

        brandsModalGrid.innerHTML = brandItems;

        if (brandsModalBody) brandsModalBody.scrollTop = 0;
        updateScrollBtns();

        brandsModal.classList.add('is-open');
        brandsModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('brands-modal-open');
        lockScrollbar();
        window.lockBodyScroll?.();

        if (anim) {
            anim.pause();
        }
    };

    if (brandsModal) {
        brandsModal.addEventListener('click', (event) => {
            if (event.target === brandsModal) {
                closeBrandsModal();
            }
        });
    }

    closeButton?.addEventListener('click', closeBrandsModal);

    carousel.addEventListener('click', openBrandsModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeBrandsModal();
        }
    });
}

// CAROUSEL FONDU IMAGES PHILOSOPHIE
document.addEventListener("DOMContentLoaded", function () {

    const stacks = document.querySelectorAll(".photo-stack[data-fade-carousel]");

    if (!stacks.length) return;

    let lightboxOverlay = document.querySelector(".photo-lightbox-overlay");
    let lightboxDialog;
    let lightboxImage;
    let lightboxPrevButton;
    let lightboxNextButton;
    let lightboxDotsContainer;
    let lightboxDots = [];
    let activeLightboxContext = null;

    const syncLightboxDots = (activeIndex) => {
        lightboxDots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === activeIndex);
        });
    };

    const buildLightboxDots = (totalSlides) => {
        if (!lightboxDotsContainer) return;

        lightboxDotsContainer.innerHTML = "";
        lightboxDots = [];

        if (!Number.isInteger(totalSlides) || totalSlides <= 1) return;

        for (let index = 0; index < totalSlides; index += 1) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "photo-lightbox-dot";
            dot.setAttribute("aria-label", `Voir la photo ${index + 1}`);
            dot.dataset.targetIndex = String(index);

            dot.addEventListener("click", () => {
                if (!activeLightboxContext?.goTo) return;

                const targetIndex = Number(dot.dataset.targetIndex);
                if (Number.isNaN(targetIndex)) return;

                activeLightboxContext.goTo(targetIndex);
                refreshLightboxImage();
            });

            lightboxDots.push(dot);
            lightboxDotsContainer.appendChild(dot);
        }
    };

    const refreshLightboxImage = () => {
        if (!activeLightboxContext || !lightboxImage) return;

        const activeSlide = activeLightboxContext.getActiveSlide();

        if (!activeSlide) return;

        lightboxImage.src = activeSlide.src;
        lightboxImage.alt = activeSlide.alt || "Photo agrandie";

        if (activeLightboxContext.getIndex) {
            syncLightboxDots(activeLightboxContext.getIndex());
        }
    };

    const animateLightboxImage = (direction) => {
        if (!lightboxImage) return;

        const animationClass = direction === "next" ? "is-slide-next" : "is-slide-prev";

        lightboxImage.classList.remove("is-slide-next", "is-slide-prev");
        void lightboxImage.offsetWidth;
        lightboxImage.classList.add(animationClass);
    };

    const navigateLightbox = (direction) => {
        if (!activeLightboxContext) return;

        if (direction === "next") {
            activeLightboxContext.goNext();
        } else {
            activeLightboxContext.goPrev();
        }

        refreshLightboxImage();
        animateLightboxImage(direction);
    };

    const closeLightbox = () => {
        if (!lightboxOverlay || !lightboxOverlay.classList.contains("is-open")) return;

        lightboxOverlay.classList.remove("is-open");
        lightboxOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("photo-lightbox-open");

        if (activeLightboxContext?.onClose) {
            const callback = activeLightboxContext.onClose;
            activeLightboxContext = null;
            callback();
            return;
        }

        activeLightboxContext = null;
    };

    if (!lightboxOverlay) {
        lightboxOverlay = document.createElement("div");
        lightboxOverlay.className = "photo-lightbox-overlay";
        lightboxOverlay.setAttribute("aria-hidden", "true");
        lightboxOverlay.innerHTML = `
            <div class="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Apercu image">
                <button class="photo-lightbox-nav prev" type="button" aria-label="Image precedente">&#10094;</button>
                <img class="photo-lightbox-image" src="" alt="" tabindex="0">
                <button class="photo-lightbox-nav next" type="button" aria-label="Image suivante">&#10095;</button>
                <div class="photo-lightbox-dots" aria-label="Navigation photos"></div>
            </div>
        `;
        document.body.appendChild(lightboxOverlay);
    }

    lightboxDialog = lightboxOverlay.querySelector(".photo-lightbox-dialog");
    lightboxImage = lightboxOverlay.querySelector(".photo-lightbox-image");
    lightboxPrevButton = lightboxOverlay.querySelector(".photo-lightbox-nav.prev");
    lightboxNextButton = lightboxOverlay.querySelector(".photo-lightbox-nav.next");
    lightboxDotsContainer = lightboxOverlay.querySelector(".photo-lightbox-dots");

    const legacyLightboxCloseButton = lightboxOverlay.querySelector(".photo-lightbox-close");
    if (legacyLightboxCloseButton) {
        legacyLightboxCloseButton.remove();
    }

    if (!lightboxDotsContainer && lightboxDialog) {
        lightboxDotsContainer = document.createElement("div");
        lightboxDotsContainer.className = "photo-lightbox-dots";
        lightboxDotsContainer.setAttribute("aria-label", "Navigation photos");
        lightboxDialog.appendChild(lightboxDotsContainer);
    }

    lightboxOverlay.addEventListener("click", (event) => {
        if (event.target === lightboxOverlay) {
            closeLightbox();
        }
    });

    lightboxDialog?.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    lightboxImage?.addEventListener("animationend", () => {
        lightboxImage.classList.remove("is-slide-next", "is-slide-prev");
    });

    const setLightboxImageFocusState = (isFocused) => {
        if (!lightboxDialog || !lightboxOverlay) return;
        lightboxDialog.classList.toggle("image-focus", isFocused);
        lightboxOverlay.classList.toggle("image-focus", isFocused);
    };

    lightboxImage?.addEventListener("mouseenter", () => setLightboxImageFocusState(true));
    lightboxImage?.addEventListener("mouseleave", () => setLightboxImageFocusState(false));
    lightboxImage?.addEventListener("focus", () => setLightboxImageFocusState(true));
    lightboxImage?.addEventListener("blur", () => setLightboxImageFocusState(false));
    lightboxImage?.addEventListener("click", () => closeLightbox());
    lightboxImage?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            closeLightbox();
        }
    });

    lightboxPrevButton?.addEventListener("click", () => {
        navigateLightbox("prev");
    });

    lightboxNextButton?.addEventListener("click", () => {
        navigateLightbox("next");
    });

    document.addEventListener("keydown", (event) => {
        if (!lightboxOverlay.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowRight") {
            navigateLightbox("next");
        } else if (event.key === "ArrowLeft") {
            navigateLightbox("prev");
        }
    });

    const openLightbox = (context) => {
        if (!lightboxImage) return;

        activeLightboxContext = context;
        buildLightboxDots(activeLightboxContext.getTotal?.() ?? 0);
        refreshLightboxImage();

        lightboxOverlay.classList.add("is-open");
        lightboxOverlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("photo-lightbox-open");
        lightboxOverlay.classList.remove("image-focus");
        lightboxDialog?.classList.remove("image-focus");
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    stacks.forEach((stack, stackIndex) => {
        const slides = stack.querySelectorAll(".photo-slide");
        const backButton = stack.querySelector(".photo-card-back");
        const middleButton = stack.querySelector(".photo-card-middle");
        const backCardImage = backButton?.querySelector("img");
        const middleCardImage = middleButton?.querySelector("img");

        if (slides.length <= 1) return;

        let currentIndex = 0;
        let intervalId;

        const syncCards = (activeIndex) => {
            const middleIndex = (activeIndex + 1) % slides.length;
            const backIndex = (activeIndex + 2) % slides.length;

            if (middleCardImage) {
                middleCardImage.src = slides[middleIndex].src;
                middleCardImage.alt = slides[middleIndex].alt;
            }

            if (backCardImage) {
                backCardImage.src = slides[backIndex].src;
                backCardImage.alt = slides[backIndex].alt;
            }

            if (middleButton) {
                middleButton.dataset.targetIndex = String(middleIndex);
                middleButton.setAttribute("aria-label", `Afficher ${slides[middleIndex].alt.toLowerCase()}`);
            }

            if (backButton) {
                backButton.dataset.targetIndex = String(backIndex);
                backButton.setAttribute("aria-label", `Afficher ${slides[backIndex].alt.toLowerCase()}`);
            }
        };

        const showSlide = (nextIndex) => {
            if (nextIndex === currentIndex) return;
            slides[currentIndex].classList.remove("is-active");
            slides[nextIndex].classList.add("is-active");
            currentIndex = nextIndex;
            syncCards(currentIndex);
        };

        const startAutoPlay = () => {
            if (reduceMotion) return;

            clearInterval(intervalId);
            intervalId = setInterval(() => {
                const nextIndex = (currentIndex + 1) % slides.length;
                showSlide(nextIndex);
            }, 3600 + stackIndex * 500);
        };

        const handleCardClick = (event) => {
            const targetIndex = Number(event.currentTarget.dataset.targetIndex);

            if (Number.isNaN(targetIndex)) return;

            showSlide(targetIndex);
            startAutoPlay();
        };

        const handleFrontSlideClick = (event) => {
            if (!event.currentTarget.classList.contains("is-active")) return;

            clearInterval(intervalId);
            openLightbox({
                getActiveSlide: () => slides[currentIndex],
                getIndex: () => currentIndex,
                getTotal: () => slides.length,
                goNext: () => showSlide((currentIndex + 1) % slides.length),
                goPrev: () => showSlide((currentIndex - 1 + slides.length) % slides.length),
                goTo: (targetIndex) => showSlide(targetIndex),
                onClose: startAutoPlay
            });
        };

        syncCards(currentIndex);

        [backButton, middleButton].forEach((button) => {
            if (!button) return;
            button.addEventListener("click", handleCardClick);
        });

        slides.forEach((slide) => {
            slide.addEventListener("click", handleFrontSlideClick);
        });

        if (reduceMotion) {
            slides.forEach((slide, index) => {
                slide.classList.toggle("is-active", index === 0);
            });
            syncCards(0);
            return;
        }

        startAutoPlay();
    });

});