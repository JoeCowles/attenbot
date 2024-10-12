import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

interface VideoInfo {
  id: string
  title: string
  isPlaylist: boolean
  thumbnailElement: Element
  detailsElement: Element
  parentElement: Element
  parentHTML: string
}

const YouTubeBlocker: React.FC = () => {
  const [allowedVideos, setAllowedVideos] = React.useState<VideoInfo[]>([])
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Initial processing effect
  const removeChips = () => {
    const chipsContainer = document.querySelector(
      "#scroll-container > .ytd-feed-filter-chip-bar-renderer"
    )
    if (chipsContainer) {
      console.log("Removing chips container")
      chipsContainer.remove()
    }
  }

  const collectVideoInfo = (): VideoInfo[] => {
    const videoElements = document.querySelectorAll("ytd-rich-item-renderer")
    const newVideoList: VideoInfo[] = []

    videoElements.forEach((element) => {
      const videoMedia = element.querySelector("ytd-rich-grid-media")
      const thumbnail = videoMedia?.querySelector(
        "ytd-thumbnail, ytd-playlist-thumbnail"
      )
      const details = videoMedia?.querySelector("#details")
      const title = details?.querySelector("#video-title")?.textContent?.trim()

      if (videoMedia && thumbnail && details && title) {
        newVideoList.push({
          id: element.id || `video_${Date.now()}`,
          title: title,
          isPlaylist:
            thumbnail.tagName.toLowerCase() === "ytd-playlist-thumbnail",
          thumbnailElement: thumbnail,
          detailsElement: details,
          parentElement: element,
          parentHTML: element.outerHTML
        })
      }
    })

    return newVideoList
  }

  const removeRandomVideos = (
    list: VideoInfo[],
    count: number
  ): VideoInfo[] => {
    const shuffled = [...list].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, list.length - count)
  }

  const clearMainContent = () => {
    const mainContent = document.querySelector(
      "#primary > .ytd-two-column-browse-results-renderer.style-scope"
    )
    if (mainContent) {
      mainContent.innerHTML = ""
    }
    return mainContent
  }

  const createVideoGrid = (videos: VideoInfo[], container: Element) => {
    const gridContainer = document.createElement("div")
    gridContainer.id = "custom-video-grid"
    gridContainer.style.display = "grid"
    gridContainer.style.gridTemplateColumns = "repeat(4, 1fr)" // 4 columns
    gridContainer.style.gap = "16px"
    gridContainer.style.padding = "16px"

    videos.forEach((video) => {
      const videoElement = document.createElement("div")
      videoElement.innerHTML = video.parentHTML
      gridContainer.appendChild(videoElement)
    })

    container.appendChild(gridContainer)
  }

  const initialProcessing = () => {
    console.log("Initial processing...")
    removeChips()

    const currentVideos = collectVideoInfo()
    console.log(`Collected ${currentVideos.length} videos`)

    // Remove a random 30% of videos
    const filtered = removeRandomVideos(
      currentVideos,
      Math.floor(currentVideos.length * 0.3)
    )
    console.log(`Keeping ${filtered.length} videos`)

    setAllowedVideos(filtered)
    setIsInitialized(true)
    applyAllowedVideos(filtered)
  }

  React.useEffect(() => {
    // Delay initial processing
    const initTimer = setTimeout(() => {
      initialProcessing()
    }, 2000) // 2 second delay

    return () => {
      clearTimeout(initTimer)
    }
  }, []) // Empty dependency array, runs only once on mount

  // Ongoing maintenance effect
  React.useEffect(() => {
    if (!isInitialized) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          removeChips()
          applyAllowedVideos(allowedVideos)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [isInitialized]) // Only re-run if isInitialized changes

  // Add a loading overlay
  if (!isInitialized) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px"
        }}>
        Loading...
      </div>
    )
  }

  return null
}

const applyAllowedVideos = (videos: VideoInfo[]) => {
  const mainContent = document.querySelector(
    "#primary > .ytd-two-column-browse-results-renderer"
  )
  if (!mainContent) return

  // Clear existing content
  mainContent.innerHTML = ""

  // Add allowed videos back to the main content
  videos.forEach((video) => {
    const videoElement = document.createElement("div")
    videoElement.innerHTML = video.parentHTML
    console.log(videoElement.firstElementChild)
    mainContent.appendChild(videoElement.firstElementChild)
  })
}

export default YouTubeBlocker
