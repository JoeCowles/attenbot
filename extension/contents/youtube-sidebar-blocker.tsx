import debounce from "lodash/debounce"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

interface VideoInfo {
  link: string
  title: string
  channel: string
}

const YouTubeSidebarBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const processingRef = React.useRef(false)
  const currentUrlRef = React.useRef("")
  const lastProcessedVideosRef = React.useRef<string[]>([])

  const processSidebar = React.useCallback(async () => {
    if (processingRef.current || !window.location.pathname.startsWith("/watch")) {
      console.log("Not processing sidebar, processingRef.current:", processingRef.current, "pathname:", window.location.pathname)
      return
    }
    processingRef.current = true
    console.log("Processing sidebar")
    const newUrl = window.location.href
    const urlChanged = newUrl !== currentUrlRef.current
    currentUrlRef.current = newUrl

    try {
      // Find the sidebar container
      const sidebarContainer = document.querySelector<HTMLElement>(
        "ytd-watch-next-secondary-results-renderer"
      )
      console.log("Sidebar container found:", sidebarContainer)
      if (sidebarContainer) {
        // Remove reel shelves
        const reelShelves = sidebarContainer.querySelectorAll("ytd-reel-shelf-renderer")
        reelShelves.forEach((shelf) => {
          console.log("Removing reel shelf from sidebar")
          shelf.remove()
        })
        
        // Collect all ytd-compact-video-renderer elements, excluding shorts
        const items = Array.from(
          sidebarContainer.querySelectorAll<HTMLElement>("ytd-compact-video-renderer")
        ).filter((item) => !item.querySelector('[id*="shorts"]'))

        // Extract video information
        const videoInfo: VideoInfo[] = items.map(item => ({
          link: `https://www.youtube.com${item.querySelector('a#video-title')?.getAttribute('href') || ''}`,
          title: item.querySelector('span#video-title')?.textContent?.trim() || '',
          channel: item.querySelector('#text.ytd-channel-name')?.textContent?.trim() || ''
        }))

        // Check if the video links have changed since last processing
        const currentVideoLinks = videoInfo.map(v => v.link)
        if (JSON.stringify(currentVideoLinks) === JSON.stringify(lastProcessedVideosRef.current) && !urlChanged) {
          return
        }

        lastProcessedVideosRef.current = currentVideoLinks

        const response = await sendToBackground<{ videos: VideoInfo[] }>({
          name: "filter-videos",
          body: { videos: videoInfo }
        })

        console.log('Received response from background script', response)

        const filteredLinks = response.videos
        const filteredItems = items.filter(item => {
          const link = item.querySelector('a#video-title')?.getAttribute('href')
          return link && filteredLinks.includes(`https://www.youtube.com${link}`)
        })

        // Update if the content has changed or URL has changed
        if (urlChanged || sidebarContainer.children.length !== filteredItems.length) {
          console.log("Updating sidebar content")
          // Clear the contents
          sidebarContainer.innerHTML = ""

          // Add back the filtered items
          filteredItems.forEach((item) => {
            sidebarContainer.appendChild(item)
          })
        }
      }
    } catch (error) {
      console.error('Error processing YouTube sidebar:', error)
    } finally {
      processingRef.current = false
    }
  }, [])

  const debouncedProcessSidebar = React.useMemo(
    () => debounce(processSidebar, 200),
    [processSidebar]
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processSidebar()
      setIsInitialized(true)

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const newVideos = Array.from(mutation.addedNodes).filter(
              (node) =>
                node instanceof Element &&
                node.matches("ytd-compact-video-renderer")
            )

            if (newVideos.length > 0) {
              console.log("New sidebar videos detected, reprocessing")
              debouncedProcessSidebar()
            }
          }
        })
      })

      const sidebarContainer = document.querySelector(
        "ytd-watch-next-secondary-results-renderer"
      )
      if (sidebarContainer) {
        observer.observe(sidebarContainer, { childList: true, subtree: true })
      }

      // Add scroll event listener
      const debouncedScrollHandler = debounce(() => {
        console.log("Scroll detected, reprocessing sidebar")
        debouncedProcessSidebar()
      }, 200)

      window.addEventListener("scroll", debouncedScrollHandler)

      // Add URL change listener
      const urlChangeHandler = () => {
        console.log("URL changed, reprocessing sidebar")
        debouncedProcessSidebar()
      }

      window.addEventListener("yt-navigate-finish", urlChangeHandler)

      return () => {
        observer.disconnect()
        window.removeEventListener("scroll", debouncedScrollHandler)
        window.removeEventListener("yt-navigate-finish", urlChangeHandler)
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      debouncedProcessSidebar.cancel()
    }
  }, [debouncedProcessSidebar])

  // Add a subtle loading overlay
  if (!isInitialized) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "426px", // Typical width of YouTube sidebar
          height: "100%",
          backgroundColor: "rgb(0, 0, 0)", // Solid black, no transparency
          zIndex: 9999,
          transition: "opacity 0.3s ease-in-out"
        }}
      />
    )
  }

  return null
}

export default YouTubeSidebarBlocker
