// Node version > 14 and add "type": "module", package.json
import { promises as fs } from 'fs'

import { PLACEHOLDERS, NUMBER_OF, YOUTUBE_CHANNEL_IDS } from './constants.js'

const { YOUTUBE_API_KEY } = process.env

console.log({ YOUTUBE_API_KEY })

const getLatestYoutubeVideos = ({ channelId } = { channelId: YOUTUBE_CHANNEL_IDS.MAIN }) =>
  fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${channelId}&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`
  )
    .then(res => res.json())
    .then(videos => {
      if (!videos.items) {
        throw new Error(`Error fetching YouTube videos: ${JSON.stringify(videos)}`)
      }
      return videos.items
    })

const generateYoutubeHTML = ({ title, videoId }) => {
  // Escapar comillas simples y eliminar saltos de línea en el título
  const safeTitle = title.replace(/'/g, "\\'").replace(/\n/g, ' ')

  return `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${safeTitle}' />
</a>`
}

;(async () => {
  try {
    const [template, videos] = await Promise.all([
      fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
      getLatestYoutubeVideos(),
    ])

    const latestYoutubeVideos = videos
      .map(({ snippet }) => {
        const { title, resourceId } = snippet
        const { videoId } = resourceId
        return generateYoutubeHTML({ videoId, title })
      })
      .join('')

    // replace all placeholders with info
    const newMarkdown = template.replace(PLACEHOLDERS.LATEST_YOUTUBE, latestYoutubeVideos)

    await fs.writeFile('README.md', newMarkdown)
  } catch (error) {
    console.error('Error updating README:', error.message)
  }
})()
