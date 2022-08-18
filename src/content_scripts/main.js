/**
 * content scripts run in the context of a webpage
 *   separate instances are executed in each tab
 *
 * content scripts can
 *   access DOM of web page
 *   access some webextension apis
 *
 * this content script will handle messages sent by the background script
 *   and perform actions when user executes a command (shortcut keys)
 */

import browser from "webextension-polyfill";

import messageTypes from "../common/messageTypes";

// handle messages sent by background script
async function handleMessage(request) {
  const { op, text } = request;

  /* return value of this handler is sent back to the sender of the message */
  if (op === messageTypes.COPY_FROM_PAGE) {
    const activeElement = document.activeElement;
    const activeElemTagName = activeElement
      ? activeElement.tagName.toLowerCase()
      : null;
    if (activeElemTagName === "textarea" || activeElemTagName === "input") {
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;

      if (startPos === endPos) {
        return activeElement.value;
      }
      return activeElement.value.substring(startPos, endPos);
    }
    return window.getSelection().toString();
  }

  if (op === messageTypes.PASTE_TO_PAGE) {
    const activeElement = document.activeElement;
    const activeElemTagName = activeElement
      ? activeElement.tagName.toLowerCase()
      : null;
    if (activeElemTagName === "textarea" || activeElemTagName === "input") {
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;

      const effectiveText =
        activeElement.value.substring(0, startPos) +
        text +
        activeElement.value.substring(endPos);

      activeElement.value = effectiveText;

      const event = new Event("change", { bubbles: true });
      activeElement.dispatchEvent(event);
    }
  }
}

browser.runtime.onMessage.addListener(handleMessage);
