// Check if service workers are supported
if ("serviceWorker" in navigator) {
  // Use window.addEventListener to ensure the page is fully loaded
  window.addEventListener("load", () => {
    // Register the service worker from the root path
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Registration was successful
        console.log("ServiceWorker registration successful with scope: ", registration.scope)
      })
      .catch((error) => {
        // Registration failed
        console.log("ServiceWorker registration failed: ", error)
      })
  })
} else {
  console.log("Service workers are not supported in this browser.")
}

