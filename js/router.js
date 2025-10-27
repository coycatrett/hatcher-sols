import { toc } from '../data/toc_data.js';
import { meta_data } from '../data/meta_data.js';
import { validate } from './validation.js'

// Static copies of content templates
const templates = {
    chapter: document.getElementById('chapter-template'),
    exercise: document.getElementById('exercise-template'),
    hint: document.getElementById('hint-template'),
    solution: document.getElementById('solution-template')
}


/**
 * Clones a content template
 * @param {String} name - Name of the template
 * @returns {HTMLElement} - Clone of template[name]'s first child
 */
function cloneTemplate(name) {
    return templates[name].content.firstElementChild.cloneNode(true);
}


/**
 * Fetches html fragment located at `fragment_path`
 * @param {String} fragment_path - Location of fragment
 * @returns {HTMLBodyElement} - The body of the document object
 */
async function fetchFragment(fragment_path) {
    try {
        const res = await fetch(fragment_path);
        const html = await res.text();
        return new DOMParser().parseFromString(html, 'text/html').body;
    }
    catch (e) {
        throw new Error(`Failed to fetch/parse HTML: ${e.message}`);
    }
}


// Collection of async functions which generate content
const gen_content = {
    async home() {
        return fetchFragment('/home.html');
    },
    async error() {
        return fetchFragment('/404.html');
    },
    async chapter(content_data) {
        const { qual_path } = content_data;
        const chapter = Number(content_data.qual_id);
        const chapter_is_0 = chapter === 0;

        const template_fragment = cloneTemplate('chapter');
        template_fragment.getElementsByClassName('chapter-title')[0].textContent = toc[chapter].title;

        // Chapter 0 is the only chapter without sections; it runs once without any section data.
        const num_sections = chapter_is_0 ? 1 : 3;
        for (let section = 0; section < num_sections; section++) {
            // Set section content
            if (!chapter_is_0) {
                const section_header = document.createElement('h2');
                section_header.className = 'section-title';
                section_header.textContent = toc[chapter].sections[section + 1].title;
                template_fragment.appendChild(section_header);
            }

            const exercise_ul = document.createElement('ul');
            exercise_ul.className = 'exercise-ul';
            template_fragment.appendChild(exercise_ul);

            const exercise_list = chapter_is_0
                ? toc[chapter].exercises
                : toc[chapter].sections[section + 1].exercises;

            // Build exercise list
            const promises = exercise_list.map(exercise => {
                const exercise_fragment = cloneTemplate('exercise');
                const exercise_title = chapter_is_0
                    ? `Exercise 0.${exercise}`
                    : `Exercise ${chapter}.${section + 1}.${exercise}`;

                const statement_path = chapter_is_0
                    ? `${qual_path}/exercises/exercise-${exercise}/statement.tex`
                    : `${qual_path}/sections/section-${section + 1}/exercises/exercise-${exercise}/statement.tex`;

                const href = chapter_is_0
                    ? `/chapter-${chapter}/exercise-${exercise}`
                    : `/chapter-${chapter}/section-${section + 1}/exercise-${exercise}`;

                const exercise_data = { exercise_title, exercise_fragment };
                return exerciseAnchor(exercise_data, href, statement_path);
            });

            const exerciseAnchors = await Promise.all(promises);
            for (const exerciseAnchor of exerciseAnchors) {
                exercise_ul.appendChild(exerciseAnchor);
            }
            // TODO: Add support for extra exercises and additoinal topics
        }
        return template_fragment;
    },
    async exercise(content_data) {
        const { qual_path } = content_data;
        const exercise_title = content_data.title;

        const template_fragment = cloneTemplate('solution');

        const solution_path = `${qual_path}/solution.tex`;
        const statement_path = `${qual_path}/statement.tex`;
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
            const hint_path = `${qual_path}/hints/hint-${i}.tex`;
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
    }
}


// Helper function to gen_funcs[chapter] to create clickable list elements
async function exerciseAnchor(exercise_data, href, statement_path) {
    const { exercise_title, exercise_fragment } = exercise_data;
    const exercise_statement = await fetchFragment(statement_path);

    // Create anchor tag around exercise
    const exercise_anchor = document.createElement('a');
    exercise_anchor.href = href;

    exercise_fragment.getElementsByClassName('exercise-title')[0].innerHTML = exercise_title;
    exercise_fragment.getElementsByClassName('exercise-statement')[0].innerHTML = exercise_statement.outerHTML;

    exercise_anchor.appendChild(exercise_fragment);

    return exercise_anchor;
}


/**
 * Routes the current window.location.pathname to one of the routes in ``routes``
 * and fetches the html at that specific route
 * 
 * The inner html for the spa content is changed along with the title and description of the page
 */
async function locationHandler() {
    let location = window.location.pathname;

    const is_location_valid = validate(location);
    if (!is_location_valid) {
        const { title, description } = meta_data.error();
        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute('content', description);
        document.getElementById('content').innerHTML = await gen_content.error().then(res => res.outerHTML);
        return;
    }

    // An example of a field-id pair is ['chapter', '0'] or ['exercise', '12'] or ['','']
    const field_id_pairs = location.split('/').filter(string => string !== '').map(arr => arr.split('-'));

    // Qualified path in file tree corresponding to the specified location
    let qual_path =
        field_id_pairs.reduce((partial_qual_path, field_id_pair) => {
            const [field, id] = field_id_pair;
            return partial_qual_path + `/${field}s/${field}-${id}`
        }, '/content');

    const qual_id = field_id_pairs.map(arr => arr[1]).join('.');

    // The last field determines how to get to that field in the file tree
    const field = !field_id_pairs.length ? 'home' : field_id_pairs.at(-1)[0];

    const { title, description, keywords } = meta_data[field](qual_id);

    let gen_func = gen_content[field];
    let content_data = { qual_path, qual_id, title };

    // Set Metadata
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    document.getElementById('content').innerHTML = await gen_func(content_data).then(res => res.outerHTML);

    // Render Injected MathJax
    renderMathJax(document.getElementById('content'));
}


// /**
//  * Required to re-render dynamically loaded MathJax
//  * 
//  * See [MathJax.typesetPromise documentation](https://docs.mathjax.org/en/latest/web/typeset.html)
//  * @param {HTMLElement} [container] - The HTMLElement containing the MathJax to be re-rendered
//  */
function renderMathJax(container = document.body) {
    if (window.MathJax && MathJax.typesetPromise) {
        // MathJax.typesetPromise([container]).catch(err => console.error('MathJax render error:', err));
        MathJax.typesetPromise([container]).catch(err => console.error('MathJax render error:', console.error(err)));
    }
    else {
        // TODO: Could this get caught in an infinite loop?
        console.log('MathJax not ready, retrying...');
        setTimeout(() => renderMathJax(container), 100);
    }
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