document.addEventListener('DOMContentLoaded', function () {
  const costInput = document.getElementById('costInput');
  const saveButton = document.getElementById('saveButton');

  saveButton.addEventListener('click', function () {
    const costStr = costInput.value; // Get value as string
    if (costStr !== "" && !isNaN(parseFloat(costStr)) && parseFloat(costStr) >= 0) {
      const costNum = parseFloat(costStr);
      chrome.storage.sync.set({ averageCost: costNum }, function () {
        console.log('Average cost saved:', costNum);
        saveButton.textContent = 'Saved!';
        // Optional: brief visual feedback for invalid input (clear previous errors)
        costInput.style.borderColor = ''; 
        setTimeout(() => { saveButton.textContent = 'Save Cost'; }, 1000);
      });
    } else {
      console.error('Invalid cost input: must be a non-negative number.');
      // Optional: Visual feedback for invalid input
      costInput.style.borderColor = 'red';
      saveButton.textContent = 'Save Cost'; // Reset button text if it was 'Saved!'
      // Remove red border after a delay
      setTimeout(() => { costInput.style.borderColor = ''; }, 2000);
    }
  });
});
