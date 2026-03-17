// BURGER MENU
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');

if (burger && menu) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('mobile');
    });
}