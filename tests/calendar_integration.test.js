/** @jest-environment jsdom */

let loadAverageCost;
let processMeetingDetails;
let duplicateGuestInfo;
let observeCalendarChanges;
let _getInternalState;

describe('calendar_integration', () => {
  beforeEach(() => {
    global.chrome = {
      storage: { sync: { get: jest.fn(), set: jest.fn() } },
      runtime: {},
    };
    jest.resetModules();
    ({
      loadAverageCost,
      processMeetingDetails,
      duplicateGuestInfo,
      observeCalendarChanges,
      _getInternalState,
    } = require('../meeting_cost_calculator/content_scripts/calendar_integration'));
  });

  test('loadAverageCost sets value from storage', () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => cb({ averageCost: 5 }));
    loadAverageCost();
    expect(_getInternalState().averageCostPerHour).toBe(5);
  });

  test('loadAverageCost handles error', () => {
    chrome.runtime.lastError = { message: 'fail' };
    chrome.storage.sync.get.mockImplementation((keys, cb) => cb({ averageCost: 7 }));
    loadAverageCost();
    expect(_getInternalState().averageCostPerHour).not.toBe(7);
  });

  test('duplicateGuestInfo clones div', () => {
    document.body.innerHTML = '<div id="xDetDlgAtt"><div class="bgOWSb">info</div></div>';
    const nodeList = document.querySelectorAll('#xDetDlgAtt');
    nodeList[0].innerText = nodeList[0].textContent;
    duplicateGuestInfo(nodeList);
    const container = document.querySelector('#xDetDlgAtt');
    expect(container.querySelectorAll('.bgOWSb').length).toBe(2);
  });

  test('processMeetingDetails calculates meeting cost', () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => cb({ averageCost: 3 }));
    loadAverageCost();
    document.body.innerHTML = '<div id="xDetDlgAtt"><div class="bgOWSb">2 guests</div></div>';
    const nodeList = document.querySelectorAll('#xDetDlgAtt');
    nodeList[0].innerText = nodeList[0].textContent;
    processMeetingDetails(nodeList);
    expect(_getInternalState().meetingCost).toBe(6);
  });

  test('observeCalendarChanges sets up observer', () => {
    const observe = jest.fn();
    global.MutationObserver = class {
      constructor(cb) { this.cb = cb; }
      observe = observe;
    };
    observeCalendarChanges();
    expect(observe).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
  });
});
