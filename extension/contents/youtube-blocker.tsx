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
    if (processingRef.current) return
    processingRef.current = true

    // Collect all ytd-rich-item-renderer elements
    const items = Array.from(
      document.querySelectorAll("ytd-rich-item-renderer")
    )
    allItemsRef.current = items

    // Find the contents container
    const contentsContainer = document.querySelector(
      "div#contents.style-scope.ytd-rich-grid-renderer"
    )

    if (contentsContainer) {
      const currentItems = Array.from(contentsContainer.children)
      const itemsToKeep = items.slice(0, 3)

      // Only update if the content has changed
      if (
        currentItems.length !== itemsToKeep.length ||
        !currentItems.every((item, index) => item === itemsToKeep[index])
      ) {
        // Clear the contents
        contentsContainer.innerHTML = ""

        // Add back the top 3 items
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
        }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #ccc",
            borderTopColor: "#333",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}
        />
      </div>
    )
  }

  return null
}

export default YouTubeBlocker
