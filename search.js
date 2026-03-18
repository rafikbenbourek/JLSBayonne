// ANIMATION DE LA BARRE DE RECHERCHE SUR HEADER

const searchToggle = document.querySelector(".search-toggle");
const searchOverlay = document.querySelector(".header-search-overlay");
const searchBar = document.querySelector(".header-search");
const searchClose = document.querySelector(".search-close");
const searchIconInput = document.querySelector(".search-icon-input");
const headerSearchInput = document.querySelector(".header-search input");

function closeSearchOverlay() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("active");
    if (typeof window.unlockBodyScroll === "function") {
        window.unlockBodyScroll();
    }
}

/* ouverture */
if(searchToggle && searchOverlay && headerSearchInput) {
    searchToggle.addEventListener("click", () => {
        searchOverlay.classList.add("active");
        if (typeof window.lockBodyScroll === "function") {
            window.lockBodyScroll();
        }
        setTimeout(() => {
            headerSearchInput.focus();
        }, 200);
    });
}

/* fermeture avec croix */
if(searchClose && searchOverlay) {
    searchClose.addEventListener("click", () => {
        closeSearchOverlay();
    });
}

/* fermeture ESC */
if(searchOverlay) {
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape") {
            closeSearchOverlay();
        }
    });
}

/* clic hors barre */
if(searchOverlay) {
    searchOverlay.addEventListener("click", (e) => {
        if(!e.target.closest(".header-search")) {
            closeSearchOverlay();
        }
    });
}

/* clic sur icone dans l'input */
if(searchIconInput && headerSearchInput) {
    searchIconInput.addEventListener("click", () => {
        headerSearchInput.focus();
    });
}