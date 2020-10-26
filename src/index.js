// Node version > 14 and add "type": "module", package.json
import { promises as fs } from 'fs'
// import fetch from 'node-fetch'
import Parser from 'rss-parser'

const parser = new Parser()

const getLatestArticlesFromBlog = () =>
  parser
    .parseURL(
      'https://admin.johnserrano.co/5c4fe0e52a3a17b604e6eefa245e58/rss/'
    )
    .then((data) => data.items)

;(async () => {
  const [template, articles] = await Promise.all([
    fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
    getLatestArticlesFromBlog(),
  ])

  // create latest articles markdown
  const latestArticlesMarkdown = articles
    .slice(0, 5)
    .map(
      ({ title, link }) =>
        `- [${title}](${link.replace(
          'https://admin.johnserrano.co/',
          'https://johnserrano.co/blog/'
        )})`
    )
    .join('\n')

  // replace all placeholders with info
  const newMarkdown = template.replace(
    '%{{latest_articles}}%',
    latestArticlesMarkdown
  )

  await fs.writeFile('README.md', newMarkdown)
})()
