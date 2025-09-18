function toggleNavMenu() {
    document.getElementById("nav-menu").classList.toggle("active");
    document.getElementById("content").classList.toggle("active");
    document.body.classList.toggle("inactive");
}


function closeNavMenu() {
    document.getElementById("nav-menu").classList.remove("active");
    document.getElementById("content").classList.remove("active");
    document.body.classList.remove("inactive");
}


// Prevent clicks on the menu itself from closing it
document.getElementById("nav-menu").addEventListener("click", e => e.stopPropagation());


// Prevent clicks on the toggle button from bubbling up
document.getElementById("nav-menu-btn").addEventListener("click", e => e.stopPropagation());


// Clicking anywhere else closes the menu
document.addEventListener("click", () => closeNavMenu());


// Close nav menu when Escape key is pressed
document.addEventListener("keydown", e => { if (e.key === "Escape") closeNavMenu() });
