async function loadMarkdown(filename) {
    const response = await fetch(filename);
    const text = await response.text();

    // Convert Markdown to HTML (basic)
    const html = marked.parse(text);

    // Insert into the page
    // TODO: parse filename to obtain id
    document.getElementById("solution-container").innerHTML = html;
}

// Example: Load q1.md when page loads
loadMarkdown("../sols/0/1/1.md");
