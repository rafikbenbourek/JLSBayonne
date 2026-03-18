document.addEventListener("dragstart", function (e) {
    e.preventDefault();
});

// VERROUILLAGE SCROLL SANS DEPLACEMENT DE MISE EN PAGE
let bodyScrollLocks = 0;

function lockBodyScroll() {
    bodyScrollLocks += 1;
    if (bodyScrollLocks > 1) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const computedPaddingRight = window.getComputedStyle(document.body).paddingRight;
    const basePaddingRight = parseFloat(computedPaddingRight) || 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${basePaddingRight + scrollbarWidth}px`;
    }
}

function unlockBodyScroll() {
    if (bodyScrollLocks === 0) return;
    bodyScrollLocks -= 1;
    if (bodyScrollLocks > 0) return;

    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
}

window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;

// COMPTEUR PANIER
function updateCartCount(animated = false) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const badge = document.querySelector(".cart-count");

    badge.textContent = totalItems;

    if (totalItems === 0) {
        badge.classList.add("hidden");
    } else {
        badge.classList.remove("hidden");
    }

    if (animated) {
        badge.classList.remove("bump");
        void badge.offsetWidth;
        badge.classList.add("bump");
    }
}

updateCartCount();

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

// PANNEAUX LATÉRAUX (favoris, compte, panier)
document.addEventListener("DOMContentLoaded", function () {

    const overlay = document.getElementById("side-panel-overlay");
    const panels = document.querySelectorAll(".side-panel");
    const triggers = document.querySelectorAll("[data-panel-trigger]");

    function openPanel(id) {
        panels.forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(id);
        if (!panel) return;
        panel.classList.add("active");
        overlay.classList.add("active");
        lockBodyScroll();
        if (id === "panel-panier") renderCartPanel();
    }

    function closeAllPanels() {
        panels.forEach(p => p.classList.remove("active"));
        overlay.classList.remove("active");
        unlockBodyScroll();
    }

    triggers.forEach(trigger => {
        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.dataset.panelTrigger;
            const isOpen = document.getElementById(targetId)?.classList.contains("active");
            isOpen ? closeAllPanels() : openPanel(targetId);
        });
    });

    overlay.addEventListener("click", closeAllPanels);

    document.querySelectorAll(".side-panel-close").forEach(btn => {
        btn.addEventListener("click", closeAllPanels);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeAllPanels();
    });

    function renderCartPanel() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const body = document.getElementById("panel-panier-items");
        const footer = document.getElementById("panel-panier-footer");
        if (!body || !footer) return;

        if (cart.length === 0) {
            body.innerHTML = `
                <div class="side-panel-empty-state">
                    <svg viewBox="0 0 24 24" width="52" height="52" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#c8b49a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <p>Votre panier est vide.</p>
                    <a href="/boutique/produits/" class="side-panel-btn">Continuer mes achats</a>
                </div>`;
            footer.style.display = "none";
            return;
        }

        let total = 0;
        let html = "<ul class=\"side-panel-cart-list\">";
        cart.forEach(item => {
            const qty = item.quantity || 1;
            const price = item.price || 0;
            const itemTotal = price * qty;
            total += itemTotal;
            html += `
                <li class="side-panel-cart-item">
                    ${item.image ? `<img src="${item.image}" alt="">` : ""}
                    <div class="side-panel-cart-info">
                        <span class="side-panel-cart-name">${item.name}</span>
                        <span class="side-panel-cart-qty">Qté : ${qty}</span>
                        <span class="side-panel-cart-price">${itemTotal.toFixed(2).replace(".", ",")} €</span>
                    </div>
                </li>`;
        });
        html += "</ul>";
        body.innerHTML = html;
        const totalEl = document.getElementById("panel-panier-total");
        if (totalEl) totalEl.textContent = total.toFixed(2).replace(".", ",") + " €";
        footer.style.display = "block";
    }

});

// NEWSLETTER VALIDATION INSCRIPTION (animation fleurs)
document.addEventListener("DOMContentLoaded", function () {

    const newsletterForm = document.getElementById("newsletter-form");
    const successMessage = document.getElementById("newsletter-success");
    const flowerZone = document.getElementById("flower-confetti");

    if (!newsletterForm) return;

    newsletterForm.addEventListener("submit", function (e) {

        e.preventDefault();

        newsletterForm.style.display = "none";
        successMessage.style.display = "block";

        launchPetals();

    });

    function launchPetals() {

        const petals = ["🌸", "🌺", "🌷", "🌼"];

        for (let i = 0; i < 30; i++) {

            const petal = document.createElement("div");

            petal.classList.add("petal");
            petal.style.top = "-20px";
            petal.innerText = petals[Math.floor(Math.random() * petals.length)];

            petal.style.left = Math.random() * 480 + "px";

            petal.style.fontSize = (14 + Math.random() * 10) + "px";

            petal.style.animationDuration = (3 + Math.random() * 2) + "s";

            petal.style.animationDelay = (Math.random() * 0.5) + "s";
            const dx = (Math.random() * 60 - 30).toFixed(1);
            petal.style.setProperty('--dx', dx + 'px');

            flowerZone.appendChild(petal);

            setTimeout(() => {
                petal.remove();
            }, 5000);

        }

    }

});

// BOUTON RETOUR EN HAUT
const scrollBtn = document.getElementById("scrollTopBtn");
const circle = document.querySelector(".progress-ring-circle");

const radius = 26;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

let lastScroll = 0;

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    /* progression cercle */
    const progress = scrollTop / docHeight;
    const offset = circumference - progress * circumference;
    circle.style.strokeDashoffset = offset;

    /* apparition quand on remonte */
    if (scrollTop < lastScroll && scrollTop > 400) {
        scrollBtn.classList.add("show");
    } else {
        scrollBtn.classList.remove("show");
    }

    lastScroll = scrollTop;

});
// BOUTON RETOUR VERS LE HAUT (durée lors du clique)
scrollBtn.addEventListener("click", () => {

    const start = window.scrollY;
    const duration = 900; // durée du scroll (plus grand = plus lent)
    const startTime = performance.now();

    function scrollStep(currentTime) {

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easing très fluide
        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start * (1 - ease));

        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        }
    }

    requestAnimationFrame(scrollStep);

});

// BOUTON RETOUR VERS LE HAUT (effet lors du clique)
scrollBtn.addEventListener("click", () => {

    scrollBtn.classList.add("flower-active");

    const start = window.scrollY;
    const duration = 1000;
    const startTime = performance.now();

    function scrollStep(time) {

        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start * (1 - ease));

        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        }
        else {
            scrollBtn.classList.remove("flower-active");
        }

    }

    requestAnimationFrame(scrollStep);

});

// INFO CAROUSEL (animation et boutons)
document.addEventListener('DOMContentLoaded', function () {
    const messages = [
        "Livraison offerte dès 49€ d'achat en France métropolitaine",
        "Retrait gratuit en boutique à Bayonne",
        "Paiement sécurisé via PayPal",
        "Retours sous 14 jours",
        "Service client réactif"
    ];
    let current = 0;
    const track = document.querySelector('.info-carousel-track');
    let autoplay = setInterval(() => {
        current = (current + 1) % messages.length;
        showMessage(current);
    }, 4000);

    function showMessage(index) {
        track.classList.add('fade-out');
        setTimeout(() => {
            track.innerHTML = `<span>${messages[index]}</span>`;
            track.classList.remove('fade-out');
            track.classList.add('fade-in');
            setTimeout(() => {
                track.classList.remove('fade-in');
            }, 170); // Fondu d'entrée rapide
        }, 270); // Fondu de sortie rapide
    }

    document.querySelector('.info-carousel-prev').onclick = function () {
        clearInterval(autoplay);
        current = (current - 1 + messages.length) % messages.length;
        showMessage(current);
    };
    document.querySelector('.info-carousel-next').onclick = function () {
        clearInterval(autoplay);
        current = (current + 1) % messages.length;
        showMessage(current);
    };
    showMessage(current);
});

// BLUR HEADER AU SCROLL
window.addEventListener("scroll", () => {

    const header = document.querySelector(".header");

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});

// BLUR SEARCH AU SCROLL
window.addEventListener("scroll", () => {

    const search = document.querySelector(".header-search");

    if (window.scrollY > 50) {
        search.classList.add("scrolled");
    } else {
        search.classList.remove("scrolled");
    }

});