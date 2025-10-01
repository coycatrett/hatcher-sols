import { toc } from '../data/toc_data.js';
const routes = [
    { // Home
        regex: /^(\/home|\/)?$/,
        validate_route: () => true
    },
    { // Chapter
        regex: /^\/chapter-[0-4]$/,
        validate_route: () => true
    },
    { // Exercise
        regex: /^\/chapter-([0-4])(\/section-([1-3]))?\/exercise-(\d+)$/,
        validate_route: ([, chapter, , section, exercise]) => {
            const exercises = section
                ? toc[chapter].sections[section].exercises
                : toc[chapter].exercises;

            return exercises && exercises.includes(Number(exercise));
        }
    }
];

export function validate(location) {
    for (const { regex, validate_route } of routes) {
        const match = regex.exec(location);
        if (match) return validate_route(match);
    }
    return false;
}