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

// TODO: Research about linebreak options
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
  },
  output: {
    linebreaks: {
      inline: false,
    },
    displayOverflow: 'scroll',     // break long lines
    // linebreaks: {                  // options for when overflow is linebreak
    //   inline: true,                // true for browser-based breaking of in-line equations
    //   width: '100%',               // a fixed size or a percentage of the container width
    //   lineleading: .2              // the default lineleading in em units
    //   // LinebreakVisitor: null,   // The LinebreakVisitor to use
    // }
  }
};


// Load MathJax v3
// (function () {
//   var script = document.createElement('script');
//   script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
//   script.async = true;
//   document.head.appendChild(script);
// })();

// Load MathJax v4
(function () {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js';
  script.async = true;
  document.head.appendChild(script);
})();