/**
 * enum for operation identificaton in messages sent between content script, browser action and background script
 */

const messageTypes = Object.freeze({
  // for content script
  COPY_FROM_PAGE: 1,
  PASTE_TO_PAGE: 2,

  // for browser action
  REQUEST_CURRENT_COPYFIELDS: 4,
  RESPONSE_CURRENT_COPYFIELDS: 5,
  DELETE_FROM_POPUP: 6,
  EDIT_FROM_POPUP: 7,
  COPY_FROM_POPUP: 8,
  MAKE_QUICK: 9,
});

export default messageTypes;
