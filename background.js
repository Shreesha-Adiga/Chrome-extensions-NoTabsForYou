let websites = [];

chrome.storage.local.get(["websites", "extensionEnabled"], (data) => {
    websites = data.websites || [];
    extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
    checkCurrentWebsite();
});

let preventNewTabs = false;
let extensionEnabled = true;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addWebsite") {
        const website = message.website;
        if (website && !websites.includes(website)) {
            websites.push(website);
            chrome.storage.local.set({ websites });
        }
    } else if (message.action === "removeWebsite") {
        const website = message.website;
        websites = websites.filter(w => w !== website);
        chrome.storage.local.set({ websites });
    } else if (message.action === "toggleExtension") {
        extensionEnabled = !extensionEnabled;
        chrome.storage.local.set({ extensionEnabled });
        sendResponse({ extensionEnabled });
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    if (preventNewTabs && extensionEnabled) {
        chrome.tabs.remove(tab.id);
    }
});

function checkCurrentWebsite() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        const website = url.hostname;
        if (websites.includes(website)) {
            if (extensionEnabled) {
                chrome.action.setIcon({ path: 'logo_active.png' });
            }
            preventNewTabs = true;
        } else {
            preventNewTabs = false;
            chrome.action.setIcon({ path: 'logo_inactive.png' });
        }
    });
}

chrome.tabs.onActivated.addListener(checkCurrentWebsite);
chrome.windows.onFocusChanged.addListener(checkCurrentWebsite);
chrome.runtime.onStartup.addListener(checkCurrentWebsite);