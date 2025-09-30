import { toc } from './toc_data.js';

export const meta_data = {
    home: () => {
        const title = 'Home';
        const description = 'Home page of Coy Catrett\'s Solutions to Hatcher\'s Algebraic Topology';
        const keywords = '';
        return { title, description, keywords };
    },
    chapter: (chapter_num) => {
        const title = toc[chapter_num].title;
        const description = `Completed exercises of chapter ${chapter_num} of Hatcher\'s Algebraic Topology`;
        const keywords = '';
        return { title, description, keywords };
    },
    exercise: (exercise_id) => {
        const title = `Exercise ${exercise_id}`;
        const description = `Coy Catrett\'s solution to Exercise ${exercise_id} of Hatcher\'s Algebraic Topology`;
        const keywords = '';
        return { title, description, keywords };
    },
    error: () => {
        const title = '404 Error Page';
        const description = '404 Error Page';
        const keywords = '';
        return { title, description, keywords };
    }
}