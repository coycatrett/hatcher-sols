function toggleNavMenu() {
    document.getElementById("nav-menu").classList.toggle("active");
}


function closeNavMenu() {
    document.getElementById("nav-menu").classList.remove("active");
}


// Prevent clicks on the menu itself from closing it
document.getElementById("nav-menu").addEventListener("click", (e) => {
    e.stopPropagation();
});


// Prevent clicks on the toggle button from bubbling up
document.getElementById("nav-menu-btn").addEventListener("click", (e) => {
    e.stopPropagation();
});


// Clicking anywhere else closes the menu
document.addEventListener("click", () => {
    closeNavMenu();
});


// Close nav menu when Escape key is pressed
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeNavMenu();
    }
});