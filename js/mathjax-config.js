// TODO comment this config file
// MathJax Config
window.MathJax = {
    loader: {
      load: ['[tex]/amscd']
    },
    tex: {
      packages: {'[+]': ['amscd']},
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      amscd: {
        colspace: '5pt',
        rowspace: '5pt',
        harrowsize: '2.75em',
        varrowsize: '1.75em',
        hideHorizontalLabels: true
      }
    },
    svg: {
      fontCache: 'global'
    }
  };


// Load MathJax
  (function () {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);
  })();