import debounce from "lodash/debounce"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [initialProcessingDone, setInitialProcessingDone] = React.useState(false)
  const allItemsRef = React.useRef<Element[]>([])
  const processingRef = React.useRef(false)
  const lastProcessedRef = React.useRef<string[]>([])

  const processYouTubePage = React.useCallback(() => {
    if (processingRef.current || window.location.pathname !== "/") return
    processingRef.current = true

    // Collect all ytd-rich-item-renderer elements, excluding shorts
    const items = Array.from(
      document.querySelectorAll("ytd-rich-item-renderer")
    ).filter((item) => {
      return !item.querySelector(
        'ytm-shorts-lockup-view-model-v2, [id*="ytm-shorts"]'
      )
    })

    // Extract video information
    const videoInfo = items.map(item => {
      const link = item.querySelector('a#video-title-link')?.getAttribute('href')
      const title = item.querySelector('a#video-title-link')?.getAttribute('title')
      const channel = item.querySelector('yt-formatted-string#text.ytd-channel-name')?.textContent

      return {
        link: link ? `https://www.youtube.com${link}` : '',
        title: title || '',
        channel: channel || ''
      }
    })

    // Check if the video links have changed since last processing
    const currentLinks = videoInfo.map(v => v.link)
    if (JSON.stringify(currentLinks) === JSON.stringify(lastProcessedRef.current)) {
      processingRef.current = false
      return
    }

    // Update lastProcessedRef
    lastProcessedRef.current = currentLinks

    // Send video information to background script
    console.log("Attempting to send message to background script", videoInfo)
    sendToBackground({
      name: "filter-videos",
      body: { videos: videoInfo }
    }).then(response => {
      console.log('Received response from background script', response)
      // Process the filtered videos
      const filteredLinks = response.links
      const filteredItems = items.filter(item => {
        const link = item.querySelector('a#video-title-link')?.getAttribute('href')
        return link && filteredLinks.includes(`https://www.youtube.com${link}`)
      })

      // Find the contents container
      const contentsContainer = document.querySelector(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )

      if (contentsContainer) {
        // Clear the contents
        contentsContainer.innerHTML = ""

        // Add back the filtered items
        filteredItems.forEach((item) => {
          contentsContainer.appendChild(item)
        })
      }
    }).catch(error => {
      console.error('Error sending message or processing response:', error)
    }).finally(() => {
      processingRef.current = false
    })

    // Remove chips
    const chipsContainer = document.querySelector(
      "#scroll-container > .ytd-feed-filter-chip-bar-renderer"
    )
    if (chipsContainer) {
      console.log("Removing chips container")
      chipsContainer.remove()
    }
  }, [])

  const debouncedProcessYouTubePage = React.useMemo(
    () => debounce(processYouTubePage, 200),
    [processYouTubePage]
  )

  React.useEffect(() => {
    if (initialProcessingDone) return

    const timer = setTimeout(() => {
      processYouTubePage()
      setIsInitialized(true)
      setInitialProcessingDone(true)

      const observer = new MutationObserver((mutations) => {
        if (processingRef.current) return

        const hasNewVideos = mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) =>
              node instanceof Element &&
              node.matches("ytd-rich-item-renderer")
          )
        )

        if (hasNewVideos) {
          console.log("New videos detected, reprocessing page")
          debouncedProcessYouTubePage()
        }
      })

      const contentsContainer = document.querySelector(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )
      if (contentsContainer) {
        observer.observe(contentsContainer, { childList: true, subtree: true })
      }

      // Add scroll event listener
      const debouncedScrollHandler = debounce(() => {
        if (!processingRef.current) {
          console.log("Scroll detected, reprocessing")
          debouncedProcessYouTubePage()
        }
      }, 200)

      window.addEventListener("scroll", debouncedScrollHandler)

      // Add URL change listener
      const urlChangeHandler = () => {
        if (!processingRef.current) {
          console.log("URL changed, reprocessing")
          debouncedProcessYouTubePage()
        }
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
      debouncedProcessYouTubePage.cancel()
    }
  }, [debouncedProcessYouTubePage, initialProcessingDone])

  // Add a subtle loading overlay
  if (!isInitialized) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgb(0, 0, 0)", // Solid black, no transparency
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "opacity 0.3s ease-in-out"
        }}></div>
    )
  }

  return null
}

export default YouTubeBlocker
