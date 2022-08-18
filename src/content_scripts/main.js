import browser from "webextension-polyfill";

import messageTypes from "../common/messageTypes";

/**
 * Handler for messages sent by background script
 * @param {{ op: number, text: string }} request
 * @returns {string|undefined} the selected text from screen
 */
async function handleMessage(request) {
  /**
   * Returns the active DOM element if it is input or textarea
   * @returns {Element|undefined} DOM element
   */
  function getActiveElement() {
    const activeElement = document.activeElement;
    const activeElemTagName = activeElement
      ? activeElement.tagName.toLowerCase()
      : "";
    return activeElemTagName === "textarea" || activeElemTagName === "input"
      ? activeElement
      : undefined;
  }

  /**
   * Select text from active element in DOM
   * @returns {String}
   */
  function copy() {
    const ae = getActiveElement();
    if (ae === undefined) return window.getSelection().toString();

    const startPos = ae.selectionStart;
    const endPos = ae.selectionEnd;
    return startPos === endPos
      ? ae.value
      : ae.value.substring(startPos, endPos);
  }

  /**
   * Paste text to active element in DOM
   * @param {String} text
   * @returns {undefined}
   */
  function paste(text) {
    const ae = getActiveElement();
    if (ae === undefined) return;

    // TODO: reset selection after paste?
    const startPos = ae.selectionStart;
    const endPos = ae.selectionEnd;

    const effectiveText =
      ae.value.substring(0, startPos) + text + ae.value.substring(endPos);

    ae.value = effectiveText;

    const event = new Event("change", { bubbles: true });
    ae.dispatchEvent(event);
  }

  const { op, text } = request;
  if (op === messageTypes.COPY_FROM_PAGE) {
    return copy();
  } else if (op === messageTypes.PASTE_TO_PAGE) {
    return paste(text);
  }
}

/* return value of this handler is sent back to the sender of the message */
browser.runtime.onMessage.addListener(handleMessage);
