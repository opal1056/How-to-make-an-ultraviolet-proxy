const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const wispInput = document.getElementById("wispInput");
const bareInput = document.getElementById("bareInput");
const switcher = document.getElementById("switcher");
const searchEngineSelector = document.getElementById("searchEngineSelector");
const openModeSelector = document.getElementById("openModeSelector");

// Define search engine URLs
const searchEngines = {
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q=",
    yahoo: "https://search.yahoo.com/search?p=",
    duckduckgo: "https://duckduckgo.com/?q=",
    ecosia: "https://www.ecosia.org/search?q="
};

// Initialize URL fields and settings
function updateSettings() {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const wispUrl = `${protocol}://${location.host}/wisp/`;
    const bareUrl = `${protocol === "wss" ? "https" : "http"}://${location.host}/bare/`;

    wispInput.value = localStorage.getItem("wispUrl") || wispUrl;
    bareInput.value = localStorage.getItem("bareUrl") || bareUrl;
    searchEngineSelector.value = localStorage.getItem("searchEngine") || "google"; // Default search engine
    openModeSelector.value = localStorage.getItem("openMode") || "iframe"; // Default open mode
}

// Handle switcher changes
switcher.onchange = async function (event) {
    const selectedValue = event.target.value;

    // Save the current values to localStorage
    localStorage.setItem("wispUrl", wispInput.value);
    localStorage.setItem("bareUrl", bareInput.value);

    switch (selectedValue) {
        case "epoxy":
            await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispInput.value }]);
            break;
        case "bare":
            await connection.setTransport("/baremod/index.mjs", [bareInput.value]);
            break;
        case "libcurl":
            await connection.setTransport("/libcurl/index.mjs", [{ wisp: wispInput.value }]);
            break;
    }
};

// Handle search engine selector changes
searchEngineSelector.onchange = function () {
    localStorage.setItem("searchEngine", searchEngineSelector.value);
};

// Handle open mode selector changes
openModeSelector.onchange = function () {
    localStorage.setItem("openMode", openModeSelector.value);
};

// Function to generate search URL based on selected engine
function getSearchUrl(query) {
    const selectedEngine = searchEngineSelector.value;
    return searchEngines[selectedEngine] + encodeURIComponent(query);
}

// Function to handle opening of URLs based on selected mode
function openUrl(url) {
    const openMode = localStorage.getItem("openMode") || "iframe";
    
    if (openMode === "iframe") {
        document.getElementById("iframeWindow").src = __uv$config.prefix + __uv$config.encodeUrl(url);
    } else if (openMode === "newTab") {
        window.open(__uv$config.prefix + __uv$config.encodeUrl(url), "_blank");
    } else if (openMode === "blankTab") {
        const blankWindow = window.open("about:blank", "_blank");
        blankWindow.document.open();
        blankWindow.document.write(`<html><body style="margin:0;overflow:hidden"><iframe src="${__uv$config.prefix + __uv$config.encodeUrl(url)}" style="border:none;width:100vw;height:100vh;overflow:hidden"></iframe></body></html>`);
        blankWindow.document.close();
    }
}

// Initialize on page load
window.onload = function() {
    updateSettings();
    // Set the default transport
    connection.setTransport("/epoxy/index.mjs", [{ wisp: wispInput.value }]);
};
