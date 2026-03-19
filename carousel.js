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

// CAROUSEL DE MARQUES (pause au survol)
const carousel = document.querySelector('.brands-carousel-vertical');
const track = document.querySelector('.brands-track-vertical');

if (carousel && track) {
    const anim = track.getAnimations()[0];
    let rafId;

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tweenPlaybackRate(target, duration = 350) {
        if (!anim) return;
        cancelAnimationFrame(rafId);

        const startRate = anim.playbackRate || 1;
        const startTime = performance.now();

        if (target > 0 && anim.playState === 'paused') anim.play();

        const tick = (now) => {
            const p = Math.min((now - startTime) / duration, 1);
            anim.playbackRate = startRate + (target - startRate) * easeOut(p);

            if (p < 1) {
                rafId = requestAnimationFrame(tick);
            } else if (target === 0) {
                anim.pause();
            }
        };

        rafId = requestAnimationFrame(tick);
    }

    carousel.addEventListener('mouseenter', () => tweenPlaybackRate(0, 500));
    carousel.addEventListener('mouseleave', () => tweenPlaybackRate(1, 500));
}

// CAROUSEL FONDU IMAGES PHILOSOPHIE
document.addEventListener("DOMContentLoaded", function () {

    const stacks = document.querySelectorAll(".photo-stack[data-fade-carousel]");

    if (!stacks.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    stacks.forEach((stack, stackIndex) => {
        const slides = stack.querySelectorAll(".photo-slide");

        if (slides.length <= 1) return;

        let currentIndex = 0;

        const showSlide = (nextIndex) => {
            slides[currentIndex].classList.remove("is-active");
            slides[nextIndex].classList.add("is-active");
            currentIndex = nextIndex;
        };

        if (reduceMotion) {
            slides.forEach((slide, index) => {
                slide.classList.toggle("is-active", index === 0);
            });
            return;
        }

        setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            showSlide(nextIndex);
        }, 3600 + stackIndex * 500);
    });

});