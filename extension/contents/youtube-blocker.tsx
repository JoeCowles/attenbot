import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

interface Video {
  id: string
  link: string
  title: string
  channel: string
}

// Mock API function
const mockApiCall = async (videos: Video[]): Promise<string[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  // Randomly select about half of the video IDs
  return videos.filter(() => Math.random() > 0.5).map((video) => video.id)
}

const YouTubeBlocker: React.FC = () => {
  React.useEffect(() => {
    console.log("YouTubeBlocker")

    const processVideos = async () => {
      const videoSelectors = [
        "ytd-rich-item-renderer",
        "ytd-compact-video-renderer",
        "ytd-video-renderer"
      ]

      let allVideos: Video[] = []

      videoSelectors.forEach((selector) => {
        const videoElements = document.querySelectorAll(selector)
        videoElements.forEach((video, index) => {
          if (index < 20 && !video.getAttribute("data-processed")) {
            const linkElement = video.querySelector(
              "a#video-title-link"
            ) as HTMLAnchorElement
            const titleElement = video.querySelector(
              "#video-title"
            ) as HTMLElement
            const channelElement = video.querySelector(
              "#text.ytd-channel-name a"
            ) as HTMLAnchorElement

            const link = linkElement?.href || "N/A"
            const title = titleElement?.textContent?.trim() || "N/A"
            const channel = channelElement?.textContent?.trim() || "N/A"
            const id = `video-${index}`

            allVideos.push({ id, link, title, channel })
            video.setAttribute("data-video-id", id)
            video.setAttribute("data-processed", "true")
          } else if (index >= 20) {
            // Remove videos beyond the top 20
            video.remove()
          }
        })
      })

      console.log("Top 20 videos:", allVideos)

      // Simulate API call to get filtered video IDs
      const filteredIds = await mockApiCall(allVideos)
      console.log("Filtered video IDs:", filteredIds)

      // Remove videos not in the filtered list
      videoSelectors.forEach((selector) => {
        const videoElements = document.querySelectorAll(selector)
        videoElements.forEach((video) => {
          const videoId = video.getAttribute("data-video-id")
          if (videoId && !filteredIds.includes(videoId)) {
            video.remove()
          }
        })
      })

      // Log remaining videos
      console.log(
        "Remaining videos:",
        filteredIds
          .map((id) => allVideos.find((v) => v.id === id))
          .filter(Boolean)
      )
    }

    processVideos()

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          processVideos()
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  return null
}

export default YouTubeBlocker
