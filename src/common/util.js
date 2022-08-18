import browser from "webextension-polyfill";

/**
 * Show a badge on the browser toolbar button with the provided text
 * @param {string} text
 * @param {object} tabId
 */
export async function showBadgeForTab(text, tabId) {
  browser.browserAction.setBadgeText({ text, tabId });
  browser.browserAction.setBadgeBackgroundColor({ color: "#EA6A00", tabId });

  try {
    browser.browserAction.setBadgeTextColor({ color: "#FFFFFF", tabId });
  } catch (err) {
    // this method is not available on chrome
  }

  setTimeout(() => {
    browser.browserAction.setBadgeText({ text: "", tabId });
  }, 2000);
}
