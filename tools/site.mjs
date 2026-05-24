import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceFiles = [
  'js/blog-utils.js',
  'js/main.js',
  'js/articles-home.js',
  'js/article-page.js'
];
const defaultBaseUrl = 'https://koajsj.github.io/orianblog/';
const mode = (process.argv[2] || 'build').toLowerCase();

function parseArgs(argv) {
  let baseUrl = process.env.SITE_BASE_URL || defaultBaseUrl;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--base-url') {
      baseUrl = argv[index + 1] || baseUrl;
      index += 1;
      continue;
    }

    if (value.startsWith('--base-url=')) {
      baseUrl = value.slice('--base-url='.length) || baseUrl;
    }
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl)
  };
}

function normalizeBaseUrl(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return defaultBaseUrl;
  }

  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''));
}

function latestDate(articles) {
  const dates = articles
    .map((article) => article?.date || '')
    .filter(isValidDate)
    .sort();

  return dates.at(-1) || '';
}

async function readText(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

async function writeText(relativePath, content) {
  await fs.writeFile(path.join(repoRoot, relativePath), `${content}\n`, 'utf8');
}

function runNodeCheck(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const result = spawnSync(process.execPath, ['--check', absolutePath], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`Syntax check failed for ${relativePath}${output ? `\n${output}` : ''}`);
  }
}

async function loadArticlesData() {
  const code = await readText('js/articles-data.js');
  const context = vm.createContext({
    console,
    window: {}
  });
  context.globalThis = context;
  context.window = context;

  vm.runInContext(code, context, { filename: 'js/articles-data.js' });
  const articles = context.ARTICLES_DATA || context.window.ARTICLES_DATA;
  if (!Array.isArray(articles)) {
    throw new Error('js/articles-data.js did not expose window.ARTICLES_DATA as an array.');
  }

  return articles;
}

function buildSitemap(baseUrl, articles) {
  const newest = latestDate(articles);
  const pages = [
    { loc: new URL('./', baseUrl).toString(), lastmod: newest },
    { loc: new URL('articles.html', baseUrl).toString(), lastmod: newest },
    ...articles.map((article) => ({
      loc: new URL(`article.html?slug=${encodeURIComponent(article.slug)}`, baseUrl).toString(),
      lastmod: isValidDate(article.date) ? article.date : newest
    }))
  ];

  const urlEntries = pages.map(({ loc, lastmod }) => {
    const lastmodXml = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : '';
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodXml}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

function buildRobots(baseUrl) {
  return `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', baseUrl).toString()}`;
}

async function lint() {
  sourceFiles.forEach(runNodeCheck);
  await loadArticlesData();
}

async function build(baseUrl) {
  await lint();
  const articles = await loadArticlesData();
  await writeText('robots.txt', buildRobots(baseUrl));
  await writeText('sitemap.xml', buildSitemap(baseUrl, articles));
}

async function test(baseUrl) {
  await build(baseUrl);

  const [robots, sitemap, articlesRaw] = await Promise.all([
    readText('robots.txt'),
    readText('sitemap.xml'),
    loadArticlesData()
  ]);

  if (!robots.includes('Sitemap:')) {
    throw new Error('robots.txt is missing the sitemap reference.');
  }

  if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    throw new Error('sitemap.xml has an invalid root element.');
  }

  const articleUrls = articlesRaw.map((article) => `article.html?slug=${encodeURIComponent(article.slug)}`);
  articleUrls.forEach((fragment) => {
    if (!sitemap.includes(fragment)) {
      throw new Error(`sitemap.xml is missing ${fragment}.`);
    }
  });
}

async function main() {
  const { baseUrl } = parseArgs(process.argv.slice(3));

  if (mode === 'lint') {
    await lint();
    return;
  }

  if (mode === 'test') {
    await test(baseUrl);
    return;
  }

  if (mode === 'build') {
    await build(baseUrl);
    return;
  }

  throw new Error(`Unknown mode "${mode}". Use build, lint, or test.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
