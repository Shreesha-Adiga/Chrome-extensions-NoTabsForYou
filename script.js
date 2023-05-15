updateWebsiteList();
updateToggleButton();

document.getElementById("addWebsiteButton").addEventListener("click", addWebsite);
document.getElementById("toggleButton").addEventListener("click", toggleExtension);

function addWebsite() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        const website = url.hostname;
        chrome.runtime.sendMessage({ action: "addWebsite", website }, updateWebsiteList);
    });
}

function toggleExtension() {
    chrome.runtime.sendMessage({ action: "toggleExtension" }, (response) => {
        updateToggleButton();
    });
}

function updateToggleButton() {
    chrome.storage.local.get("extensionEnabled", (data) => {
        const extensionEnabled = data.extensionEnabled;
        const toggleButton = document.getElementById("toggleButton");
        if (extensionEnabled) {
            toggleButton.textContent = "Disable Extension";
            toggleButton.classList.remove("disabled");
            toggleButton.classList.add("enabled");
        } else {
            toggleButton.textContent = "Enable Extension";
            toggleButton.classList.remove("enabled");
            toggleButton.classList.add("disabled");
        }
    });
}

function updateWebsiteList() {
    chrome.storage.local.get("websites", (data) => {
        const websites = data.websites || [];
        const websiteList = document.getElementById("websiteList");
        websiteList.innerHTML = "";
        for (const website of websites) {
            const li = document.createElement("li");
            li.textContent = website;
            const removeButton = document.createElement("button");
            removeButton.textContent = "x";
            removeButton.addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "removeWebsite", website }, updateWebsiteList);
            });
            li.appendChild(removeButton);
            websiteList.appendChild(li);
        }
    });
}
