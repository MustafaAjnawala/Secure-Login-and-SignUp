document.addEventListener("keydown", function(event) {
    // Check if Alt key and arrow key (left or right) are pressed
    if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      // Prevent the default browser behavior (navigation)
      event.preventDefault();
      // Optionally, you can display a message or perform other actions
      console.log("Navigation prevented by Alt + Arrow key combination");
    }
  });
  
  // Disable back/forward navigation using browser history
window.addEventListener('popstate', function(event) {
    // Restore the current URL to prevent navigation
    history.pushState(null, document.title, location.href);
  });