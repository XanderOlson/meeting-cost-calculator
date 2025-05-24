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

if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'sync' && changes.averageCost) {
      const oldRate = averageCostPerHour;
      if (changes.averageCost.newValue !== undefined) {
        averageCostPerHour = changes.averageCost.newValue;
        console.log(`Content Script: Average cost updated from ${oldRate} to ${averageCostPerHour}`);
      } else {
        averageCostPerHour = 0; 
        console.log(`Content Script: Average cost was removed from storage. Reset to ${averageCostPerHour}. Old value was ${oldRate}`);
      }
      // Future: Trigger UI update for visible meetings (Task 4.1)
    }
  });
} else {
  console.warn("Content Script: chrome.storage.onChanged API not available. Real-time updates disabled.");
}

// Placeholder for the function to be defined in Task 3.2
function processMeetingDetails(eventPopupElement) {
    console.log('Placeholder: processMeetingDetails called for', eventPopupElement);
    // Future: Add logic to extract details, calculate and display cost (Tasks 3.2-3.5)
}

function observeCalendarChanges() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // EXAMPLE SELECTOR - This may need verification and adjustment against the live Google Calendar DOM.
        const eventPopup = document.querySelector('div[role="dialog"][aria-modal="true"][data-calendar-id]');
        
        if (eventPopup && !eventPopup.dataset.costProcessed) {
          console.log('Content Script: Event detail pop-up detected.', eventPopup);
          eventPopup.dataset.costProcessed = 'true'; // Mark as processed to avoid re-processing
          
          // Give GCal a moment to fully render the popup's content before processing
          setTimeout(() => {
            processMeetingDetails(eventPopup);
          }, 500); // Small delay, adjust if necessary
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log('Content Script: MutationObserver started for calendar changes.');
}

// Call it after a short delay to give GCal time to initialize its main UI
setTimeout(observeCalendarChanges, 2000);
