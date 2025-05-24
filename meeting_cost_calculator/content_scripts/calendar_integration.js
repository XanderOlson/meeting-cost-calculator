console.log("Meeting Cost Calculator: Content script loaded on Google Calendar.");

let averageCostPerHour = 0; // Default value

function loadAverageCost() {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['averageCost'], function (result) {
      if (chrome.runtime.lastError) {
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
    });
  } else {
    console.error("Content Script: chrome.storage.sync API not available. Using default cost.");
  }
}

loadAverageCost(); // Load cost when script initially runs

// Add listener for storage changes
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'sync' && changes.averageCost) {
      const oldRate = averageCostPerHour;
      // Check if newValue exists, as it might be undefined if the item is deleted
      if (changes.averageCost.newValue !== undefined) {
        averageCostPerHour = changes.averageCost.newValue;
        console.log(`Content Script: Average cost updated from ${oldRate} to ${averageCostPerHour}`);
      } else {
        // Handle case where averageCost might have been deleted from storage
        averageCostPerHour = 0; // Reset to default or a predefined value
        console.log(`Content Script: Average cost was removed from storage. Reset to ${averageCostPerHour}. Old value was ${oldRate}`);
      }
      // Future: Trigger UI update for visible meetings
    }
  });
} else {
  console.warn("Content Script: chrome.storage.onChanged API not available. Real-time updates disabled.");
}
