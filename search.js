// ANIMATION DE LA BARRE DE RECHERCHE SUR HEADER

const searchToggle = document.querySelector(".search-toggle");
const searchOverlay = document.querySelector(".header-search-overlay");
const searchBar = document.querySelector(".header-search");
const searchClose = document.querySelector(".search-close");
const headerSearchInput = document.querySelector(".header-search input");

/* ouverture */
if(searchToggle && searchOverlay && headerSearchInput) {
    searchToggle.addEventListener("click", () => {
        searchOverlay.classList.add("active");
        setTimeout(() => {
            headerSearchInput.focus();
        }, 200);
    });
}

/* fermeture avec croix */
if(searchClose && searchOverlay) {
    searchClose.addEventListener("click", () => {
        searchOverlay.classList.remove("active");
    });
}

/* fermeture ESC */
if(searchOverlay) {
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape") {
            searchOverlay.classList.remove("active");
        }
    });
}

/* clic hors barre */
if(searchOverlay) {
    searchOverlay.addEventListener("click", (e) => {
        if(!e.target.closest(".header-search")) {
            searchOverlay.classList.remove("active");
        }
    });
}