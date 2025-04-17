# Hatcher - Algebraic Topology Solutions
This is a website consisting of my solutions to Allen Hatcher's Algebraic Topology

The purpose of this website is two-fold:

1. I want to learn web-development skills on my own, so I have implemented the current version of this project as a SPA with custom client-side routing in vanilla JS with minimal JQuery.
2. I love mathematics, especially algebraic topology, and I love helping others.

I hope that this website is a valuable resource for students or studyers of algebraic topology. Additionally, I hope that it may help others understand how to implement a client side router in vanilla JS for a SPA; I found this to be difficult.

# Development Environment
I recommend using a machine with [``nvm``](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) installed for this. Since this is what I use, then I will document the instructions using ``nvm`` until I can figure out documentation without ``nvm``.

In order to run this locally, clone it into a directory on a machine with ``nvm`` and ``npm`` installed.

Install [``http-server-spa``](https://www.npmjs.com/package/http-server-spa) if not already installed: ``npm install http-server-spa``

In your terminal, navigate to the project's root director and run ``npx http-server-spa . index.html <port number>``. Make sure to replace ``<port number>`` with a port number, e.g., ``8080``. 

## Tools Used
 - [MathJax 3.0 Documentation](https://docs.mathjax.org/en/v3.2-latest/upgrading/whats-new-3.0.html)
## Unused but Useful Tools
 - [amscd Documentation](https://docs.mathjax.org/en/latest/input/tex/extensions/amscd.html) for commutative diagrams

 - [tikzJax](https://tikzjax.com/) for rendering tikz in the browser

