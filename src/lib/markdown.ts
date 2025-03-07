import { remark } from 'remark';
import html from 'remark-html';
import katex  from 'remark-math';

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(katex).use(html).process(markdown);
  return result.toString();
}