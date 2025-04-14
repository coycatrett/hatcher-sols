/** Controls and configures how markdown is handled withing the document **/
async function loadSol(filename) {
    const response = await fetch(filename);
    const solution = await response.text();

    // Insert into the page
    // TODO: parse filename to obtain id or add new arguments
    document.getElementById("solution-container").innerHTML = solution;
}

// Example: Load a markdown file when page loads
// loadSol("../sols/0/1/1.html");


// solution only needs to load markdown if on that page

// load section function:
// needs to load each solution in that section and generate unique element id for each solution
// for incomplete/non-existent solutions, needs to show an "under construction" page

// load chapter function:
// needs to call each load section function