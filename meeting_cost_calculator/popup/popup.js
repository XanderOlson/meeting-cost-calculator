document.addEventListener('DOMContentLoaded', function () {
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

  // Event listener for the save button (existing code from Task 1.3)
  saveButton.addEventListener('click', function () {
    const costStr = costInput.value; 
    if (costStr !== "" && !isNaN(parseFloat(costStr)) && parseFloat(costStr) >= 0) {
      const costNum = parseFloat(costStr);
      chrome.storage.sync.set({ averageCost: costNum }, function () {
        console.log('Average cost saved:', costNum);
        saveButton.textContent = 'Saved!';
        costInput.style.borderColor = ''; 
        setTimeout(() => { saveButton.textContent = 'Save Cost'; }, 1000);
      });
    } else {
      console.error('Invalid cost input: must be a non-negative number.');
      costInput.style.borderColor = 'red';
      saveButton.textContent = 'Save Cost'; 
      setTimeout(() => { costInput.style.borderColor = ''; }, 2000);
    }
  });
});
