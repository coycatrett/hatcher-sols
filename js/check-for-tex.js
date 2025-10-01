// TODO comment this config file
// TODO Figure out if using amscd is worth it or not... thinking about using svg's from quiver...
// MathJax Config
window.MathJax = {
  loader: {
    load: ['[tex]/amscd']
  },
  tex: {
    packages: { '[+]': ['amscd'] },
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    amscd: {
      colspace: '5pt',
      rowspace: '5pt',
      harrowsize: '2.75em',
      varrowsize: '1.75em',
      hideHorizontalLabels: true
    }
  },
  output: {
    fontCache: 'global',
    linebreaks: {
      inline: true,
      width: '100%',
      lineleading: .2,
      LinebreakVisitor: null
    }
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
  const body = document.body.textContent;
  if (body.match(/(?:\$|\\\(|\\\[|\\begin\{.*?})/)) {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: { '[+]': [['$', '$']] }
        }
      };
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js';
    document.head.appendChild(script);
  }
})();