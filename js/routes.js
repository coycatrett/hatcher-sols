import { toc } from '../data/toc_data.js';

// Debug flag
const DEBUG = true;

const templates = {
    chapter: document.getElementById('chapter-template'),
    exercise: document.getElementById('exercise-template'),
    hint: document.getElementById('hint-template'),
    solution: document.getElementById('solution-template')
}

function cloneTemplate(name) {
    return templates[name].content.firstElementChild.cloneNode(true);
}

/**
 * Required to re-render dynamically loaded MathJax
 * 
 * See [MathJax.typesetPromise documentation](https://docs.mathjax.org/en/latest/web/typeset.html)
 * @param {HTMLElement} [container] - The HTMLElement containing the MathJax to be re-rendered
 */
function renderMathJax(container = document.body) {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([container]).catch(err => console.error("MathJax render error:", err));
    }
    else {
        // TODO: Could this get caught in an infinite loop?
        console.log("MathJax not ready, retrying...");
        setTimeout(() => renderMathJax(container), 100);
    }
}

export async function fetchFragment(fragment_path) {
    try {
        const res = await fetch(fragment_path);
        const html = await res.text();
        return new DOMParser().parseFromString(html, 'text/html').body;
    }
    catch (e) {
        throw new Error(`Failed to fetch/parse HTML: ${e.message}`);
    }
}

// TODO: Improve variable names and readability
async function createExerciseAnchor(exercise_data, href, statement_path) {
    const { exercise_title, exercise_ul, exercise_fragment } = exercise_data;
    const exercise_statement = await fetch(statement_path).then(res => res.text());

    // Create anchor tag around exercise
    const exercise_anchor = document.createElement('a');
    exercise_anchor.href = href;

    exercise_fragment.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
    exercise_fragment.getElementsByClassName('exercise-statement')[0].innerHTML = exercise_statement;

    exercise_anchor.appendChild(exercise_fragment);
    exercise_ul.appendChild(exercise_anchor);
    return exercise_anchor;
}

// TODO: These aren't prep funcs anymore, these are generate or create functions
const prep_funcs = {
    async home() {
        return fetchFragment('/templates/home.html');
    },
    // TODO: Swap to 404.html page in each catch block
    // TODO: Refactor
    async solution(prep_data) {
        const { qual_path } = prep_data;
        const exercise_title = prep_data.title;

        const template_fragment = cloneTemplate('solution');

        const solution_path = `${qual_path}/solution.html`;
        const statement_path = `${qual_path}/statement.html`;
        const hints_json_path = `${qual_path}/hints/hints.json`;

        const paths = [solution_path, statement_path, hints_json_path];
        const promises = paths.map(async path => {
            return await fetch(path).then(res => path === hints_json_path ? res.json() : res.text());
        });

        const [solution_html, statement_html, hints_json] = await Promise.all(promises);

        // Set statement and solution
        template_fragment.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
        template_fragment.getElementsByClassName('exercise-statement')[0].innerHTML = statement_html;
        template_fragment.getElementsByClassName('solution-container')[0].innerHTML = solution_html;

        // Fetch Hints
        const hints = [];
        const num_hints = hints_json['num_hints'];
        for (let i = 1; i <= num_hints; i++) {
            const hint_path = `${qual_path}/hints/hint-${i}.html`;
            const hint = await fetchFragment(hint_path);
            hints.push(hint);
        }

        // Build hints
        if (hints) {
            const hint_container = template_fragment.getElementsByClassName('hint-container')[0];
            hint_container.classList.toggle('active');

            hints.forEach(hint => {
                const hint_fragment = cloneTemplate('hint');
                hint_fragment.appendChild(hint);
                hint_container.appendChild(hint_fragment);
            });
        }

        return template_fragment;
    },
    async chapter(prep_data) {
        const { qual_path } = prep_data;
        const chapter = Number(prep_data.qual_id);

        const template_fragment = cloneTemplate('chapter');
        template_fragment.getElementsByClassName('chapter-title')[0].textContent = toc[chapter].title;

        // Chapter 0 is the only chapter without sections; it runs once without any section data.
        const num_sections = chapter === 0 ? 1 : 3;
        for (let section = 0; section < num_sections; section++) {
            // Set section content
            if (chapter !== 0) {
                const section_header = document.createElement('h2');
                section_header.className = 'section-title';
                section_header.textContent = toc[chapter].sections[section + 1].title;
                template_fragment.appendChild(section_header);
            }

            const exercise_ul = document.createElement('ul');
            exercise_ul.className = 'exercise-ul';
            template_fragment.appendChild(exercise_ul);

            const exercise_list = chapter === 0
                ? toc[chapter].exercises
                : toc[chapter].sections[section + 1].exercises;

            // Build exercise list
            // TODO: Refactor each of these ternaries into their own functions
            const promises = exercise_list.map(exercise => {
                const exercise_fragment = cloneTemplate('exercise');
                const exercise_title = chapter == 0
                    ? `Exercise 0.${exercise}`
                    : `Exercise ${chapter}.${section + 1}.${exercise}`;

                const statement_path = chapter == 0
                    ? `${qual_path}/exercises/exercise-${exercise}/statement.html`
                    : `${qual_path}/sections/section-${section + 1}/exercises/exercise-${exercise}/statement.html`;

                const href = chapter == 0
                    ? `/chapter-${chapter}/exercise-${exercise}`
                    : `/chapter-${chapter}/section-${section + 1}/exercise-${exercise}`;

                const exercise_data = { exercise_title, exercise_ul, exercise_fragment };
                return createExerciseAnchor(exercise_data, href, statement_path);
            });

            await Promise.all(promises);

            // TODO: Add support for extra exercises and additoinal topics
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
            title = toc[qual_id].title;

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

            meta_data = {
                title: title,
                description: `Hatcher - Algebraic Topology Solutions: Exercise ${qual_id}`,
                keywords: `Hatcher, Exercise ${qual_id}`
            }

            template_fragment = prep_funcs.solution(prep_data);
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
    console.log(template_fragment);
    document.getElementById('content').innerHTML = await template_fragment.then(res => res.outerHTML);

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