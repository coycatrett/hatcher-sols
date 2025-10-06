# Coy Catrett's Solutions to Hatcher's Algebraic Topology

## Overview

Welcome! This is a website documenting my solutions to the exercises in
*Allen Hatcher's Algebraic Topology*.

The author has included useful information about the book [on the book's download page](https://pi.math.cornell.edu/~hatcher/AT/ATpage.html). See Allen Hatcher's [personal site](https://pi.math.cornell.edu/~hatcher/#ATI) for more about his work.

The purpose of this website is two-fold:

1. To improve my web-development skills and gain a deeper understanding of JavaScript and client-side routing.
2. To help others studying algebraic topology and to document my solutions. I love math, especially algebraic topology, and I love helping others with math.

I hope that this website serves some as a complementary reference for students/studiers of algebraic topology using Hatcher's book.

## Implementation

This webpage is designed as a single page application (SPA) with custom client-side routing implemented in vanilla JavaScript with the History API.

There are several families of valid routes (see `validation.js`), and after validating them, I interrupt the default routing behavior and let my router take over instead, using the History API.

The basic design pattern employed is the composite pattern. Content is organized in a tree structure to encapsulate the natural structure of the book and it's table of contents. The exercise and chapter pages are then dynamically generated in JavaScript by combining the correct content (exercise statements, hints, solutions, etc.) based upon the window location. Finally, content is swapped into a content `div` in `index.html` where it is displayed.

The tree structure in the table of contents makes this project scalable and extensible. For example, to implement an appendix of lemmas, simply add a folder `/content/lemmas` that contains each lemma along with it's data in `/content/lemmas/lemma` and implement the JavaScript function that stitches the data together.

## What I Learned

Briefly, here are the major concepts that I learned from this project:

- Improved understanding of JavaScript and the JavaScript event loop
- Learned about asynchronous JavaScript and the Promise API
- Implementing a client-side router gave me potential insights as to how more sophisticated API's may implement client-side routing
- Validation and sanitization of url's
- How JQuery and JavaScript selectors are related
- CSS animations and styling techniques
- How to implement design patterns for scalability and extensibility
- Git version control
- Vercel hosting & deployment

## What I Would Do Differently

A lot of what I did felt like it could be made more efficient with Vue. Additionally, I should have looked for more examples of similar sites, like [𝛑-base](https://topology.pi-base.org/) ([GitHub Profile](https://github.com/pi-base)), and mimicked how they set up their site. I initially approached this a bit blind, which led to some complications down the road and eventually an entire redesign. This could have been avoided at the start, but I think that failing fast and moving forward here was the right move; I enjoyed this experience and felt like I taught myself quite a bit.

I am also open to suggestions and improvements to this project. Feel free to reach out to me at <ctcatrett@gmail.com>.

## Future Features

Moving forward, I hope to implement/incorporate the following features:

- [ ] Support for exercises in the additional topics sections

- [ ] Support for extra exercises by Hatcher

- [ ] Support for an appendix of useful lemmas

- [ ] Comment sections for feedback (e.g., with Disqus)

- [ ] Dark mode

### Tools Used

- [``http-server-spa``](https://www.npmjs.com/package/http-server-spa) for local testing
- [MathJax 3.0 Documentation](https://docs.mathjax.org/en/v3.2-latest/upgrading/whats-new-3.0.html)
- [Quiver Commutative Diagram Editor](https://q.uiver.app/)
- [GeoGebra Classic Geometry](https://www.geogebra.org/classic#geometry)

### Unused but Useful Tools

- [amscd Documentation](https://docs.mathjax.org/en/latest/input/tex/extensions/amscd.html) for commutative diagrams

- [tikzJax](https://tikzjax.com/) for rendering tikz in the browser
