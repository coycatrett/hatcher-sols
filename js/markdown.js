/** Controls and configures how markdown is handled withing the document **/
async function loadMarkdown(filename) {
    const response = await fetch(filename);
    const text = await response.text();

    // Convert Markdown to HTML
    const html = marked.parse(text);

    // Insert into the page
    // TODO: parse filename to obtain id or add new arguments
    document.getElementById("solution-container").innerHTML = html;
}

// Example: Load a markdown file when page loads
loadMarkdown("../sols/0/1/1.md");
