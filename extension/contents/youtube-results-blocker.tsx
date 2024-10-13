import debounce from "lodash/debounce"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeResultsBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const processingRef = React.useRef(false)

  const processSearchResults = React.useCallback(() => {
    if (
      processingRef.current ||
      !window.location.pathname.startsWith("/results")
    )
      return
    processingRef.current = true

    // Remove chips
    const chipsContainer = document.querySelector("iron-selector#chips")
    if (chipsContainer) {
      console.log("Removing chips container")
      chipsContainer.remove()
    }

    // Remove reel shelf
    const reelShelves = document.querySelectorAll("ytd-reel-shelf-renderer")
    reelShelves.forEach((shelf) => {
      console.log("Removing reel shelf")
      shelf.remove()
    })

    processingRef.current = false
  }, [])

  const debouncedProcessSearchResults = React.useMemo(
    () => debounce(processSearchResults, 200),
    [processSearchResults]
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processSearchResults()
      setIsInitialized(true)

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const newChips = Array.from(mutation.addedNodes).some(
              (node) =>
                node instanceof Element && node.matches("iron-selector#chips")
            )
            const newReelShelves = Array.from(mutation.addedNodes).some(
              (node) =>
                node instanceof Element &&
                node.matches("ytd-reel-shelf-renderer")
            )

            if (newChips || newReelShelves) {
              console.log("New chips or reel shelves detected, reprocessing")
              debouncedProcessSearchResults()
            }
          }
        })
      })

      const resultsContainer = document.querySelector(
        "ytd-section-list-renderer#contents"
      )
      if (resultsContainer) {
        observer.observe(resultsContainer, { childList: true, subtree: true })
      }

      // Add scroll event listener
      const debouncedScrollHandler = debounce(() => {
        console.log("Scroll detected, reprocessing")
        debouncedProcessSearchResults()
      }, 200)

      window.addEventListener("scroll", debouncedScrollHandler)

      // Add URL change listener
      const urlChangeHandler = () => {
        console.log("URL changed, reprocessing")
        debouncedProcessSearchResults()
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
      debouncedProcessSearchResults.cancel()
    }
  }, [debouncedProcessSearchResults])

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

export default YouTubeResultsBlocker
