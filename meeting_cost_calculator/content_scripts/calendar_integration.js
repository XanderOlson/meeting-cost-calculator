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

function processMeetingDetails(eventPopupElement) {
  console.log('Content Script: Processing meeting details for:', eventPopupElement);
  let attendeeCount = 1; // Default to 1 (organizer)
  let guestTextFound = false;

  // EXAMPLE SELECTOR for attendee count text - VERIFY AND UPDATE THIS SELECTOR based on live GCal DOM
  // Looks for elements that might contain text like "X guests" or "Y attendees".
  const guestInfoElements = eventPopupElement.querySelectorAll('span[aria-label*="guest"], div[aria-label*="guest list"] span'); 

  guestInfoElements.forEach(guestInfoElement => {
    if (guestTextFound) return; // Stop if already found
    const text = guestInfoElement.textContent || "";
    const match = text.match(/(\d+)\s+(guest|attendee)/i); // e.g., "2 guests", "1 attendee"
    
    if (match && match[1]) {
      // Assuming "X guests" means total people
      attendeeCount = parseInt(match[1], 10); 
      guestTextFound = true;
      console.log(`Content Script: Found guest text: "${text}", parsed attendees: ${attendeeCount}`);
    }
  });
  
  if (!guestTextFound) {
    // Fallback: If no summary text like "X guests" is found, try to count individual attendee elements.
    // EXAMPLE SELECTOR for individual attendee elements - VERIFY AND UPDATE THIS SELECTOR.
    // This selector looks for elements that might represent each participant, e.g., those with a 'data-email' attribute.
    const individualAttendeeElements = eventPopupElement.querySelectorAll('div[data-email]'); 
    
    if (individualAttendeeElements && individualAttendeeElements.length > 0) {
         // This count usually includes the organizer directly.
         attendeeCount = individualAttendeeElements.length;
         console.log(`Content Script: No guest text found. Counted individual attendee elements: ${attendeeCount}`);
    } else {
        console.log("Content Script: No explicit guest count text or individual attendee elements found. Defaulting to 1 attendee (organizer). Consider inspecting DOM for better selectors if this is incorrect.");
    }
  }

  console.log('Content Script: Extracted Attendee Count (approx) -', attendeeCount);

  // const durationHours = extractDuration(eventPopupElement); // To be defined in Task 3.3
  // console.log('Content Script: Extracted Duration (hours) -', durationHours);
  // if (durationHours > 0 && attendeeCount > 0 && averageCostPerHour > 0) {
  //   calculateAndDisplayCost(eventPopupElement, attendeeCount, durationHours); // To be defined in Task 3.4
  // }
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
