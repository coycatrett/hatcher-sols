// TODO: Fetch global home and 404 pages once
// Debug flag
const DEBUG = true;

/**
 * Required to re-render dynamically loaded MathJax
 * 
 * See [MathJax.typesetPromise documentation](https://docs.mathjax.org/en/latest/web/typeset.html)
 * @param {HTMLElement} [container] - The HTMLElement containing the MathJax to be re-rendered
 */
function renderMathJax(container = document.body) {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([container])
            // .then(() => console.log("MathJax rendered"))
            .catch(err => console.error("MathJax render error:", err));
    }
    else {
        //console.log("MathJax not ready, retrying...");
        setTimeout(() => renderMathJax(container), 100);
    }
}

const prep_funcs = {
    async home(template_path) {
        const template_fragment = await fetch(template_path)
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));
        return template_fragment;
    },
    // TODO: Swap to 404.html page in each catch block
    async exercise(template_path, qual_path, title) {
        /* Fetch Stage */
        // Fetch Solution Template (as new HTML document object)
        const template_fragment = await fetch(template_path)
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));

        // Fetch Exercise Statement
        const statement_path = qual_path + '/statement.html';
        const statement_html = await fetch(statement_path).then(res => res.text());

        // Fetch Solution
        const solution_path = qual_path + '/solution.html';
        const solution_html = await fetch(solution_path).then(res => res.text()).catch(e => Error(e));

        // Fetch exercise.json
        const json_path = qual_path + '/exercise.json';
        const exercise_json = await fetch(json_path).then(res => res.json()).catch(e => Error(e));

        // Fetch Hint Template
        const hint_template_path = '/templates/hint-template.html';
        const hint_fragment = await fetch(hint_template_path)
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));
        // Fetch Hints
        const hints = [];
        const num_hints = exercise_json['num_hints'];
        for (let i = 1; i <= num_hints; i++) {
            const hint_path = `${qual_path}/hints/hint-${i}.html`;
            const hint = await fetch(hint_path).then(res => res.text());
            hints.push(hint);
        }


        /* Build Stage */
        template_fragment.getElementsByClassName('exercise-title')[0].innerHTML = title;
        template_fragment.getElementsByClassName('exercise-statement')[0].innerHTML = statement_html.trim();
        template_fragment.getElementsByClassName('solution-container')[0].innerHTML = solution_html.trim();

        if (hints) {
            template_fragment.getElementsByClassName(['hint-container'])[0].classList.toggle('active');

            const hint_details_innerHTML = hint_fragment.getElementsByClassName('hint-details')[0].innerHTML;
            for (let i = 0; i < num_hints; i++) {
                hint_fragment.getElementsByClassName('hint-details')[0].innerHTML += hints[i];
                template_fragment.getElementsByClassName('hint-container')[0].innerHTML += hint_fragment.body.innerHTML;
                hint_fragment.getElementsByClassName('hint-details')[0].innerHTML = hint_details_innerHTML;
            }
        }

        return template_fragment;
    },
    async chapter(template_path, qual_path, title, chapter_num) {
        /* Fetch Stage */
        // Fetch Chapter Template (as new HTML document object)
        const template_fragment = await fetch(template_path)
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));
        const exercise_fragment = await fetch('/templates/exercise-template.html')
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));

        // Fetch chapter.json
        const json_path = qual_path + '/chapter.json';
        const chapter_json = await fetch(json_path).then(res => res.json()).catch(e => Error(e));
        const chapter_fragment = await fetch(`/content/chapters/chapter-${chapter_num}/chapter-${chapter_num}.html`)
            .then(res => res.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .catch(e => Error(e));
        const num_exercises = chapter_json.num_exercises;

        /* Build Stage */
        // Chapter 0 is the only chapter without sections
        if (chapter_num === '0') {
            for (let i = 1; i <= num_exercises; i++) {
                const exercise_title = `Exercise 0.${i}`;
                const exercise_statement = await fetch(qual_path + `/exercises/exercise-${i}/statement.html`).then(res => res.text());

                exercise_fragment.body.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;

                exercise_fragment.body.getElementsByClassName('exercise-statement')[0].innerHTML = exercise_statement;

                chapter_fragment.body.getElementsByClassName('exercise-ol')[0].innerHTML += exercise_fragment.body.innerHTML;
            }
        }

        return template_fragment;
    }
}


/**
 * Routes the current window.location.pathname to one of the routes in ``routes``
 * and fetches the html at that specific route
 * 
 * The inner html for the spa content is changed along with the title and description of the page
 */
async function locationHandler() {
    let location = window.location.pathname;
    if (DEBUG) console.log('location: ', location);

    const group_id_pairs = location.split('/')
        .filter(string => string !== '')
        .map(arr => arr.split('-'));

    console.log('group_id_pairs:', group_id_pairs);
    let qual_path = '/content';
    group_id_pairs.forEach(group_id_pair => {
        const group = group_id_pair[0];
        const id = group_id_pair[1];

        qual_path += `/${group}s/${group}-${id}`;
    });

    console.log('qual_path: ', qual_path);
    const qual_id = group_id_pairs.map(arr => arr[1]).join('.');

    let template_path;
    let template_fragment;
    let title;
    let description;
    let keywords;

    const group = !group_id_pairs.length ? '' : group_id_pairs.at(-1)[0];
    console.log(group);
    switch (group) {
        case '':
            template_path = '/templates/home.html';
            title = 'Home';
            description = 'Hatcher - Algebraic Topology Solutions: Home Page';
            keywords = 'Hatcher, Algebraic Topology, Solutions, Solution';
            template_fragment = prep_funcs.home(template_path);
            break;

        case 'chapter':
            title = `Chapter ${qual_id}`;
            keywords = ``;
            description = `Hatcher - Algebraic Topology Chapter ${qual_id}`;

            template_path = '/templates/chapter-template.html';
            template_fragment = prep_funcs.chapter(template_path, qual_path, title, qual_id);
            break;

        case 'exercise':
            title = `Exercise ${qual_id}`;
            keywords = `Hatcher, Exercise ${qual_id}`;
            description = `Hatcher - Algebraic Topology Solutions: Exercise ${qual_id}`;

            template_path = '/templates/solution-template.html';
            template_fragment = prep_funcs.exercise(template_path, qual_path, title);
            break;

        case 'lemmas':
            template_path = '/templates/lemmas-template.html';
            break;

        case 'lemma':
            template_path = '/templates/lemmma-template.html';
            break;

        default:
            template_path = '/templates/404.html';
            break;
    }

    // Set Metadata of Page
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute("content", description);
    document.getElementById('content').innerHTML = await template_fragment.then(res => res.body.innerHTML);

    // Render Injected MathJax
    renderMathJax(document.getElementById("content"));
}


/**
 * Handles client-side routing by intercepting a link click event,
 * preventing the default browser behavior (full page reload),
 * updating the URL using the History API, and calling the route handler.
 *
 * @param {MouseEvent} [event] - The click event triggered by a navigation link.
 *                               If not provided, falls back to `window.event`.
 */
function route(event) {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    locationHandler();
}


/**
 * Listens for click events on anchor (`<a>`) tags to override the default routing behavior.
 * Instead of following the link, it calls the custom `route` function for client-side navigation.
 *
 * @param {Event} e - The click event triggered by the user.
 */
document.addEventListener('click', (e) => {
    const { target } = e;

    if (target.matches('a')) {
        const href = target.getAttribute('href');

        // URL(url, base) constructs a structured URL link from a string url and a base string
        // In this case, window.location.origin is something line https://mywebsite.com
        const linkURL = new URL(href, window.location.origin);

        // If the link is internal, go to custom routing
        if (linkURL.origin == window.location.origin) {
            e.preventDefault();
            route(e);
        }
    }
});


// Set the onpopstate event handler to the locationHandler function.
// This triggers locationHandler whenever the browser's history state changes,
// such as when the user navigates using the back/forward buttons.
window.onpopstate = locationHandler;

// Assign the route function to the global window object.
// This makes the route function accessible anywhere in the app, allowing for custom navigation.
window.route = route;

// Call locationHandler immediately to ensure the page content is initialized correctly
// based on the current state or URL when the page is loaded or refreshed.
locationHandler();

/**
 * for when you deploy on vercel in the vercel.json file
 * 
 * {
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
 */