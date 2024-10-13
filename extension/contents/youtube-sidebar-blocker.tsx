import debounce from "lodash/debounce"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeSidebarBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const allItemsRef = React.useRef<Element[]>([])
  const processingRef = React.useRef(false)
  const currentUrlRef = React.useRef("")

  const processSidebar = React.useCallback(() => {
    if (processingRef.current || !window.location.pathname.startsWith("/watch"))
      return
    processingRef.current = true

    const newUrl = window.location.href
    const urlChanged = newUrl !== currentUrlRef.current
    currentUrlRef.current = newUrl

    // Collect all ytd-compact-video-renderer elements, excluding shorts
    const items = Array.from(
      document.querySelectorAll("ytd-compact-video-renderer")
    ).filter((item) => {
      return !item.querySelector('[id*="shorts"]')
    })
    allItemsRef.current = items

    // Find the sidebar container
    const sidebarContainer = document.querySelector(
      "ytd-watch-next-secondary-results-renderer"
    )

    if (sidebarContainer) {
      const currentItems = Array.from(sidebarContainer.children)
      const itemsToKeep = items.slice(0, 2) // Keep only the top 2 recommendations

      // Update if the content has changed or URL has changed
      if (
        urlChanged ||
        currentItems.length !== itemsToKeep.length ||
        !currentItems.every((item, index) => item === itemsToKeep[index])
      ) {
        console.log("Updating sidebar content")
        // Clear the contents
        sidebarContainer.innerHTML = ""

        // Add back the top 2 items
        itemsToKeep.forEach((item) => {
          sidebarContainer.appendChild(item)
        })
      }
    }

    processingRef.current = false
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
