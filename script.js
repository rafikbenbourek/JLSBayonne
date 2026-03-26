document.addEventListener("dragstart", function (e) {
    e.preventDefault();
});

// MEGA MENU MODE FEMME: titres cliquables vers la page catalogue avec filtre preselectionne
document.addEventListener("DOMContentLoaded", () => {
    const universByTitle = {
        vetements: "vetements",
        chaussures: "chaussures",
        accessoires: "accessoires",
    };

    const categoryAliasMap = {
        robes: "robes",
        jupes: "jupes",
        pantalons: "pantalons",
        vestes: "vestes",
        basket: "basket",
        "bottines-boots": "bottines-boots",
        bottines_boots: "bottines-boots",
        sacs_maroquinerie: "sacs_maroquinerie",
        bijoux_fantaisie: "bijoux_fantaisie",
    };

    const pageUniversConfig = {
        "mode-femme.html": new Set(["vetements", "chaussures", "accessoires"]),
        "soins-bien-etre.html": new Set(["parfums", "savons_artisanaux", "soins_corps", "soins_visage", "bougies_senteurs"]),
        "decoration.html": new Set(["tapis_berberes", "vases_artisanaux", "bougies_lanternes", "plateaux_traditionnels", "decorations_autres"]),
    };

    const normalizeText = (value) =>
        (value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    document.querySelectorAll(".submenu-mega-title").forEach((title) => {
        const normalizedTitle = normalizeText(title.textContent);
        const univers = universByTitle[normalizedTitle];
        if (!univers) return;

        const targetUrl = `mode-femme.html?univers=${encodeURIComponent(univers)}`;

        const navigateToModeFemme = () => {
            window.location.href = targetUrl;
        };

        title.classList.add("submenu-mega-title--link");
        title.setAttribute("role", "link");
        title.setAttribute("tabindex", "0");

        title.addEventListener("click", navigateToModeFemme);
        title.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigateToModeFemme();
            }
        });
    });

    // Liens de sous-categories: redirection vers mode-femme + univers + categorie
    document.querySelectorAll(".submenu-mega-col").forEach((column) => {
        const title = column.querySelector(".submenu-mega-title");
        if (!title) return;

        const univers = universByTitle[normalizeText(title.textContent)];
        if (!univers) return;

        column.querySelectorAll("a[href]").forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();

                const rawHref = link.getAttribute("href") || "";
                const sourceUrl = new URL(rawHref, window.location.origin);
                const rawCategory = sourceUrl.searchParams.get("CAT") || "";
                const mappedCategory = categoryAliasMap[rawCategory] || null;

                const targetUrl = new URL("mode-femme.html", window.location.origin);
                targetUrl.searchParams.set("univers", univers);
                if (mappedCategory) {
                    targetUrl.searchParams.set("categorie", mappedCategory);
                }

                window.location.href = `${targetUrl.pathname}${targetUrl.search}`;
            });
        });
    });

    // Sous-menus classiques (Soins & Bien-etre, Decoration): redirection avec filtre famille preselectionne
    document.querySelectorAll(".submenu:not(.submenu-mega) a[href*='CAT=']").forEach((link) => {
        link.addEventListener("click", (event) => {
            const container = link.closest(".submenu-container");
            const parentMenuLink = container?.querySelector("a.has-submenu");
            const pageHref = parentMenuLink?.getAttribute("href") || "";
            const pageName = pageHref.split("?")[0].trim();
            const allowedUniverses = pageUniversConfig[pageName];
            if (!allowedUniverses) return;

            const sourceUrl = new URL(link.getAttribute("href") || "", window.location.origin);
            const univers = sourceUrl.searchParams.get("CAT") || "";
            if (!allowedUniverses.has(univers)) return;

            event.preventDefault();

            const targetUrl = new URL(pageName, window.location.origin);
            targetUrl.searchParams.set("univers", univers);
            window.location.href = `${targetUrl.pathname}${targetUrl.search}`;
        });
    });
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

// MICRO CTA SUR CLIC DES ICONES HEADER

// Masquer le bloc de filtres s'il n'y a aucun filtre affichable
function updateCatalogFiltersVisibility() {
    const filters = document.querySelector('.catalog-filters');
    if (!filters) return;
    // On considère qu'un filtre affichable n'a pas la classe .is-zero
    const visibleFilters = filters.querySelectorAll('.filter-option:not(.is-zero)');
    filters.classList.toggle('is-empty', visibleFilters.length === 0);
}

// Exécuter au chargement
updateCatalogFiltersVisibility();

// (Optionnel) Si les filtres peuvent changer dynamiquement, réexécuter après chaque mise à jour
// Exemple : window.addEventListener('filtersUpdated', updateCatalogFiltersVisibility);
const headerIcons = document.querySelectorAll(".icon-wrapper");

headerIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
        icon.classList.remove("is-clicked");
        void icon.offsetWidth;
        icon.classList.add("is-clicked");

        setTimeout(() => {
            icon.classList.remove("is-clicked");
        }, 320);
    });
});

// WIDGET CONTACT VERTICAL
document.addEventListener("DOMContentLoaded", function () {
    const widget = document.getElementById("contact-widget");
    if (!widget) return;

    const toggle = widget.querySelector(".contact-widget-toggle");
    const panel = widget.querySelector(".contact-widget-panel");
    if (!toggle || !panel) return;

    function setWidgetState(isOpen) {
        widget.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        panel.setAttribute("aria-hidden", String(!isOpen));
    }

    toggle.addEventListener("click", function () {
        const currentlyOpen = widget.classList.contains("is-open");
        setWidgetState(!currentlyOpen);
    });

    document.addEventListener("click", function (e) {
        if (!widget.contains(e.target)) {
            setWidgetState(false);
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            setWidgetState(false);
        }
    });
});

// PANNEAUX LATÉRAUX (Favoris, Compte, Panier)
document.addEventListener("DOMContentLoaded", function () {

    const overlay = document.getElementById("side-panel-overlay");
    const panels = document.querySelectorAll(".side-panel");
    const triggers = document.querySelectorAll("[data-panel-trigger]");

    function openPanel(id) {
        panels.forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(id);
        if (!panel) return;
        panel.classList.add("active");
        triggers.forEach(trigger => {
            trigger.classList.toggle("is-active", trigger.dataset.panelTrigger === id);
        });
        overlay.classList.add("active");
        lockBodyScroll();
        if (id === "panel-panier") renderCartPanel();
    }

    function closeAllPanels() {
        panels.forEach(p => p.classList.remove("active"));
        triggers.forEach(trigger => trigger.classList.remove("is-active"));
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

// NEWSLETTER VALIDATION INSCRIPTION (animation des fleurs)
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

// BOUTON RETOUR EN HAUT ↑
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
// BOUTON RETOUR VERS LE HAUT ↑ (durée lors du clique)
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

// BOUTON RETOUR VERS LE HAUT ↑ (effet lors du clique)
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

// BOUTON FAVORIS CARTE PRODUIT
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".produit-card-fav").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const isActive = btn.classList.toggle("is-active");
            btn.setAttribute("aria-pressed", isActive);
        });
    });
});

// MODALE PRODUIT (QUICK VIEW CATALOGUE)
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector("[data-product-modal]");
    const cards = Array.from(document.querySelectorAll(".catalog-grid .product-card"));
    if (!modal || cards.length === 0) return;

    const modalImage = modal.querySelector("[data-product-modal-image]");
    const modalCategory = modal.querySelector("[data-product-modal-category]");
    const modalTitle = modal.querySelector("[data-product-modal-title]");
    const modalPrice = modal.querySelector("[data-product-modal-price]");
    const modalStyle = modal.querySelector("[data-product-modal-style]");
    const modalBrand = modal.querySelector("[data-product-modal-brand]");
    const modalDescription = modal.querySelector("[data-product-modal-description]");
    const modalSku = modal.querySelector("[data-product-modal-sku]");
    const modalStock = modal.querySelector("[data-product-modal-stock]");
    const modalHighlights = modal.querySelector("[data-product-modal-highlights]");
    const modalThumbs = modal.querySelector("[data-product-modal-thumbs]");
    const modalMainImageWrap = modal.querySelector(".product-modal-main-image-wrap");
    const qtyInput = modal.querySelector("[data-product-modal-qty-input]");
    const qtyMinus = modal.querySelector("[data-product-modal-qty-minus]");
    const qtyPlus = modal.querySelector("[data-product-modal-qty-plus]");
    const addToCartBtn = modal.querySelector("[data-product-modal-add]");
    const closeTargets = Array.from(modal.querySelectorAll("[data-product-modal-close]"));
    let currentGallerySources = [];

    const lightbox = document.createElement("div");
    lightbox.className = "product-lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
        <div class="product-lightbox-overlay" data-product-lightbox-close></div>
        <section class="product-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Apercu image produit">
            <button class="product-lightbox-close" type="button" aria-label="Fermer" data-product-lightbox-close>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
            <div class="product-lightbox-thumbs" data-product-lightbox-thumbs></div>
            <div class="product-lightbox-main">
                <img src="" alt="" data-product-lightbox-image>
            </div>
        </section>`;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("[data-product-lightbox-image]");
    const lightboxThumbs = lightbox.querySelector("[data-product-lightbox-thumbs]");
    const lightboxCloseTargets = Array.from(lightbox.querySelectorAll("[data-product-lightbox-close]"));

    const setMainModalImage = (imgData, activeButton = null) => {
        if (!imgData || !modalImage) return;
        modalImage.src = imgData.src;
        modalImage.alt = imgData.alt;
        if (modalThumbs) {
            modalThumbs.querySelectorAll(".product-modal-thumb").forEach((el) => {
                el.classList.remove("is-active");
            });
            if (activeButton) activeButton.classList.add("is-active");
        }
    };

    const showLightboxImage = (imgData, thumb) => {
        if (!imgData || !lightboxImage) return;
        lightboxImage.src = imgData.src;
        lightboxImage.alt = imgData.alt;
        lightboxThumbs.querySelectorAll(".product-lightbox-thumb").forEach((el) => {
            el.classList.remove("is-active");
        });
        thumb?.classList.add("is-active");
    };

    const openLightbox = (startIndex = 0) => {
        if (!currentGallerySources.length) return;
        lightboxThumbs.innerHTML = "";

        currentGallerySources.forEach((imgData, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "product-lightbox-thumb";
            btn.innerHTML = `<img src="${imgData.src}" alt="">`;
            if (index === startIndex) btn.classList.add("is-active");
            btn.addEventListener("click", () => showLightboxImage(imgData, btn));
            btn.addEventListener("mouseenter", () => showLightboxImage(imgData, btn));
            lightboxThumbs.appendChild(btn);
        });

        showLightboxImage(currentGallerySources[startIndex], lightboxThumbs.children[startIndex]);
        lightbox.hidden = false;
        requestAnimationFrame(() => lightbox.classList.add("is-open"));
    };

    const closeLightbox = () => {
        lightbox.classList.remove("is-open");
        window.setTimeout(() => {
            lightbox.hidden = true;
        }, 180);
    };

    const clampQty = (value) => {
        const n = Number.parseInt(value, 10);
        if (Number.isNaN(n) || n < 1) return 1;
        return n;
    };

    const openModal = (card) => {
        const productName = card.querySelector("strong")?.textContent?.trim() || "Produit";
        const detailsText = card.querySelector("span")?.textContent?.trim() || "";
        const details = detailsText.split("•").map((item) => item.trim()).filter(Boolean);
        const image = card.querySelector(".product-card-img");
        const allImages = Array.from(card.querySelectorAll(".product-card-img")).map((img) => ({
            src: img.currentSrc || img.src,
            alt: img.alt || productName
        }));

        const category = details[0] || "Collection";
        const style = details[1] || "Style signature";
        const brand = details[2] || "Maison";
        const price = details[3] || "Prix sur demande";
        const sku = `SKU-${productName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;

        modalTitle.textContent = productName;
        modalCategory.textContent = category;
        modalStyle.textContent = style;
        modalBrand.textContent = brand;
        modalPrice.textContent = price;
        modalSku.textContent = sku;
        modalStock.textContent = "En stock";
        modalDescription.textContent = `${productName} est une piece selectionnee en boutique pour son equilibre entre confort, coupe et style. Son allure ${style.toLowerCase()} s'adapte aussi bien au quotidien qu'aux occasions speciales.`;

        if (modalHighlights) {
            const points = [
                `Categorie: ${category}`,
                `Style: ${style}`,
                `Marque: ${brand}`
            ];

            modalHighlights.innerHTML = "";
            points.forEach((point) => {
                const li = document.createElement("li");
                li.textContent = point;
                modalHighlights.appendChild(li);
            });
        }

        if (image) {
            modalImage.src = image.currentSrc || image.src;
            modalImage.alt = image.alt || productName;
        }

        if (modalThumbs) {
            const sources = allImages.length > 0 ? allImages : [{ src: modalImage.src, alt: modalImage.alt }];
            currentGallerySources = sources;
            modalThumbs.innerHTML = "";

            sources.forEach((imgData, index) => {
                const thumbBtn = document.createElement("button");
                thumbBtn.type = "button";
                thumbBtn.className = "product-modal-thumb";
                thumbBtn.setAttribute("aria-label", `Afficher photo ${index + 1}`);
                thumbBtn.innerHTML = `<img src="${imgData.src}" alt="">`;

                if (index === 0) thumbBtn.classList.add("is-active");

                const showThumbImage = () => setMainModalImage(imgData, thumbBtn);

                thumbBtn.addEventListener("click", showThumbImage);
                thumbBtn.addEventListener("mouseenter", showThumbImage);
                thumbBtn.addEventListener("focus", showThumbImage);

                modalThumbs.appendChild(thumbBtn);
            });
        }

        qtyInput.value = "1";
        addToCartBtn.textContent = "Ajouter au panier";
        addToCartBtn.classList.remove("is-added");

        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        lockBodyScroll();
        document.documentElement.classList.add("product-modal-open");
        document.body.classList.add("product-modal-open");
        requestAnimationFrame(() => {
            modal.classList.add("is-open");
        });
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        unlockBodyScroll();
        document.documentElement.classList.remove("product-modal-open");
        document.body.classList.remove("product-modal-open");
        window.setTimeout(() => {
            modal.hidden = true;
        }, 200);
    };

    cards.forEach((card) => {
        card.tabIndex = 0;
        card.addEventListener("click", (event) => {
            if (event.target.closest(".produit-card-fav")) return;
            openModal(card);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            if (event.target.closest(".produit-card-fav")) return;
            event.preventDefault();
            openModal(card);
        });
    });

    closeTargets.forEach((target) => {
        target.addEventListener("click", closeModal);
    });

    lightboxCloseTargets.forEach((target) => {
        target.addEventListener("click", closeLightbox);
    });

    modalMainImageWrap?.addEventListener("mousemove", (event) => {
        if (!modalImage || modal.hidden) return;
        const rect = modalMainImageWrap.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        modalMainImageWrap.classList.add("is-zooming");
        modalImage.style.transformOrigin = `${x}% ${y}%`;
        modalImage.style.transform = "scale(1.72)";
    });

    modalMainImageWrap?.addEventListener("mouseleave", () => {
        if (!modalImage) return;
        modalMainImageWrap.classList.remove("is-zooming");
        modalImage.style.transformOrigin = "50% 50%";
        modalImage.style.transform = "scale(1)";
    });

    modalMainImageWrap?.addEventListener("click", () => {
        const activeIndex = Array.from(modalThumbs?.children || []).findIndex((el) => el.classList.contains("is-active"));
        openLightbox(activeIndex >= 0 ? activeIndex : 0);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !lightbox.hidden) {
            closeLightbox();
            return;
        }
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    qtyMinus?.addEventListener("click", () => {
        qtyInput.value = String(Math.max(1, clampQty(qtyInput.value) - 1));
    });

    qtyPlus?.addEventListener("click", () => {
        qtyInput.value = String(clampQty(qtyInput.value) + 1);
    });

    qtyInput?.addEventListener("change", () => {
        qtyInput.value = String(clampQty(qtyInput.value));
    });

    addToCartBtn?.addEventListener("click", () => {
        addToCartBtn.classList.add("is-added");
        addToCartBtn.textContent = "Ajoute au panier";
    });
});

// FILTRES CATALOGUE (PAGE NOUVEAUTES)
document.addEventListener("DOMContentLoaded", () => {
    const catalogPage = document.querySelector(".catalog-page");
    const filterInputs = Array.from(document.querySelectorAll(".catalog-filters input[data-filter]"));
    const universInputs = filterInputs.filter((input) => input.dataset.group === "univers");
    const categoryInputs = filterInputs.filter((input) => input.dataset.group === "categorie");
    const countableInputs = filterInputs.filter((input) => input.dataset.group !== "categorie");
    const categoriesTitle = document.querySelector("[data-categories-title]");
    const categoryGroup = document.querySelector('[data-filter-group="categorie"]');
    const cards = Array.from(document.querySelectorAll(".catalog-grid .product-card"));
    const results = document.querySelector("[data-catalog-results]");
    const emptyState = document.querySelector("[data-catalog-empty]");
    const resetButton = document.querySelector("[data-catalog-reset]");

    if (!catalogPage || filterInputs.length === 0 || cards.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const presetUnivers = urlParams.get("univers");
    const presetCategory = urlParams.get("categorie");
    if (presetUnivers) {
        const hasMatchingUnivers = universInputs.some((input) => input.value === presetUnivers);
        if (hasMatchingUnivers) {
            universInputs.forEach((input) => {
                input.checked = input.value === presetUnivers;
            });
        }
    }
    if (presetCategory) {
        const hasMatchingCategory = categoryInputs.some((input) => input.value === presetCategory);
        if (hasMatchingCategory) {
            categoryInputs.forEach((input) => {
                input.checked = input.value === presetCategory;
            });
        }
    }

    const getSelectedByGroup = () => {
        const selected = new Map();

        filterInputs.forEach((input) => {
            if (!input.checked) return;

            const group = input.dataset.group;
            const value = input.value;
            if (!group || !value) return;

            if (!selected.has(group)) selected.set(group, new Set());
            selected.get(group).add(value);
        });

        return selected;
    };

    const getCardTags = (card) => {
        return new Set(
            (card.dataset.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
        );
    };

    const cardMatchesSelectedGroups = (card, selectedByGroup, excludedGroup) => {
        const tags = getCardTags(card);

        return Array.from(selectedByGroup.entries()).every(([group, selectedValues]) => {
            if (group === excludedGroup || selectedValues.size === 0) return true;
            return Array.from(selectedValues).some((value) => tags.has(value));
        });
    };

    const syncOptionCount = (input, count, attributeName = "data-filter-count") => {
        const option = input.closest(".filter-option");
        if (!option) return;

        let countBadge = option.querySelector(`[${attributeName}]`);
        if (!countBadge) {
            countBadge = document.createElement("span");
            countBadge.setAttribute(attributeName, "true");
            option.appendChild(countBadge);
        }

        countBadge.textContent = `(${count})`;
        option.classList.toggle("is-zero", count === 0);
    };

    const getOptionLabel = (input) => {
        const option = input.closest(".filter-option");
        if (!option) return input.value;

        return option.textContent.replace(/\(.*?\)/g, "").trim();
    };

    const sortGroupOptions = (groupName, entries) => {
        const group = document.querySelector(`[data-filter-group="${groupName}"]`);
        if (!group) return;

        entries
            .sort((first, second) => {
                const firstAvailable = first.count > 0 ? 1 : 0;
                const secondAvailable = second.count > 0 ? 1 : 0;
                if (secondAvailable !== firstAvailable) return secondAvailable - firstAvailable;

                const firstChecked = first.input.checked ? 1 : 0;
                const secondChecked = second.input.checked ? 1 : 0;
                if (secondChecked !== firstChecked) return secondChecked - firstChecked;

                if (second.count !== first.count) return second.count - first.count;

                return getOptionLabel(first.input).localeCompare(getOptionLabel(second.input), "fr");
            })
            .forEach(({ option }) => {
                if (option) {
                    group.appendChild(option);
                }
            });
    };

    const updateFilterCounts = (inputs, selectedByGroup, excludedGroup) => {
        const groupedEntries = new Map();

        inputs.forEach((input) => {
            const count = cards.reduce((total, card) => {
                const tags = getCardTags(card);
                if (!tags.has(input.value)) return total;
                if (!cardMatchesSelectedGroups(card, selectedByGroup, excludedGroup)) return total;
                return total + 1;
            }, 0);

            syncOptionCount(input, count);

            const groupName = input.dataset.group;
            const option = input.closest(".filter-option");
            if (groupName) {
                if (!groupedEntries.has(groupName)) groupedEntries.set(groupName, []);
                groupedEntries.get(groupName).push({ input, option, count });
            }

            if (count === 0 && !input.checked) {
                input.disabled = true;
            } else {
                input.disabled = false;
            }
        });

        groupedEntries.forEach((entries, groupName) => {
            sortGroupOptions(groupName, entries);
        });
    };

    const updateCategoryCountsAndOrder = (selectedByGroup) => {
        if (!categoryGroup || categoryInputs.length === 0) return;

        const categoryData = categoryInputs.map((input) => {
            const option = input.closest(".filter-option");
            const count = cards.reduce((total, card) => {
                const tags = getCardTags(card);
                if (!tags.has(input.value)) return total;
                if (!cardMatchesSelectedGroups(card, selectedByGroup, "categorie")) return total;
                return total + 1;
            }, 0);

            syncOptionCount(input, count, "data-category-count");

            if (count === 0 && !input.checked) {
                input.disabled = true;
            } else {
                input.disabled = false;
            }

            return { input, option, count };
        });

        categoryData
            .sort((first, second) => second.count - first.count || first.input.value.localeCompare(second.input.value))
            .forEach(({ option }) => {
                if (option) {
                    categoryGroup.appendChild(option);
                }
            });
    };

    const syncCategoryOptionsFromUnivers = () => {
        if (universInputs.length === 0 || categoryInputs.length === 0) return;

        const selectedUnivers = new Set(
            universInputs
                .filter((input) => input.checked)
                .map((input) => input.value)
        );

        const getUniversLabel = (input) => {
            const option = input.closest(".filter-option");
            if (!option) return input.value;
            return option.textContent.replace(/\(.*?\)/g, "").trim();
        };

        if (categoriesTitle) {
            if (selectedUnivers.size === 1) {
                const selected = universInputs.find((input) => input.checked);
                categoriesTitle.textContent = `Catégories - ${selected ? getUniversLabel(selected) : ""}`;
            } else if (selectedUnivers.size > 1) {
                categoriesTitle.textContent = "Catégories - sélection mixte";
            } else {
                categoriesTitle.textContent = "Catégories";
            }
        }

        categoryInputs.forEach((input) => {
            const option = input.closest(".filter-option");
            const universes = new Set(
                (option?.dataset.universes || "")
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean)
            );

            const isAllowed = selectedUnivers.size === 0
                ? true
                : Array.from(selectedUnivers).some((univers) => universes.has(univers));

            if (!isAllowed) {
                input.checked = false;
            }

            input.disabled = !isAllowed;
            if (option) {
                option.hidden = !isAllowed;
            }
        });
    };

    const applyCatalogFilters = () => {
        syncCategoryOptionsFromUnivers();
        const selectedByGroup = getSelectedByGroup();
        updateFilterCounts(countableInputs, selectedByGroup);
        updateCategoryCountsAndOrder(selectedByGroup);
        let visibleCount = 0;

        cards.forEach((card) => {
            const isVisible = cardMatchesSelectedGroups(card, selectedByGroup);

            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (results) {
            results.textContent = `${visibleCount} article${visibleCount > 1 ? "s" : ""} affiché${visibleCount > 1 ? "s" : ""}`;
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    filterInputs.forEach((input) => {
        input.addEventListener("change", applyCatalogFilters);
    });

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            filterInputs.forEach((input) => {
                input.checked = false;
                input.disabled = false;
                const option = input.closest(".filter-option");
                if (option) option.hidden = false;
            });
            applyCatalogFilters();
        });
    }

    applyCatalogFilters();
});

const filters = document.querySelector('.catalog-filters');
if (filters) {
  const hasFilters = filters.querySelectorAll('.filter-option:not(.is-zero)').length > 0;
  filters.classList.toggle('is-empty', !hasFilters);
}