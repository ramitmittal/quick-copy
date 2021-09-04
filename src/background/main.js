/**
 * background scripts are loaded as soon as the extension is loaded (on browser startup)
 *
 * background scripts can:
 *   access all webextension APIs
 *   respond to commands (shortcut keys)
 *   send messages to content scripts or browser action
 *   access webextension storage
 */

import browser from 'webextension-polyfill'

import commands from '../common/commands'
import messageTypes from '../common/messageTypes'
import { showBadgeForTab } from '../common/util'
import { EXTENSION_DATA_VERSION, migrate } from './storage'

let extData, copyFields
(async function loadData () {
  const result = await browser.storage.sync.get({ extData: null })
  if (result.extData !== null && result.extData.version === EXTENSION_DATA_VERSION) {
    extData = result.extData
  } else {
    extData = await migrate(result)
  }
  copyFields = extData.copyFields
  await browser.storage.sync.clear()
  await browser.storage.sync.set({ extData })
})()

// write copy data to webextension storage and update browser action
async function updateStorage () {
  await browser.storage.sync.set({ extData })
  await browser.runtime.sendMessage({ op: messageTypes.RESPONSE_CURRENT_COPYFIELDS, payload: copyFields })
    .catch(() => {}) // the code above will error when popup isn't open
}

// handle commands (user presses shortcut keys)
async function handleCommand (cmd) {
  if (!Object.values(commands).includes(cmd)) return

  // ideally an array of length 1
  const allActiveTabs = await browser.tabs.query({
    currentWindow: true,
    active: true
  })

  if (allActiveTabs.length < 1) return
  const activeTab = allActiveTabs[0]

  if ([commands.COPY_1, commands.COPY_2, commands.COPY_3, commands.COPY_4, commands.COPY_5].includes(cmd)) {
    const copiedText = await browser.tabs.sendMessage(activeTab.id, { op: messageTypes.COPY_FROM_PAGE })
    if (copiedText.length < 1) return

    const quickSlotNumber = Number(cmd.split('-')[1])
    const existingQuickSlot = Object.entries(copyFields).find(([key, val]) => val.quickSlotNumber === quickSlotNumber)

    if (existingQuickSlot !== undefined) {
      const identifier = existingQuickSlot[0]
      copyFields[identifier].text = copiedText
    } else {
      const identifier = Math.random().toString().substring(2)
      copyFields[identifier] = { text: copiedText, label: `Quick slot ${quickSlotNumber}`, quickSlotNumber }
    }

    await updateStorage()
    showBadgeForTab('C', activeTab.id)
  }

  if ([commands.PASTE_1, commands.PASTE_2, commands.PASTE_3, commands.PASTE_4, commands.PASTE_5].includes(cmd)) {
    const quickSlotNumber = Number(cmd.split('-')[1])
    const quickSlot = Object.values(copyFields).find(val => val.quickSlotNumber === quickSlotNumber)

    if (quickSlot !== undefined) {
      browser.tabs.sendMessage(activeTab.id, { op: messageTypes.PASTE_TO_PAGE, text: quickSlot.text })
    }
    showBadgeForTab('V', activeTab.id)
  }
}

// handle messages (messages are sent between different components of a webextension)
async function handleMessage (msg) {
  const { op, text, label, fieldId } = msg

  // this will handle both edits and additions
  if (op === messageTypes.EDIT_FROM_POPUP) {
    const effectiveFieldId = fieldId || Math.random().toString().substring(2)
    if (!copyFields[effectiveFieldId]) copyFields[effectiveFieldId] = {}
    copyFields[effectiveFieldId].label = label
    copyFields[effectiveFieldId].text = text
    await updateStorage()
  }

  else if (op === messageTypes.DELETE_FROM_POPUP) {
    delete copyFields[fieldId]
    await updateStorage()
  }

  else if (op === messageTypes.COPY_FROM_POPUP) {
    const allActiveTabs = await browser.tabs.query({
      currentWindow: true,
      active: true
    })

    if (allActiveTabs.length < 1) return
    const activeTab = allActiveTabs[0]

    showBadgeForTab('C', activeTab.id)
  }

  else if (op === messageTypes.REQUEST_CURRENT_COPYFIELDS) {
    return { payload: copyFields }
  }

  else if (op === messageTypes.MAKE_QUICK) {
    const usedQuickSlots = new Set()
    Object.entries(copyFields)
      .forEach(([key, val]) => {
        if (val.quickSlotNumber !== undefined) {
          usedQuickSlots.add(val.quickSlotNumber)
        }
      })

    const nextAvailableQuickSlotNumber = [5, 4, 3, 2, 1].reduce((acc, curVal) => {
      if (usedQuickSlots.has(curVal)) return acc
      else return curVal
    }, null)

    if (nextAvailableQuickSlotNumber !== null) {
      copyFields[fieldId].quickSlotNumber = nextAvailableQuickSlotNumber
    }
    await updateStorage()
  }
}

browser.runtime.onMessage.addListener(handleMessage)
browser.commands.onCommand.addListener(handleCommand)
