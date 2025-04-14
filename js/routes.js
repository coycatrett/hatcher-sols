const routes = {
    404: {
        template: '404.html',
        title: '404',
        description: 'Page not found!'
    },

    '/': {
        template: '/home.html',
        title: 'Home',
        description: 'Hatcher Algebraic Topology Solutions Home Page'
    },

    '/chapter-:chptr': {
        template: '/sols/{chptr}/{chptr}.html',
        title: 'Chapter {chptr}',
        description: 'Chapter {chptr} Exercises'
    },

    '/chapter-:chptr/section-:sec': {
        template: '/sols/{chptr}/{sec}/{sec}.html',
        title: 'Chapter {chptr} Section {sec}',
        description: 'Chapter {chptr} Section {Sec} Exercises'
    },

    '/chapter-:chptr/section-:sec/exercise-:exer': {
        template: '/sols/{chptr}/{sec}/{exer}/{exer}.html',
        title: 'Chapter {chptr} Section {sec}',
        description: 'Chapter {chptr} Section {Sec} Exercise {exer}'
    },

    '/chapter-:chptr/exercise-:exer': {
        template: '/sols/{chptr}/{exer}/{exer}.html',
        title: 'Chapter {chptr} Section {exer}',
        description: 'Chapter {chptr} Exercise {exer}'
    },
}





/**
 * // TODO
 * Need to be able to match routes.
 * Splitting routes into these categories:
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
 * Home Page:
 * Chapter Page: /chapter-{chptr}
 * Chapter-Section Page: /chapter-{chptr}/section-{sec}
 * Chapter-Section-Solution Page: /chapter-{chptr}/section-{sec}/exercise-{exer}
 * Chapter-Solution Page: /chapter-{chptr}/exercise-{exer}
 * 404 Page: 404.html
 * 
 * 
 * On return of the class/type of the page, we load the content based on it
 * 
 * The basic control flow would be: 
 *  1. match the pattern of the url to one of the routes above
 *  2. replace the template, title, and description parameters with the correct ones (using the .replace function)
 *  3. return
 */

const matchRoute = (location) => {
    if (location.length == 0 || location == "/index.html" || location == "/") {
        return '/';
    }


    var chptr = null;
    var sec = null;
    var exer = null;


    let matches = null;

    
    if (/\/chapter-(\d)+/.test(location)) {  // chapter-{chptr}
        matches = location.match(/\/chapter-(\d)+/);
        chptr = matches[1];
        return ["/chapter-:chptr", chptr, sec, exer];
    }


    if (/\/chapter-(\d)+\/section-(\d)+/.test(location)) {  // chapter-{chptr}/section-{sec}
        matches = location.match(/\/chapter-(\d)+\/section-(\d)+/);
        chptr = matches[1];
        sec = matches[2];
        return ["/chapter-:chptr/section-:sec", chptr, sec, exer];
    }


    if (/\/chapter-(\d)+\/exercise-(\d)+/.test(location)) {  // chapter-{chptr}/solution-{sol}
        matches = location.match(/\/chapter-(\d)+\/exercise-(\d)+/);
        chptr = matches[1];
        exer = matches[2];
        return ["/chapter-:chptr/exercise-:exer", chptr, sec, exer];
    }


    if (/\/chapter-(\d)+\/section-(\d)+\/exercise(\d)+/.test(location)) {
        matches = location.match(/\/chapter-(\d)+\/section-(\d)+\/exercise-(\d)+/);
        chptr = matches[1];
        sec = matches[2];
        exer = matches[3];
        return ["/chapter-:chptr/section-:sec/exercise-:exer", chptr, sec, exer];
    }

    console.log(404)

    return [404, chptr, sec, exer];

}


const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    locationHandler();
}


const locationHandler = async () => {
    var location = window.location.pathname;
    console.log('location: ', location);

    if (location.length == 0) {
        location = '/';
    }

    var params = matchRoute(location);
    console.log("params", params);
    var route = routes[params[0]];
    var chptr = params[1];
    var sec = params[2];
    var exer = params[3];

    var template = route.template;
    template = template.replaceAll("{chptr}", chptr);
    template = template.replaceAll("{sec}", sec);
    template = template.replaceAll("{exer}", exer);

    console.log(routes);
    console.log("route", route);

    const response = await fetch(template);

    if (!response.ok) {
        console.log("bad response");
        route = routes[404];
        const errorPage = await fetch("/404.html").then(response => response.text());
        document.getElementById("solution-container").innerHTML = errorPage;
        document.title = route.title;
        document.querySelector('meta[name="description"]').setAttribute("content", route.description);
    }
    else {
        console.log('routes[', params[0], ']', route);

        const html = await response.text();
    
        document.getElementById("solution-container").innerHTML = html;
        
        var title = route.title;
        title = title.replaceAll("{chptr}", chptr);
        title = title.replaceAll("{sec}", sec);
        title = title.replaceAll("{exer}", exer);
    
        
        var description = route.description;
        description = description.replaceAll("{chptr}", chptr);
        description = description.replaceAll("{sec}", sec);
        description = description.replaceAll("{exer}", exer);
    
    
        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute("content", description);
    }
}


document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a'); // This safely finds the closest <a>
    if (anchor) {
        e.preventDefault();
        route(e);
    }
});


// document.addEventListener('click', (e) => {
//     const { target } = e;
//     if (target.matches('a')) {
//         e.preventDefault();
//         route(e);
//     }
//     return;
// })


window.onpopstate = locationHandler;
window.route = route;
locationHandler();