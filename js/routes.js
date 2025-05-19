// TODO: Add support for the Additional Topics sections in each chapter
const routes = {
    404: {
        template: '/pages/404.html',
        title: '404',
        description: 'Page not found!'
    },

    '/': {
        template: '/pages/home.html',
        title: 'Home',
        description: 'Hatcher Algebraic Topology Solutions Home Page'
    },

    '/chapter-chptr': {
        template: '/sols/chptr/chptr.html',
        title: 'Chapter chptr',
        description: 'Chapter chptr Exercises'
    },

    '/chapter-chptr/section-sec': {
        template: '/sols/chptr/sec/sec.html',
        title: 'Chapter chptr Section sec',
        description: 'Chapter chptr Section sec Exercises'
    },

    '/chapter-chptr/exercise-exer': {
        template: '/sols/chptr/exer/exer.html',
        title: 'Chapter chptr Section exer',
        description: 'Chapter chptr Exercise exer'
    },

    '/chapter-chptr/section-sec/exercise-exer': {
        template: '/sols/chptr/sec/exer/exer.html',
        title: 'Chapter chptr Section sec Exercise exer',
        description: 'Chapter chptr Section sec Exercise exer'
    },
}


/**
 * Need to be able to match routes.
 * Routes are split into these categories:
 *  - Home Page
 *  - Chapter Page
 *  - Chapter-Section Page
 *  - Chapter-Section-Solution Page
 *  - Chapter-Solution Page (only for chapter 0)
 *  - 404 Error Page
 * 
 * My matching function needs to be able to distinguish these categories based on the location
 * they will be denoted as follows:
 * 
 * - Home Page: /
 * - Chapter Page: /chapter-chptr
 * - Chapter-Section Page: /chapter-chptr/section-sec
 * - Chapter-Section-Solution Page: /chapter-chptr/section-sec/exercise-exer
 * - Chapter-Solution Page: /chapter-chptr/exercise-exer
 * - 404 Page: 404.html
 * 
 * On return of the class/type of the page, we load the content based on it
 * 
 * The basic control flow is:
 *  1. match the pattern of the url to one of the routes above
 *  2. replace the template, title, and description parameters with the correct ones
 */


 /**
  * Matches each ``location`` to one of the routes in ``routes``.
  * 
  * If ``location`` is not matched, returns a 404 error.
 * @param {String} [location] - window location pathname
 */
function matchRoute(location) {
    if (location.length == 0 || location == "/") {
        return '/';
    }

    const chptrPattern = /(\/chapter-([0-4]{1}))/;
    const secPattern = /(\/section-(\d+))?/;
    const exerPattern = /(\/exercise-(\d+))?/;

    const match = location.match(chptrPattern.source + secPattern.source + exerPattern.source + /$/.source);  // $ to search until end of string
    
    if (!match) {
        return [404, null, null, null];
    }
    
    let [chptr, sec, exer] = [match[2], match[4], match[6]];

    // if (match) {
    //     console.log("location matched with new regex");
    //     console.log("match: ", location.match(/(\/chapter-(\d)+)(\/section-(\d)+)?(\/exercise-(\d)+)?/));
    //     console.log("chapter:", chptr);
    //     console.log("section:", sec);
    //     console.log("exercise:", exer);
    // }

    let template = "";

    if (sec === undefined && exer === undefined) template = "/chapter-chptr";
    
    else if (exer === undefined) template = "/chapter-chptr/section-sec";

    else if (sec === undefined) template = "/chapter-chptr/exercise-exer";

    else template = "/chapter-chptr/section-sec/exercise-exer";

    return [template, chptr, sec, exer];
}


/**
 * document.title = fillAndReplace(route.title, /chptr|sec|exer/g, { ``chptr``, ``sec``, ``exer`` });
 * 
 * has the same effect as 
 * 
 * document.title = route.title.replaceAll("chptr", ``chptr``).replaceAll("sec", ``sec``).replaceAll("exer", ``exer``);
 * 
 * if ``chptr``, ``sec``, and ``exer`` have been given values
 * @param {string} [text] - The text whose words are being replaced
 * @param {RegExp} [targets] - The targets to be replaced
 * @param {Record<string, string>} [values] - The values to replace the targeted words
 * @returns The string text with its targets replaced by the values
 */
function fillAndReplace(text, targets, values) {
    return text.replace(targets, match => values[match]);
}


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
    //   console.log("MathJax not ready, retrying...");
      setTimeout(() => renderMathJax(container), 100);
    }
}


/**
 * Updates the contents of the solution container on the page, 
 * and sets the document title and meta description accordingly.
 * 
 * @param {string} [html] - The new HTML content to be inserted into the solution container.
 * @param {string} [title] - The new title for the document.
 * @param {string} [description] - The new meta description content.
 */
function swapInnerHTML(html, title, description) {
    document.getElementById("content").innerHTML = html;
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute("content", description);
}


/**
 * Routes the current window.location.pathname to one of the routes in ``routes``
 * and fetches the html at that specific route
 * 
 * The inner html for the spa content is changed along with the title and description of the page
 */
async function locationHandler() {
    let location = window.location.pathname;

    // console.log('location: ', location);

    if (location.length == 0) {
        location = '/';
    }

    let params = matchRoute(location);
    let route = routes[params[0]];
    let chptr = params[1];
    let sec = params[2];
    let exer = params[3];

    const values = { chptr, sec, exer };
    const targets = /chptr|sec|exer/g;
    
    // console.log("params", params);


    let template = fillAndReplace(route.template, targets, values);

    // console.log("template: ", template);

    const response = await fetch(template);

    // console.log("response: ", response);

    if (!response.ok) {
        const errorPage = await fetch(routes[404].template).then(response => response.text());
        swapInnerHTML(errorPage, routes[404].title, routes[404].description);
        return;
    }

    const html = await response.text();

    swapInnerHTML(html, fillAndReplace(route.title, targets, values), fillAndReplace(route.description, targets, values));

    renderMathJax(document.getElementById("content"));
}


/**
 * Handles client-side routing by intercepting a link click event,
 * preventing the default browser behavior (full page reload),
 * updating the URL using the History API, and calling the route handler.
 *
 * @param {MouseEvent} [event] - The click event triggered by a navigation link.
 *                                If not provided, falls back to `window.event`.
 */
function route(event) {
    // event = event || window.event;
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
document.addEventListener('click', async (e) => {
    const { target } = e;
    if (target.matches('a')) {
        e.preventDefault();
        route(e);
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