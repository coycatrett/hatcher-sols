import { chapters, sections } from '/data/toc_data.js';

// Debug flag
const DEBUG = true;

// TODO: Fetch global home and 404 pages once

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

async function fetchFragment(fragment_path) {
    try {
        const res = await fetch(fragment_path);
        const html = await res.text();
        return new DOMParser().parseFromString(html, 'text/html');
    }
    catch (e) {
        throw new Error(`Failed to fetch/parse HTML: ${e.message}`);
    }
}

const prep_funcs = {
    async home(prep_data) {
        const { template_path } = prep_data;
        const template_fragment = await fetchFragment(template_path)
        return template_fragment;
    },
    // TODO: Swap to 404.html page in each catch block
    async exercise(prep_data) {
        const { template_path, qual_path } = prep_data;
        const exercise_title = prep_data.title;
        /* Fetch Stage */
        // Fetch Solution Template (as new HTML document object)
        const template_fragment = await fetchFragment(template_path);

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
        const hint_fragment = await fetchFragment(hint_template_path);

        // Fetch Hints
        const hints = [];
        const num_hints = exercise_json['num_hints'];
        for (let i = 1; i <= num_hints; i++) {
            const hint_path = `${qual_path}/hints/hint-${i}.html`;
            const hint = await fetch(hint_path).then(res => res.text());
            hints.push(hint);
        }

        /* Build Stage */
        template_fragment.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
        template_fragment.getElementsByClassName('exercise-statement')[0].innerHTML = statement_html.trim();
        template_fragment.getElementsByClassName('solution-container')[0].innerHTML = solution_html.trim();

        if (hints) {
            template_fragment.getElementsByClassName(['hint-container'])[0].classList.toggle('active');

            const hint_details_innerHTML = hint_fragment.getElementsByClassName('hint-details')[0].innerHTML;
            hints.forEach(hint => {
                hint_fragment.getElementsByClassName('hint-details')[0].innerHTML += hint;
                template_fragment.getElementsByClassName('hint-container')[0].innerHTML += hint_fragment.body.innerHTML;
                hint_fragment.getElementsByClassName('hint-details')[0].innerHTML = hint_details_innerHTML;
            });
        }

        return template_fragment;
    },
    async chapter(prep_data) {
        const { template_path, qual_path } = prep_data;
        const chapter_num = prep_data.qual_id;
        /* Fetch Stage */
        // Fetch Chapter Template (as new HTML document object)
        const template_fragment = await fetchFragment(template_path);

        const exercise_fragment = await fetchFragment('/templates/exercise-template.html')

        // Fetch chapter.json
        const json_path = qual_path + '/chapter.json';
        const chapter_json = await fetch(json_path).then(res => res.json()).catch(e => Error(e));

        template_fragment.body.getElementsByClassName('chapter-title')[0].innerHTML = chapters[chapter_num].title;

        /* Build Stage */
        // Chapter 0 is the only chapter without sections
        // TODO: these cases have a lot of overlap. refactor this into a function
        const num_exercises = chapter_json.num_exercises;
        if (chapter_num === '0') {
            const exercise_ul = document.createElement('ul');
            exercise_ul.setAttribute('class', 'exercise-ul');

            for (let i = 1; i <= num_exercises; i++) {
                const exercise_title = `Exercise 0.${i}`;
                const exercise_statement = await fetch(qual_path + `/exercises/exercise-${i}/statement.html`).then(res => res.text());

                exercise_fragment.body.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
                exercise_fragment.body.getElementsByClassName('exercise-statement')[0].innerHTML = exercise_statement;

                // Create anchor tag around exercise
                const exercise_anchor = document.createElement('a');
                exercise_anchor.href = `/chapter-${chapter_num}/exercise-${i}`;

                // Append a clone of the static exercise_fragment (to not empty out source)
                exercise_anchor.appendChild(exercise_fragment.body.firstElementChild.cloneNode(true));

                exercise_ul.appendChild(exercise_anchor);
            }

            template_fragment.body.getElementsByClassName('chapter-container')[0].appendChild(exercise_ul);
        }
        else {
            for (let section_num = 1; section_num <= sections[chapter_num].length; section_num++) {
                const section_header = document.createElement('h2');
                section_header.setAttribute('class', 'section-title');
                section_header.innerHTML = sections[chapter_num][section_num - 1];
                template_fragment.body.getElementsByClassName('chapter-container')[0].appendChild(section_header);

                const exercise_ul = document.createElement('ul');
                exercise_ul.setAttribute('class', 'exercise-ul');
                for (let i = 1; i <= num_exercises[section_num - 1]; i++) {
                    const exercise_title = `Exercise ${chapter_num}.${section_num}.${i}`;
                    const exercise_statement = await fetch(qual_path + `/sections/section-${section_num}/exercises/exercise-${i}/statement.html`).then(res => res.text());

                    exercise_fragment.body.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
                    exercise_fragment.body.getElementsByClassName('exercise-statement')[0].innerHTML = exercise_statement;

                    // Create anchor tag around exercise
                    const exercise_anchor = document.createElement('a');
                    exercise_anchor.href = `/chapter-${chapter_num}/section-${section_num}/exercise-${i}`;

                    // Append a clone of the static exercise_fragment (to not empty out source)
                    exercise_anchor.appendChild(exercise_fragment.body.firstElementChild.cloneNode(true));

                    exercise_ul.appendChild(exercise_anchor);
                }
                template_fragment.body.getElementsByClassName('chapter-container')[0].appendChild(exercise_ul);
            }
        }
        return template_fragment
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

    // An example of a field-id pair is ['chapter', '0'] or ['exercise', '12'] or ['','']
    const field_id_pairs = location.split('/')
        .filter(string => string !== '')
        .map(arr => arr.split('-'));
    if (DEBUG) console.log('field_id_pairs:', field_id_pairs);

    // Qualified path in file tree corresponding to the specified location
    let qual_path =
        field_id_pairs.reduce((partial_qual_path, field_id_pair) => {
            const [field, id] = field_id_pair;
            return partial_qual_path + `/${field}s/${field}-${id}`
        }, '/content');
    if (DEBUG) console.log('qual_path: ', qual_path);

    const qual_id = field_id_pairs.map(arr => arr[1]).join('.');

    // can these be global?? pretty sure... need to think about it
    let title;
    let template_fragment;

    let meta_data = {
        title: '',
        description: '',
        keywords: ''
    }

    let prep_data = {
        template_path: '',
        qual_path: qual_path,
        qual_id: qual_id,
        title: ''
    }

    // The last field determines how to get to that field in the file tree
    const field = !field_id_pairs.length ? '' : field_id_pairs.at(-1)[0];
    if (DEBUG) console.log('field: ', field);

    // TODO: refactor this into a dictionary instead of a switch case
    // each key is the current field name
    // each value is a dictionary with the title, template_path, prep_func, and anything else
    // Some how the below is useful?
    // const routeConfig = routes[field] || { template: "/templates/404.html" };
    // const fragment = await routeConfig.prep?.(prep_data) ?? await fetchFragment(routeConfig.template);

    switch (field) {
        case '':
            title = 'Home';

            prep_data.title = title;
            prep_data.template_path = '/templates/home.html';

            meta_data = {
                title: title,
                description: 'Hatcher - Algebraic Topology Solutions: Home Page',
                keywords: 'Hatcher, Algebraic Topology, Solutions, Solution'
            }

            template_fragment = prep_funcs.home(prep_data);
            break;

        case 'chapter':
            title = chapters[qual_id];

            prep_data.title = title;
            prep_data.template_path = '/templates/chapter-template.html';

            meta_data = {
                title: title,
                keywords: ``,
                description: `Hatcher - Algebraic Topology Chapter ${qual_id}`
            }

            template_fragment = prep_funcs.chapter(prep_data);
            break;

        case 'exercise':
            title = `Exercise ${qual_id}`;

            prep_data.title = title;
            prep_data.template_path = '/templates/solution-template.html';
            console.log("qual_id: ", qual_id);
            meta_data = {
                title: title,
                description: `Hatcher - Algebraic Topology Solutions: Exercise ${qual_id}`,
                keywords: `Hatcher, Exercise ${qual_id}`
            }

            template_fragment = prep_funcs.exercise(prep_data);
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
    document.title = meta_data.title;
    document.querySelector('meta[name="description"]').setAttribute("content", meta_data.description);
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