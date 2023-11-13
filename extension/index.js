/* eslint-disable */
const button = document.getElementById('decompress'); 
button.addEventListener('click', () => {
 chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
 const activeTab = tabs[0];
 console.log(tabs);
 chrome.tabs.sendMessage(activeTab.id, { action: 'setLocalStorage', data: { key: 'decompress', value: 'true' } });
});
const clearButton = document.getElementById('clear'); 
clearButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    console.log(tabs);
    chrome.tabs.sendMessage(activeTab.id, { action: 'clear', data: { } });
   });

});