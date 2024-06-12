import browser from "webextension-polyfill";

import commands from "../common/commands";
import messageTypes from "../common/messageTypes";

/**
 * @type Record<string, {label: string, text: string, order: number, quickSlotNumber: number|undefined}>
 */
let copyFields = {};

/**
 * Load data from storage to copyFields object
 * Called only once at startup
 * @returns {Promise<undefined>}
 */
async function loadData() {
  const { extData } = await browser.storage.sync.get();
  if (extData && extData.version === 3) {
    copyFields = extData.copyFields;
  } else if (extData && extData.version === 2) {
    Object.entries(extData.copyFields).forEach((entry, index) => {
      copyFields[entry[0]] = { ...entry[1], order: index };
    });
  }
}

loadData();

/**
 * Write copy data to webextension storage and update browser_action
 * @returns {Promise<undefined>}
 */
function updateStorage() {
  return browser.storage.sync.set({ extData: { version: 3, copyFields } });
}

/**
 * Handle commands (shortcut keys)
 * @param {string} cmd
 * @returns {Promise<undefined>}
 */
async function handleCommand(cmd) {
  /**
   * Get active browser tab
   * @returns {Promise<browser.Tabs.Tab}
   */
  async function getActiveTab() {
    // ideally an array of length 1
    const allActiveTabs = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });

    if (allActiveTabs.length === 0) throw new Error("no active tab");
    return allActiveTabs[0];
  }

  /**
   * Show a badge on the browser toolbar button with the provided text
   * @param {string} text
   * @returns {Promise<undefined>}
   */
  async function showBadgeForTab(text) {
    try {
      const activeTab = await getActiveTab();
      await browser.action.setBadgeText({ text, tabId: activeTab.id });
      await browser.action.setBadgeBackgroundColor({
        color: "#EA6A00",
        tabId,
      });

      setTimeout(() => {
        browser.action
          .setBadgeText({ text: "", tabId: activeTab.id })
          .catch(() => {});
      }, 2000);
    } catch (err) {
      // do not propogate errors
    }
  }

  /**
   * Copy text from DOM into quick slot
   * @returns {Promise<string>} badge text to show on browser action
   */
  async function copy() {
    const activeTab = await getActiveTab();
    const copiedText = await browser.tabs.sendMessage(activeTab.id, {
      op: messageTypes.COPY_FROM_PAGE,
    });
    if (copiedText.length < 1) throw new Error("nothing copied");

    const quickSlotNumber = Number(cmd.split("-")[1]);
    const existingQuickSlot = Object.entries(copyFields).find(
      ([_, val]) => val.quickSlotNumber === quickSlotNumber
    );

    if (existingQuickSlot === undefined) {
      const identifier = Math.random().toString().substring(2);
      copyFields[identifier] = {
        text: copiedText,
        label: `Quick slot ${quickSlotNumber}`,
        quickSlotNumber,
      };
    } else {
      const identifier = existingQuickSlot[0];
      copyFields[identifier].text = copiedText;
    }

    await updateStorage();
    return "CCC";
  }

  /**
   * Paste text from quick slot to DOM
   * @returns {Promise<String>} badge text to show on browser action
   */
  async function paste() {
    const quickSlotNumber = Number(cmd.split("-")[1]);
    const quickSlot = Object.values(copyFields).find(
      (val) => val.quickSlotNumber === quickSlotNumber
    );

    if (quickSlot === undefined) throw new Error("quick slot empty");

    const activeTab = await getActiveTab();
    await browser.tabs.sendMessage(activeTab.id, {
      op: messageTypes.PASTE_TO_PAGE,
      text: quickSlot.text,
    });
    return "VVV";
  }

  const copyCommands = [
    commands.COPY_1,
    commands.COPY_2,
    commands.COPY_3,
    commands.COPY_4,
    commands.COPY_5,
    commands.COPY_6,
    commands.COPY_7,
    commands.COPY_8,
    commands.COPY_9,
  ];
  const pasteComamnds = [
    commands.PASTE_1,
    commands.PASTE_2,
    commands.PASTE_3,
    commands.PASTE_4,
    commands.PASTE_5,
    commands.PASTE_6,
    commands.PASTE_7,
    commands.PASTE_8,
    commands.PASTE_9,
  ];

  const p = copyCommands.includes(cmd)
    ? copy()
    : pasteComamnds.includes(cmd)
    ? paste()
    : Promise.reject(new Error("unknown command"));

  const badgeText = await p.catch((err) => {throw err});
  showBadgeForTab(badgeText);
}

/**
 * Handle messages from browser_action
 * @param {{op: string, text: string|undefined, label: string|undefined, fieldId: string| undefined}} msg
 * @returns {Promise<object>}
 */
async function handleMessage(msg) {
  /**
   * @returns {Promise<object>}
   */
  function getAll() {
    return Promise.resolve({ payload: copyFields });
  }

  /**
   * @param {string} fieldId id of copyField to delete
   * @returns {Promise<undefined>}
   */
  function deleteById(fieldId) {
    delete copyFields[fieldId];
    return updateStorage();
  }

  /**
   * @param {string|undefined} fieldId id of copyField to update (undefined for insert)
   * @param {string} label
   * @param {string} text
   * @returns {Promise<undefined>}
   */
  function upsert(fieldId, label, text) {
    const effectiveFieldId = fieldId || Math.random().toString().substring(2);
    if (copyFields[effectiveFieldId] === undefined)
      copyFields[effectiveFieldId] = {
        createdAt: new Date().valueOf(),
      };
    copyFields[effectiveFieldId].label = label;
    copyFields[effectiveFieldId].text = text;
    // TODO: add order
    return updateStorage();
  }

  /**
   * Convert an ordinary copyField into a quick slot (or reverse)
   * @param {string} fieldId id of copyField
   * @returns {Promise<undefined>}
   */
  function makeQuick(fieldId) {
    if (copyFields[fieldId].quickSlotNumber !== undefined) {
      // remove field from quick slots
      delete copyFields[fieldId].quickSlotNumber;
    } else {
      // add field to quick slots
      const usedQuickSlots = new Set();
      Object.values(copyFields).forEach((val) => {
        if (val.quickSlotNumber !== undefined) {
          usedQuickSlots.add(val.quickSlotNumber);
        }
      });
      const nextAvailableQuickSlotNumber = [5, 4, 3, 2, 1].reduce(
        (acc, curVal) => {
          if (usedQuickSlots.has(curVal)) return acc;
          else return curVal;
        },
        undefined
      );
      if (nextAvailableQuickSlotNumber !== undefined) {
        copyFields[fieldId].quickSlotNumber = nextAvailableQuickSlotNumber;
      }
    }
    return updateStorage();
  }

  const { op, text, label, fieldId } = msg;

  let p;
  if (op === messageTypes.EDIT_FROM_POPUP) {
    p = upsert(fieldId, label, text);
  } else if (op === messageTypes.DELETE_FROM_POPUP) {
    p = deleteById(fieldId);
  } else if (op === messageTypes.REQUEST_CURRENT_COPYFIELDS) {
    p = getAll();
  } else if (op === messageTypes.MAKE_QUICK) {
    p = makeQuick(fieldId);
  } else {
    p = Promise.reject(new Error("unknown message"));
  }

  return p;
}

browser.runtime.onMessage.addListener(handleMessage);
browser.commands.onCommand.addListener(handleCommand);
