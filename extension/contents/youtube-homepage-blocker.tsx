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

const YouTubeBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false)
  const processingRef = React.useRef<boolean>(false)
  const lastProcessedUrlRef = React.useRef<string>("")
  const lastProcessedVideosRef = React.useRef<string[]>([])

  const processYouTubePage = React.useCallback(async (): Promise<void> => {
    if (processingRef.current || window.location.pathname !== "/") return
    
    const currentUrl = window.location.href
    if (currentUrl === lastProcessedUrlRef.current) return
    
    processingRef.current = true
    lastProcessedUrlRef.current = currentUrl

    try {
      // Remove rich shelves
      document.querySelectorAll("ytd-rich-shelf-renderer").forEach(shelf => shelf.remove())

      // Collect all ytd-rich-item-renderer elements, excluding shorts
      const items = Array.from(
        document.querySelectorAll<HTMLElement>("ytd-rich-item-renderer")
      ).filter(item => !item.querySelector('ytm-shorts-lockup-view-model-v2, [id*="ytm-shorts"]'))

      // Extract video information
      const videoInfo: VideoInfo[] = items.map(item => ({
        link: `https://www.youtube.com${item.querySelector('a#video-title-link')?.getAttribute('href') || ''}`,
        title: item.querySelector('a#video-title-link')?.getAttribute('title') || '',
        channel: item.querySelector('yt-formatted-string#text.ytd-channel-name')?.textContent || ''
      }))

      // Check if the video links have changed since last processing
      const currentVideoLinks = videoInfo.map(v => v.link)
      if (JSON.stringify(currentVideoLinks) === JSON.stringify(lastProcessedVideosRef.current)) {
        return
      }

      lastProcessedVideosRef.current = currentVideoLinks

      const response = await sendToBackground<{ videos: VideoInfo[] }>({
        name: "filter-videos",
        body: { videos: videoInfo }
      })

      console.log('Received response from background script', response)
      
      const filteredLinks = response.links
      const filteredItems = items.filter(item => {
        const link = item.querySelector('a#video-title-link')?.getAttribute('href')
        return link && filteredLinks.includes(`https://www.youtube.com${link}`)
      })

      const contentsContainer = document.querySelector<HTMLElement>(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )

      if (contentsContainer) {
        contentsContainer.innerHTML = ""
        filteredItems.forEach((item) => {
          contentsContainer.appendChild(item)
        })
      }

      // Remove chips
      const chipsContainer = document.querySelector<HTMLElement>(
        "#scroll-container > .ytd-feed-filter-chip-bar-renderer"
      )
      if (chipsContainer) {
        console.log("Removing chips container")
        chipsContainer.remove()
      }
    } catch (error) {
      console.error('Error processing YouTube page:', error)
    } finally {
      processingRef.current = false
    }
  }, [])

  const debouncedProcessYouTubePage = React.useMemo(
    () => debounce(processYouTubePage, 500),
    [processYouTubePage]
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processYouTubePage()
      setIsInitialized(true)

      const observer = new MutationObserver((mutations: MutationRecord[]) => {
        if (processingRef.current) return

        const hasNewVideos = mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node): node is Element => node instanceof Element && node.matches("ytd-rich-item-renderer")
          )
        )

        if (hasNewVideos) {
          console.log("New videos detected, reprocessing page")
          debouncedProcessYouTubePage()
        }
      })

      const contentsContainer = document.querySelector<HTMLElement>(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )
      if (contentsContainer) {
        observer.observe(contentsContainer, { childList: true, subtree: true })
      }

      // Add URL change listener
      const urlChangeHandler = (): void => {
        if (!processingRef.current) {
          console.log("URL changed, reprocessing")
          debouncedProcessYouTubePage()
        }
      }

      window.addEventListener("yt-navigate-finish", urlChangeHandler)

      return () => {
        observer.disconnect()
        window.removeEventListener("yt-navigate-finish", urlChangeHandler)
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      debouncedProcessYouTubePage.cancel()
    }
  }, [debouncedProcessYouTubePage, processYouTubePage])

  if (!isInitialized) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgb(0, 0, 0)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "opacity 0.3s ease-in-out"
        }}
      />
    )
  }

  return null
}

export default YouTubeBlocker
