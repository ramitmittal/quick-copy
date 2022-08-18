import browser from "webextension-polyfill";

export const EXTENSION_DATA_VERSION = 2;

export async function migrate(currentData) {
  const newExtData = { version: EXTENSION_DATA_VERSION, copyFields: {} };

  const { storedCopyFields } = await browser.storage.sync.get({
    storedCopyFields: null,
  });
  if (storedCopyFields !== null) {
    Object.entries(storedCopyFields).forEach(([key, val]) => {
      const randomId = Math.random().toString().substring(2);
      newExtData.copyFields[randomId] = { text: val, label: key };

      if (key.match(/^Quick slot \d/)) {
        const quickSlotNumber = Number(key.split(" ")[2]);
        newExtData.copyFields[randomId].quickSlotNumber = quickSlotNumber;
      }
    });
  }
  return newExtData;
}
