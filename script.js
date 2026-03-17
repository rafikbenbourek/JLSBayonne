document.addEventListener("dragstart", function (e) {
    e.preventDefault();
});

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