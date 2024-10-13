import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { videos } = req.body

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Filter these YouTube videos based on the filters: ${JSON.stringify(videos)}`
      })
    })
    console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    res.send(result)
  } catch (error) {
    console.error('Error filtering videos:', error)
    res.send({ error: 'Failed to filter videos' })
  }
}

export default handler