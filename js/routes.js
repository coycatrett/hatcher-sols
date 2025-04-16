const routes = {
    404: {
        template: '/404.html',
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


    let matches = null;
    // TODO separate regex patterns into smaller parts at use regexPattern.source to concatenate them
    const match = location.match(/(\/chapter-([0-4]{1}))(\/section-([0-9]+))?(\/exercise-([0-9]+))?$/);
    
    if (!match) {
        return [404, null, null, null];
    }
    
    let [chptr, sec, exer] = [match[2], match[4], match[6]];

    if (match) {
        console.log("location matched with new regex");
        console.log("match: ", location.match(/(\/chapter-(\d)+)(\/section-(\d)+)?(\/exercise-(\d)+)?/));
        console.log("chapter:", chptr);
        console.log("section:", sec);
        console.log("exercise:", exer);
    }

    let template = "";

    if (sec === undefined && exer === undefined) {
       template = "/chapter-:chptr";
    } 
    
    else if (exer === undefined) {
        template = "/chapter-:chptr/section-:sec";
    }

    else if (sec === undefined) {
        template = "/chapter-:chptr/exercise-:exer";
    }

    else {
        template = "/chapter-:chptr/section-:sec/exercise-:exer";
    }

    return [template, chptr, sec, exer];
}


const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    locationHandler();
}


const locationHandler = async () => {
    var location = window.location.pathname;

    // console.log('location: ', location);

    if (location.length == 0) {
        location = '/';
    }

    var params = matchRoute(location);
    console.log("params", params);
    var route = routes[params[0]];
    var chptr = params[1];
    var sec = params[2];
    var exer = params[3];


    var template = route.template.replaceAll("{chptr}", chptr)
                                 .replaceAll("{sec}", sec)
                                 .replaceAll("{exer}", exer);

    console.log("template: ", template);

    const response = await fetch(template);

    console.log("response: ", response);

    if (!response.ok) {
        route = routes[404];
        const errorPage = await fetch("/404.html").then(response => response.text());
        document.getElementById("solution-container").innerHTML = errorPage;
        document.title = route.title;
        document.querySelector('meta[name="description"]').setAttribute("content", route.description);
    }

    else {
        const html = await response.text();
    
        document.getElementById("solution-container").innerHTML = html;
        renderMathJax(document.getElementById("solution-container"));
        
        document.title = route.title.replaceAll("{chptr}", chptr)
                                     .replaceAll("{sec}", sec)
                                     .replaceAll("{exer}", exer);
    
        var description = route.description.replaceAll("{chptr}", chptr)
                                           .replaceAll("{sec}", sec)
                                           .replaceAll("{exer}", exer);
    
        document.querySelector('meta[name="description"]').setAttribute("content", description);
    }
}


function renderMathJax(container = document.body) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([container])
        .then(() => console.log("MathJax rendered"))
        .catch(err => console.error("MathJax render error:", err));
    } else {
      // Try again later
      console.log("MathJax not ready, retrying...");
      setTimeout(() => renderMathJax(container), 100);
    }
  }

document.addEventListener('click', (e) => {
    const { target } = e;
    if (target.matches('a')) {
        e.preventDefault();
        route(e);
    }
    return;
})


window.onpopstate = locationHandler;
window.route = route;
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