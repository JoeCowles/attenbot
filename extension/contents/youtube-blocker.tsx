import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeBlocker: React.FC = () => {
  React.useEffect(() => {
    console.log("YouTubeBlocker")
    let videoCount = 0

    const blockVideos = () => {
      const videoSelectors = [
        "ytd-rich-item-renderer",
        "ytd-compact-video-renderer",
        "ytd-video-renderer"
      ]

      videoSelectors.forEach((selector) => {
        const videoElements = document.querySelectorAll(selector)
        videoElements.forEach((video) => {
          if (!video.getAttribute("data-processed")) {
            videoCount++
            const shouldBlock = videoCount % 2 === 1

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

            console.log(`Video ${videoCount}:`, {
              link,
              title,
              channel,
              blocked: shouldBlock ? "Yes (Odd)" : "No (Even)"
            })

            if (shouldBlock) {
              const blockedContent = document.createElement("div")
              blockedContent.textContent = "Video blocked by extension"
              blockedContent.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f0f0f0;
                color: #333;
                font-family: Arial, sans-serif;
                font-size: 14px;
                text-align: center;
              `

              // Clear the content of the video element
              while (video.firstChild) {
                video.removeChild(video.firstChild)
              }

              // Add the blocked content
              video.appendChild(blockedContent)
            }

            // Mark as processed to avoid processing it again
            video.setAttribute("data-processed", "true")
          }
        })
      })
    }

    blockVideos()

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          blockVideos()
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
