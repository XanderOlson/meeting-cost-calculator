console.log("Meeting Cost Calculator: Content script loaded on Google Calendar.");

let averageCostPerHour = 0; // Default value
let meetingCost = 0; // attendeeCount * averageCostPerHour

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
  console.log('Content Script: Processing meeting details for:', eventPopupElement[0].innerText);
  let attendeeCount = 1; // Default to 1 (organizer)
  let guestTextFound = false;
  const guestText = eventPopupElement[0].innerText.split("\n")[0];
  // Match patterns like "2 guests" or "1 attendee" (plural forms allowed)
  const match = guestText.match(/(\d+)\s+(?:guest|attendee)s?/i);
  
  if (match && match[1]) {
    // Assuming "X guests" means total people
    attendeeCount = parseInt(match[1], 10); 
    guestTextFound = true;
    console.log(`Content Script: Found guest text: "${guestText}", parsed attendees: ${attendeeCount}`);
  }
  ;

  console.log('Content Script: Extracted Attendee Count (approx) -', attendeeCount);

  meetingCost = attendeeCount * averageCostPerHour;
  console.log('Content Script: Meeting Cost (per hour) -', meetingCost);

  // const durationHours = extractDuration(eventPopupElement); // To be defined in Task 3.3
  // console.log('Content Script: Extracted Duration (hours) -', durationHours);
  // if (durationHours > 0 && attendeeCount > 0 && averageCostPerHour > 0) {
  //   calculateAndDisplayCost(eventPopupElement, attendeeCount, durationHours); // To be defined in Task 3.4
  // }

  // Duplicate attendee info div and insert the clone
  duplicateGuestInfo(eventPopupElement);
}

// Duplicates the `.bgOWSb` div inside the provided event popup element
// and appends the clone back into the same container (`#xDetDlgAtt`).
function duplicateGuestInfo(eventPopupElement) {
  if (!eventPopupElement || eventPopupElement.length === 0) {
    console.warn('Content Script: duplicateGuestInfo called with invalid element');
    return;
  }

  const container = eventPopupElement[0];
  const textDiv = container.querySelector('.bgOWSb');

  if (!textDiv) {
    console.warn('Content Script: Could not find div.bgOWSb to duplicate');
    return;
  }

  const clone = textDiv.cloneNode(true);
  clone.textContent = `Meeting Cost: ${meetingCost} / hr`;
  container.appendChild(clone);
  console.log('Content Script: Duplicated guest info div with cost text');
}

function observeCalendarChanges() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  let costProcessed = false;

  const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // EXAMPLE SELECTOR - This may need verification and adjustment against the live Google Calendar DOM.
        const eventPopup = document.querySelectorAll('[id="xDetDlgAtt"]');
        
        // Check if the event popup element exists
        if (!eventPopup || eventPopup.length === 0) {
          console.warn('Content Script: Could not find event popup element');
          return;
        }
        
        if (eventPopup[0].innerText && !costProcessed) {
          console.log('Content Script: Event detail pop-up detected.', eventPopup);
          costProcessed = true; // Mark as processed to avoid re-processing
          
          // Give GCal a moment to fully render the popup's content before processing
          setTimeout(() => {
            processMeetingDetails(eventPopup);
          }, 200); // Small delay, adjust if necessary
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log('Content Script: MutationObserver started for calendar changes.');
}

// Call it after a short delay to give GCal time to initialize its main UI
setTimeout(observeCalendarChanges, 500);
