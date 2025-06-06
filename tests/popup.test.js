/** @jest-environment jsdom */
beforeEach(() => {
  document.body.innerHTML = `
    <input id="costInput" type="number" />
    <button id="saveButton">Save Cost</button>
  `;

  global.chrome = {
    storage: {
      sync: {
        get: jest.fn((keys, cb) => cb({ averageCost: 10 })),
        set: jest.fn((obj, cb) => cb && cb()),
      },
    },
  };

  // require the script after setting up globals
  require('../meeting_cost_calculator/popup/popup.js');

  // dispatch DOMContentLoaded to trigger listener
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

test('loads saved cost on startup', () => {
  const input = document.getElementById('costInput');
  expect(input.value).toBe('10');
});

test('saves valid cost on click', () => {
  const input = document.getElementById('costInput');
  const button = document.getElementById('saveButton');
  input.value = '15';
  button.click();
  expect(chrome.storage.sync.set).toHaveBeenCalledWith({ averageCost: 15 }, expect.any(Function));
});

test('handles invalid input', () => {
  const input = document.getElementById('costInput');
  const button = document.getElementById('saveButton');
  input.value = '-1';
  button.click();
  expect(chrome.storage.sync.set).not.toHaveBeenCalled();
  expect(input.style.borderColor).toBe('red');
});
