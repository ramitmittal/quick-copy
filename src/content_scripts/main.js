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

/**
 * Handler for messages sent by background script
 * @param {{ op: number, text: string }} request
 * @returns {string|undefined} the selected text from screen
 */
async function handleMessage(request) {
  const { op, text } = request;

  if (op === messageTypes.COPY_FROM_PAGE) {
    const activeElement = document.activeElement;
    const activeElemTagName = activeElement
      ? activeElement.tagName.toLowerCase()
      : null;
    if (activeElemTagName === "textarea" || activeElemTagName === "input") {
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;

      return startPos === endPos
        ? activeElement.value
        : activeElement.value.substring(startPos, endPos);
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

/* return value of this handler is sent back to the sender of the message */
browser.runtime.onMessage.addListener(handleMessage);
