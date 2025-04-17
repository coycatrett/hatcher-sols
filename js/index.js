/** Controls the webpage and its functionality **/

async function homePageContent() {
    const response = await fetch("/pages/home.html");
    
    if (!response.ok) {
        console.log("Failed to fetch home page!");
        const error = await fetch("/pages/404.html");
        document.getElementById("content").innerHTML = error.text();
        return;
    }

    const homeHTML = await response.text();
    document.getElementById("content").innerHTML = homeHTML;
}