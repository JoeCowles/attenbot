import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

// This content script is used to send the link of the video to the webapp
// so that we can add it to the database

export const config: PlasmoCSConfig = {
    matches: ["https://www.youtube.com/*"],
    all_frames: true
}

function sendVideoLink() {
    const videoUrl = window.location.href
    const videoTitle = document.title

    if (videoUrl.includes("watch?v=")) {
        sendToBackground({
            name: "send-video-link",
            body: {
                url: videoUrl,
                title: videoTitle
            }
        })
    }
}

// Run the function when the page loads
sendVideoLink()

// Listen for URL changes (for single-page apps like YouTube)
let lastUrl = location.href
new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
        lastUrl = url
        sendVideoLink()
    }
}).observe(document, { subtree: true, childList: true })
