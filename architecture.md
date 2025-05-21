# Meeting Cost Calculator Chrome Extension Architecture

This document outlines the architecture for a Chrome extension designed to display the calculated cost of meetings within the Google Calendar interface. The extension allows users to input an average hourly cost per person, which is then used to estimate meeting costs based on attendee count and duration.

## 🏛️ Core Architecture

The extension follows a standard Chrome extension structure, leveraging content scripts for DOM manipulation, a popup for user interaction, and Chrome storage for persisting user settings.

### 📁 File and Folder Structure
meeting_cost_calculator/
├── manifest.json
├── content_scripts/
│   └── calendar_integration.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── icons/
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png

### 🧩 Component Responsibilities

#### 1. `manifest.json`
   * **Purpose**: The primary configuration file for the extension, providing essential metadata to the Chrome browser.
   * **Key Contents**:
        * `manifest_version`: Specifies the manifest file format version (e.g., 3).
        * `name`: The official name of the extension (e.g., "Google Calendar Meeting Cost Calculator").
        * `version`: The current version of the extension (e.g., "1.0.0").
        * `description`: A concise summary of the extension's functionality.
        * `permissions`:
            * `storage`: Required to save and retrieve the user-defined average cost per person.
        * `host_permissions`:
            * `*://calendar.google.com/*`: Grants permission for the content script to access and modify Google Calendar pages.
        * `action`: Defines the properties of the extension's icon in the Chrome toolbar and its associated popup.
            * `default_popup`: "popup/popup.html"
            * `default_icon`: Specifies paths to various icon sizes located in the `icons/` directory.
        * `content_scripts`: Configures scripts to be automatically injected into specified web pages.
            * `matches`: An array specifying URL patterns where the content script should run, primarily `["*://calendar.google.com/*"]`.
            * `js`: An array of JavaScript files to inject, e.g., `["content_scripts/calendar_integration.js"]`.
            * `run_at`: Defines when the script should be injected, typically `document_idle` to ensure the page DOM is mostly loaded.
        * `icons`: Specifies paths for various icon sizes used by the browser (e.g., for the extensions management page).

#### 2. `content_scripts/calendar_integration.js`
   * **Purpose**: This script is injected directly into Google Calendar pages. It is responsible for interacting with the calendar's Document Object Model (DOM) to identify meeting details, calculate costs, and display this information within the existing Google Calendar UI.
   * **Key Functions**:
        * **Retrieve Average Cost**: Fetches the stored average hourly cost per person from `chrome.storage.sync` upon loading and when changes occur.
        * **DOM Observation**: Implements `MutationObserver` to monitor the Google Calendar DOM for dynamic changes, such as the opening of event details pop-ups or updates to agenda views. This is critical for reacting to user interactions and content loading dynamically within the single-page application.
        * **Extract Meeting Details**:
            * Parses the DOM to identify and extract the number of attendees for a meeting.
            * Parses the DOM to find meeting start and end times, then calculates the duration in hours.
            * *Note*: DOM selectors for Google Calendar elements can be complex and are subject to change if Google updates its UI. This part requires careful implementation and may need periodic updates.
        * **Calculate Cost**: Computes the meeting cost using the formula: `Cost = Number of Attendees * Duration (in hours) * Average Cost per Person per Hour`.
        * **Display Cost**: Modifies the DOM to inject the calculated cost into an appropriate and visible location within the meeting's displayed information in the Google Calendar UI.
        * **Listen for Storage Changes**: Subscribes to `chrome.storage.onChanged` events. If the average cost is updated via the popup, this script detects the change, retrieves the new cost, and recalculates/redisplays costs for any relevant meetings currently visible on the page.

#### 3. `popup/popup.html`
   * **Purpose**: Defines the HTML structure for the user interface that appears when the extension's icon in the Chrome toolbar is clicked.
   * **Key Contents**:
        * An input field (e.g., `<input type="number">`) allowing the user to enter the average hourly cost per person.
        * A button (e.g., `<button id="saveButton">Save Cost</button>`) to trigger the saving of the entered cost.
        * Optionally, a display area to show the currently saved cost.
        * Links to `popup.css` for styling and `popup.js` for its interactive logic.

#### 4. `popup/popup.js`
   * **Purpose**: Contains the JavaScript logic that powers `popup.html`.
   * **Key Functions**:
        * **Event Handling**: Attaches an event listener to the "Save Cost" button.
        * **Save Cost**: Upon a click of the save button, it retrieves the value from the cost input field and persists it using `chrome.storage.sync.set({ averageCost: costValue }, callbackFunction)`.
        * **Load and Display Current Cost**: When the popup is opened, it retrieves the currently stored average cost from `chrome.storage.sync.get('averageCost', (data) => { ... })` and populates the input field, allowing the user to see and modify the current setting.

#### 5. `popup/popup.css`
   * **Purpose**: Contains CSS rules to style the elements in `popup.html`, ensuring a clean and user-friendly interface for setting the meeting cost.

#### 6. `icons/` Folder
   * **Purpose**: This directory stores various sizes of the extension's icon (e.g., `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`). These icons are referenced in `manifest.json` and used by Chrome in the toolbar, extensions management page, and potentially other UI surfaces.

---

### 💾 State Management

* **Average Hourly Cost Per Person**: The primary piece of application state is the average hourly cost per person.
    * This state is persisted using **`chrome.storage.sync`**.
    * **Rationale for `chrome.storage.sync`**: This API allows the setting to be automatically synchronized by Chrome across all browsers where the user is signed in with their Google account and has extension synchronization enabled. This provides a consistent experience across devices. If synchronization is not desired, `chrome.storage.local` could be used for purely local storage on the user's machine.

---

### 🔗 Service Connections and Data Flow

Communication between the extension's components is primarily facilitated by `chrome.storage` and standard DOM events/manipulation.

1.  **User Input (Popup) to Chrome Storage**:
    * The user interacts with `popup.html`.
    * Upon entering a cost and clicking "Save", `popup.js` captures this input.
    * `popup.js` calls `chrome.storage.sync.set()` to store the `averageCost` value.

2.  **Chrome Storage to Content Script (`calendar_integration.js`)**:
    * **Initial Load**: When `calendar_integration.js` is first injected into a Google Calendar page, it uses `chrome.storage.sync.get()` to fetch the currently saved `averageCost`.
    * **Dynamic Updates via Listener**: `calendar_integration.js` registers a listener using `chrome.storage.onChanged.addListener()`. When `averageCost` is modified in `chrome.storage.sync` (e.g., by the popup), this listener is triggered. The content script then retrieves the updated cost and refreshes the displayed meeting costs on the page accordingly.

3.  **Content Script (`calendar_integration.js`) to Google Calendar Page (DOM)**:
    * `calendar_integration.js` directly interacts with the web page's DOM.
    * It employs standard DOM manipulation methods (`document.querySelector()`, `document.querySelectorAll()`, `element.appendChild()`, `element.textContent`, etc.) to:
        * Read meeting details (attendees, duration).
        * Insert the calculated cost into relevant parts of the Google Calendar interface.

4.  **Optional: Popup to Content Script (Direct Messaging)**
    * While not essential for the primary functionality of setting and using the cost (which `chrome.storage` handles well), direct messaging could be used for more immediate commands if future features require it (e.g., a "force re-scan" button in the popup).
        * `popup.js` could use `chrome.tabs.sendMessage()`.
        * `calendar_integration.js` would listen using `chrome.runtime.onMessage.addListener()`.
    * For the current scope, relying on `chrome.storage.onChanged` for reactivity is simpler and sufficient.

---
