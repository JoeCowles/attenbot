import type { PlasmoCSConfig } from "plasmo"
import React from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}

const YouTubeBlocker: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [allItems, setAllItems] = React.useState<Element[]>([])

  React.useEffect(() => {
    const processYouTubePage = () => {
      // Collect all ytd-rich-item-renderer elements
      const items = Array.from(
        document.querySelectorAll("ytd-rich-item-renderer")
      )
      setAllItems(items)

      // Find the contents container
      const contentsContainer = document.querySelector(
        "div#contents.style-scope.ytd-rich-grid-renderer"
      )

      if (contentsContainer) {
        // Clear the contents
        contentsContainer.innerHTML = ""

        // Add back the top 3 items
        items.slice(0, 3).forEach((item) => {
          contentsContainer.appendChild(item)
        })
      }

      // Remove chips
      const chipsContainer = document.querySelector(
        "#scroll-container > .ytd-feed-filter-chip-bar-renderer"
      )
      if (chipsContainer) {
        console.log("Removing chips container")
        chipsContainer.remove()
      }
    }

    // Add a 2-second delay before initializing
    const timer = setTimeout(() => {
      processYouTubePage()
      setIsInitialized(true)
    }, 2000)

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer)
  }, [])

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
