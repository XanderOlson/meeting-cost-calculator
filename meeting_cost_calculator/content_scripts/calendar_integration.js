console.log("Meeting Cost Calculator: Content script loaded on Google Calendar.");

let averageCostPerHour = 0; // Default value

function loadAverageCost() {
  // Ensure chrome.storage.sync is available (it should be in a content script)
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['averageCost'], function (result) {
      if (chrome.runtime.lastError) {
        // Log any error during storage access
        console.error('Content Script: Error loading average cost -', chrome.runtime.lastError.message);
        console.log('Content Script: Using default average cost:', averageCostPerHour);
        return;
      }

      if (result.averageCost !== undefined) {
        averageCostPerHour = result.averageCost;
        console.log('Content Script: Loaded average cost -', averageCostPerHour);
      } else {
        console.log('Content Script: No average cost found in storage. Using default:', averageCostPerHour);
      }
      // Future: Trigger UI update if needed for already visible elements
    });
  } else {
    console.error("Content Script: chrome.storage.sync API not available. Using default cost.");
     // Future: Trigger UI update if needed for already visible elements (with default cost)
  }
}

loadAverageCost(); // Load cost when script initially runs
