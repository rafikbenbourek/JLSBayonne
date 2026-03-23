// BURGER MENU + SOUS-MENUS EN MOBILE
document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".burger");
    const menu = document.querySelector(".menu");

    if (!burger || !menu) return;

    const submenuItems = Array.from(menu.querySelectorAll(".submenu-container"));

    const closeAllSubmenus = () => {
        submenuItems.forEach((item) => item.classList.remove("is-open"));
    };

    burger.addEventListener("click", () => {
        const isOpening = !menu.classList.contains("mobile");
        burger.classList.toggle("active", isOpening);
        menu.classList.toggle("mobile", isOpening);

        if (!isOpening) {
            closeAllSubmenus();
        }
    });

    submenuItems.forEach((item) => {
        const trigger = item.querySelector(":scope > a");
        const submenu = item.querySelector(":scope > .submenu");
        if (!trigger || !submenu) return;

        trigger.addEventListener("click", (event) => {
            if (!menu.classList.contains("mobile")) return;

            event.preventDefault();
            const willOpen = !item.classList.contains("is-open");

            closeAllSubmenus();
            item.classList.toggle("is-open", willOpen);
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            menu.classList.remove("mobile");
            burger.classList.remove("active");
            closeAllSubmenus();
        }
    });
});