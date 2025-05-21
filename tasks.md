# MVP Build Plan: Meeting Cost Calculator Chrome Extension

This document outlines a granular, step-by-step plan to build the Minimum Viable Product (MVP) for the Meeting Cost Calculator Chrome Extension. Each task is designed to be small, testable, and focus on a single concern, suitable for sequential development.

The MVP will focus on:
1.  Allowing the user to set an average hourly cost per person via the extension popup.
2.  Displaying the calculated meeting cost within the Google Calendar event detail pop-up (when a user clicks on a specific event).

---

## Phase 1: Extension Foundation & Popup UI/Logic

**Task 1.1: Initialize `manifest.json` for a Popup Action**
* **Goal**: Create the basic manifest file and ensure the extension loads with a clickable icon leading to a placeholder popup.
* **Start**: No files exist. Create a new project folder `meeting_cost_calculator/`.
* **Action**:
    1.  Inside `meeting_cost_calculator/`, create `manifest.json`.
    2.  Populate `manifest.json` with:
        ```json
        {
          "manifest_version": 3,
          "name": "Meeting Cost Calculator (MVP)",
          "version": "0.1.0",
          "description": "Displays estimated meeting costs in Google Calendar.",
          "icons": {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          },
          "action": {
            "default_popup": "popup/popup.html",
            "default_title": "Set Meeting Cost"
          }
        }
        ```
    3.  Create an `icons/` folder.
    4.  Place placeholder `icon16.png`, `icon48.png`, `icon128.png` files in the `icons/` folder (any small PNGs will do for now).
    5.  Create a `popup/` folder.
    6.  Inside `popup/`, create `popup.html` with basic content: `<h1>Popup Works</h1>`.
* **End**: The extension can be loaded into Chrome, displaying its icon. Clicking the icon opens `popup.html`.
* **Test**:
    1.  Go to `chrome://extensions` in your Chrome browser.
    2.  Enable "Developer mode".
    3.  Click "Load unpacked" and select the `meeting_cost_calculator` folder.
    4.  Verify the extension icon appears in the Chrome toolbar.
    5.  Click the icon. The popup should appear and display "Popup Works".

**Task 1.2: Create Basic `popup.html` Structure for Input**
* **Goal**: Design the HTML structure for the cost input field and save button in the popup.
* **Start**: `popup/popup.html` contains `<h1>Popup Works</h1>`.
* **Action**:
    1.  Modify `popup/popup.html` to include:
        ```html
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Meeting Cost Settings</title>
          <link rel="stylesheet" href="popup.css">
        </head>
        <body>
          <div>
            <label for="costInput">Avg. Hourly Cost/Person ($):</label>
            <input type="number" id="costInput" min="0" step="any">
          </div>
          <button id="saveButton">Save Cost</button>
          <script src="popup.js"></script>
        </body>
        </html>
        ```
    2. Create an empty `popup/popup.css` file.
    3. Create an empty `popup/popup.js` file.
* **End**: The popup, when opened, displays a label, a number input field, and a "Save Cost" button.
* **Test**:
    1.  Reload the extension from `chrome://extensions` (or click the refresh icon for the extension).
    2.  Click the extension icon.
    3.  Verify the popup shows the label, input field, and button.

**Task 1.3: Implement Saving Cost in `popup.js` to `chrome.storage`**
* **Goal**: Enable the "Save Cost" button to store the input value in `chrome.storage.sync`.
* **Start**: `popup.js` is empty. `popup.html` has the input and button. `manifest.json` is defined.
* **Action**:
    1.  Add the `storage` permission to `manifest.json`:
        ```json
        // Inside manifest.json, add or create the permissions key:
        "permissions": ["storage"],
        ```
    2.  In `popup/popup.js`, add the following:
        ```javascript
        document.addEventListener('DOMContentLoaded', function () {
          const costInput = document.getElementById('costInput');
          const saveButton = document.getElementById('saveButton');

          saveButton.addEventListener('click', function () {
            const cost = costInput.value;
            if (cost !== "" && !isNaN(parseFloat(cost)) && parseFloat(cost) >= 0) {
              chrome.storage.sync.set({ averageCost: parseFloat(cost) }, function () {
                console.log('Average cost saved:', parseFloat(cost));
                saveButton.textContent = 'Saved!';
                setTimeout(() => { saveButton.textContent = 'Save Cost'; }, 1000);
              });
            } else {
              console.error('Invalid cost input');
              // Optional: Visual feedback for invalid input
              costInput.style.borderColor = 'red';
              setTimeout(() => { costInput.style.borderColor = ''; }, 2000);
            }
          });
        });
        ```
* **End**: Value entered in the popup's input field is saved to `chrome.storage.sync` when "Save Cost" is clicked.
* **Test**:
    1.  Reload the extension.
    2.  Open the popup, enter a number (e.g., `50`) into the input field, and click "Save Cost".
    3.  Open Chrome DevTools for the popup (right-click popup, Inspect), go to Application > Storage > Chrome Storage (select extension ID). Verify `averageCost` is stored correctly.
    4.  Check the console log in the popup's DevTools for "Average cost saved: 50".

**Task 1.4: Implement Loading and Displaying Saved Cost in `popup.js`**
* **Goal**: When the popup opens, it should display the previously saved cost.
* **Start**: `popup.js` can save the cost. `costInput` field exists.
* **Action**:
    1.  Modify `popup/popup.js` (within the `DOMContentLoaded` listener, before the `saveButton` event listener):
        ```javascript
        // Inside document.addEventListener('DOMContentLoaded', function () {
          const costInput = document.getElementById('costInput');
          const saveButton = document.getElementById('saveButton');

          // Load saved cost
          chrome.storage.sync.get(['averageCost'], function (result) {
            if (result.averageCost !== undefined) {
              costInput.value = result.averageCost;
              console.log('Loaded average cost:', result.averageCost);
            } else {
              console.log('No average cost found in storage.');
            }
          });

          // ... (saveButton.addEventListener remains here)
        // });
        ```
* **End**: The popup input field is pre-filled with the `averageCost` from `chrome.storage.sync` when the popup is opened.
* **Test**:
    1.  Ensure a cost is already saved (from Task 1.3).
    2.  Reload the extension.
    3.  Close and re-open the popup.
    4.  Verify the input field shows the previously saved cost. Check console for load message.

**Task 1.5: Add Basic Styling to `popup.css`**
* **Goal**: Apply minimal styling to the popup for better usability.
* **Start**: `popup/popup.css` is empty but linked in `popup.html`.
* **Action**:
    1.  Add basic styles to `popup/popup.css`:
        ```css
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          width: 250px;
          padding: 10px;
          box-sizing: border-box;
        }
        div {
          margin-bottom: 10px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
          color: #333;
        }
        input[type="number"] {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          padding: 10px 15px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-size: 14px;
        }
        button:hover {
          background-color: #45a049;
        }
        ```
* **End**: The popup has a more organized and slightly styled appearance.
* **Test**:
    1.  Reload the extension.
    2.  Open the popup.
    3.  Verify the elements are styled (e.g., input width, button color, font).

---

## Phase 2: Content Script Setup & Basic Communication

**Task 2.1: Configure Basic Content Script in `manifest.json` and Create File**
* **Goal**: Set up the manifest to inject a content script into Google Calendar pages and create the script file.
* **Start**: `manifest.json` exists. No content script yet.
* **Action**:
    1.  Create a `content_scripts/` folder in the root of `meeting_cost_calculator/`.
    2.  Inside `content_scripts/`, create `calendar_integration.js` with a single line:
        ```javascript
        console.log("Meeting Cost Calculator: Content script loaded on Google Calendar.");
        ```
    3.  Modify `manifest.json` to include the `content_scripts` definition and `host_permissions`:
        ```json
        // Inside manifest.json
        // Ensure "permissions": ["storage"] is already there
        "host_permissions": ["*://[calendar.google.com/](https://calendar.google.com/)*"],
        "content_scripts": [
          {
            "matches": ["*://[calendar.google.com/](https://calendar.google.com/)*"],
            "js": ["content_scripts/calendar_integration.js"],
            "run_at": "document_idle"
          }
        ]
        ```
* **End**: `calendar_integration.js` is injected into Google Calendar pages after the DOM is mostly loaded.
* **Test**:
    1.  Reload the extension.
    2.  Navigate to `https://calendar.google.com/`.
    3.  Open Chrome DevTools for the Google Calendar page (right-click on page, Inspect).
    4.  Check the Console tab for the message "Meeting Cost Calculator: Content script loaded on Google Calendar."

**Task 2.2: Content Script Reads Average Cost from `chrome.storage`**
* **Goal**: Enable the content script to retrieve the `averageCost` set by the popup.
* **Start**: `calendar_integration.js` logs a loaded message. `averageCost` can be set via popup.
* **Action**:
    1.  Modify `content_scripts/calendar_integration.js`:
        ```javascript
        console.log("Meeting Cost Calculator: Content script loaded on Google Calendar.");

        let averageCostPerHour = 0; // Default value

        function loadAverageCost() {
          chrome.storage.sync.get(['averageCost'], function (result) {
            if (result.averageCost !== undefined) {
              averageCostPerHour = result.averageCost;
              console.log('Content Script: Loaded average cost -', averageCostPerHour);
            } else {
              console.log('Content Script: No average cost found in storage. Using default:', averageCostPerHour);
            }
            // Future: Trigger UI update if needed for already visible elements
          });
        }

        loadAverageCost(); // Load cost when script initially runs
        ```
* **End**: The content script retrieves and logs the `averageCost` from `chrome.storage.sync` when a Google Calendar page loads.
* **Test**:
    1.  Use the popup to set/save an average cost (e.g., `60`).
    2.  Reload the extension.
    3.  Navigate to or refresh `https://calendar.google.com/`.
    4.  Check the Google Calendar page's DevTools console. Verify it logs "Content Script: Loaded average cost - 60".
    5.  If no cost was saved, it should log the default message.

**Task 2.3: Content Script Listens for Real-time Cost Changes from `chrome.storage`**
* **Goal**: Allow the content script to react dynamically if the `averageCost` is changed in the popup while the Google Calendar page is open.
* **Start**: `calendar_integration.js` can read the initial cost.
* **Action**:
    1.  Append to `content_scripts/calendar_integration.js`:
        ```javascript
        // ... (previous code: console.log, averageCostPerHour variable, loadAverageCost function, initial call to loadAverageCost)

        chrome.storage.onChanged.addListener(function (changes, namespace) {
          if (namespace === 'sync' && changes.averageCost) {
            const oldRate = averageCostPerHour;
            averageCostPerHour = changes.averageCost.newValue;
            console.log(`Content Script: Average cost updated from ${oldRate} to ${averageCostPerHour}`);
            // Future: Trigger UI update for visible meetings
          }
        });
        ```
* **End**: The content script logs a message when `averageCost` in `chrome.storage.sync` is updated.
* **Test**:
    1.  Reload the extension.
    2.  Have `https://calendar.google.com/` open with its DevTools console visible.
    3.  Open the extension popup, change the cost (e.g., to `75`), and click "Save Cost".
    4.  Verify the Google Calendar page's console logs "Content Script: Average cost updated from [old value] to 75".

---

### Phase 3: Core Logic - DOM Interaction (MVP Focus: Event Detail Pop-up)

*Disclaimer: Google Calendar's DOM structure can change frequently. The selectors provided below are examples and **must be verified and potentially updated by inspecting the live Google Calendar DOM at the time of implementation.** Developers (or the LLM) will need to find current, stable selectors based on visible text, ARIA roles, or unique class names/attributes.*

**Task 3.1: Identify and Select Main Event Detail Container using `MutationObserver`**
* **Goal**: Detect when an event detail pop-up appears on the Google Calendar page.
* **Start**: `calendar_integration.js` is active and can access `averageCostPerHour`.
* **Action**:
    1.  Modify `content_scripts/calendar_integration.js`:
        ```javascript
        // ... (all previous code)

        function observeCalendarChanges() {
          const targetNode = document.body;
          const config = { childList: true, subtree: true };

          const callback = function(mutationsList, observer) {
            for(const mutation of mutationsList) {
              if (mutation.type === 'childList') {
                // EXAMPLE SELECTOR - VERIFY AND UPDATE THIS SELECTOR
                // Look for a div that acts as a dialog for event details.
                // Common attributes: role="dialog", aria-modal="true", a specific jsname or class.
                const eventPopup = document.querySelector('div[role="dialog"][aria-modal="true"][data-calendar-id]');
                // Alternative example: document.querySelector('.your-gcal-popup-class');

                if (eventPopup && !eventPopup.dataset.costProcessed) {
                  console.log('Content Script: Event detail pop-up detected.', eventPopup);
                  eventPopup.dataset.costProcessed = 'true'; // Mark as processed to avoid re-processing
                  processMeetingDetails(eventPopup); // Defined in next task
                }
              }
            }
          };

          const observer = new MutationObserver(callback);
          observer.observe(targetNode, config);
          console.log('Content Script: MutationObserver started for calendar changes.');
        }

        // Call it after a short delay to give GCal time to initialize
        setTimeout(observeCalendarChanges, 2000);

        // Placeholder for the function to be defined in Task 3.2
        function processMeetingDetails(eventPopupElement) {
            console.log('Placeholder: processMeetingDetails called for', eventPopupElement);
        }
        ```
* **End**: The content script logs a message and the detected element when an event detail pop-up appears.
* **Test**:
    1.  Reload the extension and Google Calendar.
    2.  Click on any event in Google Calendar to open its detail pop-up.
    3.  Check the Google Calendar page's DevTools console for "Content Script: Event detail pop-up detected" and the logged HTML element.
    4.  Close the pop-up and click another event; ensure it's detected again. *(The `costProcessed` flag helps avoid processing the same popup multiple times if it's not removed from DOM immediately).*

**Task 3.2: Implement `processMeetingDetails` Function Stub and Extract Attendee Count (Simple)**
* **Goal**: Within the detected event pop-up, attempt to extract the number of attendees.
* **Start**: Event detail pop-up can be detected (Task 3.1). `averageCostPerHour` is available.
* **Action**:
    1.  Modify `processMeetingDetails` in `content_scripts/calendar_integration.js`:
        ```javascript
        // ... (MutationObserver and its call remain)

        function processMeetingDetails(eventPopupElement) {
          console.log('Processing meeting details for:', eventPopupElement);
          let attendeeCount = 1; // Default to 1 (organizer)

          // EXAMPLE SELECTOR for attendee count - VERIFY AND UPDATE
          // Look for text like "X guests", "Y attendees", or a list of guest elements.
          // Common selectors: elements with aria-label containing "guests" or specific class names.
          const guestInfoElements = eventPopupElement.querySelectorAll('span[aria-label*="guest"], div[aria-label*="guest list"] span'); // Combine potential selectors

          let guestTextFound = false;
          guestInfoElements.forEach(guestInfoElement => {
            if (guestTextFound) return;
            const text = guestInfoElement.textContent || "";
            const match = text.match(/(\d+)\s+(guest|attendee)/i); // "2 guests", "1 attendee"
            if (match && match[1]) {
              attendeeCount = parseInt(match[1], 10);
              // In GCal, "X guests" often means X guests + organizer. If the organizer is always separate, this might be just parseInt(match[1]).
              // For MVP, let's assume "X guests" means X other people, so total = X + 1 (organizer).
              // If the count already includes the organizer, then just parseInt(match[1]).
              // This needs to be verified by observation. Assuming +1 for organizer.
              attendeeCount +=1;
              guestTextFound = true;
            }
          });
          
          if (!guestTextFound) {
            // Fallback: count elements that represent individual attendees if no summary text found
            // EXAMPLE SELECTOR: 'div[role="listitem"][data-participant-id]'
            const individualAttendeeElements = eventPopupElement.querySelectorAll('div[data-email]'); // Example, if attendees have data-email attributes
            if (individualAttendeeElements && individualAttendeeElements.length > 0) {
                 attendeeCount = individualAttendeeElements.length; // This count usually includes the organizer
            } else {
                console.log("No explicit guest count text or individual attendee elements found, defaulting to 1 attendee (organizer). Inspect DOM for better selectors.");
            }
          }


          console.log('Content Script: Extracted Attendee Count (approx) -', attendeeCount);

          // const durationHours = extractDuration(eventPopupElement); // To be defined
          // console.log('Content Script: Extracted Duration (hours) -', durationHours);
          // if (durationHours > 0 && attendeeCount > 0 && averageCostPerHour > 0) {
          //   calculateAndDisplayCost(eventPopupElement, attendeeCount, durationHours); // To be defined
          // }
        }
        ```
* **End**: The content script attempts to parse an attendee count from the event pop-up and logs it.
* **Test**:
    1.  Reload the extension and Google Calendar.
    2.  Open an event detail pop-up for an event with a known number of guests (e.g., an event with "2 guests" listed, plus you as organizer).
    3.  Check the console for "Extracted Attendee Count (approx) - 3" (or the correct total including organizer).
    4.  Test with an event you created with no other guests; it should log 1.
    5.  *This step requires careful DOM inspection to find reliable selectors.*

**Task 3.3: Implement `extractDuration` Function (Simple Case)**
* **Goal**: Within the event pop-up, extract the meeting duration in hours.
* **Start**: `processMeetingDetails` is called. `attendeeCount` is extracted.
* **Action**:
    1.  Define `extractDuration` and call it from `processMeetingDetails` in `content_scripts/calendar_integration.js`:
        ```javascript
        // ... (Inside processMeetingDetails function, after logging attendeeCount)
          const durationHours = extractDuration(eventPopupElement);
          console.log('Content Script: Extracted Duration (hours) -', durationHours);
          // if (durationHours > 0 && attendeeCount > 0 && averageCostPerHour > 0) {
          //   calculateAndDisplayCost(eventPopupElement, attendeeCount, durationHours); // To be defined
          // }

        // New function
        function extractDuration(eventPopupElement) {
          // EXAMPLE SELECTOR for the time string - VERIFY AND UPDATE
          // Look for an element containing text like "3:00 PM – 4:00 PM" or "15:00 – 16:00".
          // Common selectors: elements with specific jsname, data-testid, or class.
          // e.g., eventPopupElement.querySelector('div[jsname="biKyF"]');
          const timeElement = eventPopupElement.querySelector('div[data-testid="event-details-time"], .AXMl2e .ky6s2b'); // Combine example selectors

          if (!timeElement) {
            console.warn("Content Script: Could not find time element for duration parsing.");
            return 0;
          }

          const timeString = (timeElement.textContent || "").trim();
          console.log("Content Script: Raw time string for duration:", timeString);

          if (timeString.toLowerCase().includes("all day")) {
            console.log("Content Script: All-day event detected, duration 0 for MVP cost.");
            return 0; // Or treat as 8 hours, but 0 for MVP simplicity
          }

          // Regex for formats like "3:00 – 4:00 PM", "3:00 PM – 4:00 PM", "15:00 – 16:00"
          // It attempts to capture start time, optional start AM/PM, end time, optional end AM/PM
          const timeRegex = /(\d{1,2}:\d{2})\s*(AM|PM)?\s*(?:–|-)\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i;
          const match = timeString.match(timeRegex);

          if (match) {
            let startTimeStr = match[1];
            const startAmPm = match[2] ? match[2].toUpperCase() : null;
            let endTimeStr = match[3];
            const endAmPm = match[4] ? match[4].toUpperCase() : null;

            const parseTimeToMinutes = (timeStr, amPmMarker) => {
              let [hours, minutes] = timeStr.split(':').map(Number);
              if (amPmMarker) {
                if (amPmMarker === 'PM' && hours < 12) hours += 12;
                if (amPmMarker === 'AM' && hours === 12) hours = 0; // Midnight is 00 hours
              }
              return hours * 60 + minutes;
            };

            // If only end AM/PM is specified, assume start is the same period or infer.
            // This simplified logic assumes if startAmPm is null, it might be 24h format or implied by endAmPm.
            // For more robustness, date context (from other DOM elements) would be needed.
            const startTotalMinutes = parseTimeToMinutes(startTimeStr, startAmPm);
            const endTotalMinutes = parseTimeToMinutes(endTimeStr, endAmPm || startAmPm); // Use startAmPm if endAmPm is missing but start had it
            
            let durationMinutes = endTotalMinutes - startTotalMinutes;
            if (durationMinutes < 0) { // Handles overnight events simply
              durationMinutes += 24 * 60;
            }
            return durationMinutes / 60; // Convert to hours
          }
          console.warn("Content Script: Could not parse time string for duration:", timeString);
          return 0;
        }
        ```
* **End**: The content script attempts to parse duration from the event pop-up and logs it in hours.
* **Test**:
    1.  Reload extension and Google Calendar.
    2.  Open event details for:
        * A 1-hour meeting (e.g., 3:00 PM - 4:00 PM). Console should log `1`.
        * A 30-minute meeting (e.g., 10:00 AM - 10:30 AM). Console should log `0.5`.
        * An "All day" event. Console should log `0`.
    3.  *This requires robust selectors and careful testing with different time formats.*

**Task 3.4: Implement `calculateAndDisplayCost` Function (Calculation Part)**
* **Goal**: Calculate the total meeting cost using extracted details and the average hourly rate.
* **Start**: `processMeetingDetails` calls `extractDuration`. `attendeeCount` and `durationHours` are available. `averageCostPerHour` is globally available in the script.
* **Action**:
    1.  Define `calculateAndDisplayCost` and update the call in `processMeetingDetails`:
        ```javascript
        // ... (Inside processMeetingDetails, after logging durationHours)
          if (durationHours > 0 && attendeeCount > 0 && averageCostPerHour > 0) {
            calculateAndDisplayCost(eventPopupElement, attendeeCount, durationHours);
          } else {
            console.log("Content Script: Skipping cost calculation due to missing data (duration/attendees/cost_rate).");
            // Clear any old cost display if conditions aren't met
            const oldCostDisplay = eventPopupElement.querySelector('.meeting-cost-display');
            if (oldCostDisplay) oldCostDisplay.remove();
          }

        // New function
        function calculateAndDisplayCost(eventPopupElement, attendees, durationHrs) {
          const totalCost = attendees * durationHrs * averageCostPerHour;
          console.log(`Content Script: Calculated Total Cost - $${totalCost.toFixed(2)} (Attendees: ${attendees}, Duration: ${durationHrs}hrs, Rate: $${averageCostPerHour}/hr)`);

          displayCostInUI(eventPopupElement, totalCost); // To be defined in next task
        }

        // Placeholder for the function to be defined in Task 3.5
        function displayCostInUI(eventPopupElement, cost) {
            console.log('Placeholder: displayCostInUI called with cost', cost);
        }
        ```
* **End**: The content script calculates and logs the total meeting cost.
* **Test**:
    1.  Reload extension and Google Calendar.
    2.  Ensure `averageCostPerHour` is set via popup (e.g., $50).
    3.  Open an event detail pop-up where attendees and duration can be reasonably parsed (e.g., 3 attendees, 1 hour duration).
    4.  Verify console logs: "Calculated Total Cost - $150.00 (Attendees: 3, Duration: 1hrs, Rate: $50/hr)" (or similar based on actual parsed values).

**Task 3.5: Implement `displayCostInUI` (Display Part of `calculateAndDisplayCost`)**
* **Goal**: Display the calculated cost within the event detail pop-up UI.
* **Start**: `totalCost` is calculated within `calculateAndDisplayCost`. `eventPopupElement` is available.
* **Action**:
    1.  Implement `displayCostInUI` (which is called from `calculateAndDisplayCost`):
        ```javascript
        // ... (calculateAndDisplayCost function remains)

        function displayCostInUI(eventPopupElement, cost) {
          const displayId = 'meeting-cost-display-extension'; // Unique ID for our element

          // Remove any old cost display first to prevent duplicates
          const oldCostDisplay = eventPopupElement.querySelector(`#${displayId}`);
          if (oldCostDisplay) {
            oldCostDisplay.remove();
          }

          const costDisplayElement = document.createElement('div');
          costDisplayElement.id = displayId;
          costDisplayElement.textContent = `Estimated Meeting Cost: $${cost.toFixed(2)}`;
          // Basic styling
          costDisplayElement.style.padding = '8px 0px';
          costDisplayElement.style.marginTop = '8px';
          costDisplayElement.style.borderTop = '1px solid #eee';
          costDisplayElement.style.fontSize = '13px';
          costDisplayElement.style.color = '#3c4043'; // Google's common text color
          costDisplayElement.style.fontWeight = '500';


          // EXAMPLE SELECTOR for where to insert - VERIFY AND UPDATE
          // Find a suitable container within the popup, e.g., a main content area or near other details.
          // Look for a div that groups event information.
          // Example: eventPopupElement.querySelector('.some-content-area-class') or after a specific known element.
          const detailsContainer = eventPopupElement.querySelector('div[jsname="cnQt1"]'); // Often a main content block in GCal popups
          // Alternative: const timeElement = eventPopupElement.querySelector('div[data-testid="event-details-time"]'); // Used before

          if (detailsContainer) {
             // Prepend or append. Appending might be safer if GCal often adds elements to the top.
             detailsContainer.appendChild(costDisplayElement);
             // Or, to insert after a specific known element like the time:
             // if (timeElement && timeElement.parentNode) {
             //   timeElement.parentNode.insertBefore(costDisplayElement, timeElement.nextSibling.nextSibling); // Add some space
             // } else { detailsContainer.appendChild(costDisplayElement); }
          } else {
             console.warn("Content Script: Could not find a specific container to display cost. Appending to popup root.");
             eventPopupElement.appendChild(costDisplayElement); // Fallback
          }
          console.log('Content Script: Cost displayed in UI.');
        }
        ```
* **End**: The calculated meeting cost is visible within the Google Calendar event detail pop-up.
* **Test**:
    1.  Reload extension and Google Calendar.
    2.  Set `averageCostPerHour` via popup.
    3.  Open an event detail pop-up for an event with parsable details.
    4.  Verify the "Estimated Meeting Cost: $X.YZ" message appears within the pop-up UI, in a reasonable location.
    5.  Ensure it doesn't duplicate if you close and reopen the *same* popup (the `costProcessed` flag and removing old display should handle this).

---

### Phase 4: Refinement & Integration (MVP Polish)

**Task 4.1: Trigger Recalculation on Cost Change for Visible Meeting**
* **Goal**: If an event pop-up is open and the user changes the average cost in the extension popup, the displayed cost in the event pop-up should update without needing to close/reopen the event.
* **Start**: Cost calculation and display logic exists. `chrome.storage.onChanged` listener exists.
* **Action**:
    1.  Modify the `chrome.storage.onChanged.addListener` in `content_scripts/calendar_integration.js`:
        ```javascript
        // ... (inside chrome.storage.onChanged.addListener)
          if (namespace === 'sync' && changes.averageCost) {
            const oldRate = averageCostPerHour;
            averageCostPerHour = changes.averageCost.newValue; // Update global rate
            console.log(`Content Script: Average cost updated globally from $${oldRate} to $${averageCostPerHour}`);

            // Attempt to find any visible and processed event popup to update it
            // EXAMPLE SELECTOR (same as in MutationObserver) - VERIFY AND UPDATE
            const visiblePopup = document.querySelector('div[role="dialog"][aria-modal="true"][data-calendar-id][data-cost-processed="true"]');
            // const visiblePopup = document.querySelector('.your-gcal-popup-class[data-cost-processed="true"]');

            if (visiblePopup) {
              console.log("Content Script: Visible event popup found, re-processing its details for cost update...");
              // Re-run the processing logic. It will use the new averageCostPerHour.
              // No need to reset data-cost-processed as we are just updating an already processed popup.
              processMeetingDetails(visiblePopup);
            }
          }
        // ...
        ```
    2.  Ensure `processMeetingDetails` correctly calls all sub-functions and that `displayCostInUI` removes any *old* cost display (by its ID) before adding the new one (already part of Task 3.5).
* **End**: Displayed cost in an open event pop-up updates dynamically when `averageCostPerHour` is changed.
* **Test**:
    1.  Reload extension and Google Calendar.
    2.  Open an event detail pop-up. Note the displayed cost.
    3.  Without closing the event pop-up, open the extension popup, change the average cost, and save it.
    4.  Verify the "Estimated Meeting Cost" in the event pop-up updates to reflect the new calculation.

**Task 4.2: Basic Error Handling and Edge Case Refinements**
* **Goal**: Make the script more resilient to minor DOM variations or missing data during parsing.
* **Start**: Core functionality is in place.
* **Action**:
    1.  In `processMeetingDetails`, `extractDuration`, and `extractAttendeeCount` (if made separate), wrap DOM-parsing sections that access properties like `.textContent` or attempt parsing in `try-catch` blocks or add more robust checks for element existence (e.g., `if (element) { ... }`).
        ```javascript
        // Example for a DOM access in extractDuration:
        // try {
        //   const timeString = (timeElement.textContent || "").trim();
        //   // ... rest of parsing ...
        // } catch (e) {
        //   console.error("Error parsing duration:", e, timeElement);
        //   return 0; // Fallback
        // }
        ```
    2.  Ensure that if `averageCostPerHour` is not set or is zero, `calculateAndDisplayCost` either displays "$0.00" or removes/hides the cost display area rather than showing an error or `NaN`. The `if` condition in `processMeetingDetails` (Task 3.4) already helps with this.
* **End**: The extension fails more gracefully or avoids displaying costs if essential data cannot be reliably parsed or is missing.
* **Test**:
    1.  Try with events that might have unusual structures or missing time/attendee info if GCal allows.
    2.  If possible, manually (via DevTools) temporarily remove an element the script expects, then trigger the event pop-up to see if it logs an error gracefully instead of breaking the script.
    3.  Set average cost to 0 or a non-numeric value in the popup; verify the popup handles invalid input and the content script behaves predictably (e.g., shows $0.00 or no cost).

**Task 4.3: Add Final Icons and Review Manifest**
* **Goal**: Ensure the extension has its proper branding and manifest details are complete for MVP.
* **Start**: Placeholder icons are used. Manifest is functional.
* **Action**:
    1.  Replace placeholder `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder with the actual desired icons. (Ensure an `icon32.png` is also considered if needed by Chrome's UI).
    2.  Review `manifest.json`. Consider updating `version` to "1.0.0" for an MVP release. Add optional fields like `author` if desired.
        ```json
        // In manifest.json
        // "version": "1.0.0",
        // "author": "Your Name/Company",
        ```
* **End**: The extension displays the final icons and has a reviewed manifest.
* **Test**:
    1.  Reload the extension.
    2.  Verify the new icons appear correctly in the Chrome toolbar and on the `chrome://extensions` page.
    3.  Confirm all previously tested functionality remains unchanged.

---
This MVP plan focuses on the core user flow. Further enhancements like supporting different calendar views, more complex attendee parsing, or custom costs per meeting would be subsequent iterations.
