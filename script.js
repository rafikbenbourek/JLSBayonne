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