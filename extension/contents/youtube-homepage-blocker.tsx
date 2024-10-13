import debounce from "lodash/debounce"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const allItemsRef = React.useRef<Element[]>([])
  const processingRef = React.useRef(false)

  const processYouTubePage = React.useCallback(() => {
    if (processingRef.current || window.location.pathname !== "/") return
    processingRef.current = true

    // Remove rich shelves
    const richShelves = document.querySelectorAll("ytd-rich-shelf-renderer")
    richShelves.forEach((shelf) => {
      console.log("Removing rich shelf")
      shelf.remove()
    })

    // Collect all ytd-rich-item-renderer elements, excluding shorts
    const items = Array.from(
      document.querySelectorAll("ytd-rich-item-renderer")
    ).filter((item) => {
      return !item.querySelector(
        'ytm-shorts-lockup-view-model-v2, [id*="ytm-shorts"]'
      )
    })
    allItemsRef.current = items

    // Find the contents container
    const contentsContainer = document.querySelector(
      "div#contents.style-scope.ytd-rich-grid-renderer"
    )

    if (contentsContainer) {
      const currentItems = Array.from(contentsContainer.children)
      const itemsToKeep = items.slice(0, 10)

      // Only update if the content has changed
      if (
        currentItems.length !== itemsToKeep.length ||
        !currentItems.every((item, index) => item === itemsToKeep[index])
      ) {
        // Clear the contents
        contentsContainer.innerHTML = ""

        // Add back the top 10 items
        itemsToKeep.forEach((item) => {
          contentsContainer.appendChild(item)
        })
      }
    }

    // Remove chips
    const chipsContainer = document.querySelector(
      "#scroll-container > .ytd-feed-filter-chip-bar-renderer"
    )
    if (chipsContainer) {
      console.log("Removing chips container")
      chipsContainer.remove()
    }

    processingRef.current = false
  }, [])

  const debouncedProcessYouTubePage = React.useMemo(
    () => debounce(processYouTubePage, 200),
    [processYouTubePage]
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processYouTubePage()
      setIsInitialized(true)

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const newVideos = Array.from(mutation.addedNodes).filter(
              (node) =>
                node instanceof Element &&
                node.matches("ytd-rich-item-renderer")
            )

            if (newVideos.length > 0) {
              console.log("New videos detected, reprocessing page")
              debouncedProcessYouTubePage()
            }
          }
        })
      })

      const contentsContainer = document.querySelector(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )
      if (contentsContainer) {
        observer.observe(contentsContainer, { childList: true, subtree: true })
      }

      // Add scroll event listener
      const debouncedScrollHandler = debounce(() => {
        console.log("Scroll detected, reprocessing")
        debouncedProcessYouTubePage()
      }, 200)

      window.addEventListener("scroll", debouncedScrollHandler)

      // Add URL change listener
      const urlChangeHandler = () => {
        console.log("URL changed, reprocessing")
        debouncedProcessYouTubePage()
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
  }, [debouncedProcessYouTubePage])

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
