// TODO comment this config file
// TODO Figure out if using amscd is worth it or not... thinking about using svg's from quiver...
// MathJax Config v3
// window.MathJax = {
//   loader: {
//     load: ['[tex]/amscd']
//   },
//   tex: {
//     packages: { '[+]': ['amscd'] },
//     inlineMath: [['$', '$'], ['\\(', '\\)']],
//     amscd: {
//       colspace: '5pt',
//       rowspace: '5pt',
//       harrowsize: '2.75em',
//       varrowsize: '1.75em',
//       hideHorizontalLabels: true
//     }
//   }
// };

// MathJax Confix v4
window.MathJax = {
  loader: {
    load: ['[tex]/tagformat'],
  },
  tex: {
    packages: { '[+]': ['tagformat'] },
    tagSide: 'right',
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    macros: {},
  }
};


// Load MathJax
// (function () {
//   var script = document.createElement('script');
//   // TODO Figure out the difference between these two links
//   // script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
//   script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
//   script.async = true;
//   document.head.appendChild(script);
// })();

(function () {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js';
  script.async = true;
  document.head.appendChild(script);
})();