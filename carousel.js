let slides = document.querySelectorAll(".carousel-slide");
let dots = document.querySelectorAll(".dot");

let index = 0;
let duration = 8000; // 8s
let timeoutId;

function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");

    index = i;

    // relancer l'autoplay proprement
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        showSlide((index + 1) % slides.length);
    }, duration);
}

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