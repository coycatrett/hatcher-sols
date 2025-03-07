<script setup>
import { ref, onMounted } from 'vue';


const tikzSource = `\\begin{document}
    \\begin{tikzpicture}
    \\draw (0,0) circle (1in);
    \\end{tikzpicture}
    \\end{document}`;

const svgOutput = ref('');

fetch("", {
  method: "GET",
  headers: { "Content-Type": "application/json" }
  // body: JSON.stringify({ source: tikzSource })
})
.catch(e => console.error("Error:", e))

// const fetchTikzSvg = async () => {
//     const res = await fetch("http://localhost:3000/tikz", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ source: tikzSource })})
//             .then(data => data.json())
//             .then(data => console.log(data))
//             .catch(e => console.error("Error", e))
//     // try {
//     //     const res = await fetch("http://localhost:3000/tikz", {
//     //         method: "POST",
//     //         headers: { "Content-Type": "application/json" },
//     //         body: JSON.stringify({ source: tikzSource })
//     //     });
//     //     const data = await res.json();
//     //     svgOutput.value = data.svg;
//     // } catch (error) {
//     //     console.error("Error fetching SVG:", error);
//     // }
// };

// onMounted(fetchTikzSvg);
</script>

<template>
  <div v-html="svgOutput"></div>
  <div v-katex>
    $$
    f({x}) = \int_{-\infty}^\infty\hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi$$
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
