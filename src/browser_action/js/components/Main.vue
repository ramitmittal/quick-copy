<template>
  <div>
    <div class="tabset">
      <div
        v-for="(value, name) in tabItems"
        :key="name"
        :class="[
          name === selectedComponent ? 'selected-tab' : 'unselected-tab',
          'tab',
        ]"
        @click="onTabSelected(name)"
      >
        <p>{{ value }}</p>
      </div>
    </div>
    <component
      :is="selectedComponent"
      :copy-fields="copyFields"
      :edit-field-data="editFieldId ? copyFields[editFieldId] : null"
      :edit-field-id="editFieldId"
      @edit-field="handleEditField"
      @delete-field="handleDeleteField"
      @save-validated="handleSaveNewItem"
      @make-quick="handleMakeQuick"
    />
  </div>
</template>

<script>
import browser from "webextension-polyfill";
import QuickCopy from "./QuickCopy.vue";
import AddNew from "./AddNew.vue";
import messageTypes from "../../../common/messageTypes";

export default {
  name: "Main",
  components: {
    QuickCopy,
    AddNew,
  },
  props: {},
  data() {
    return {
      tabItems: {
        "quick-copy": "Quick Copy",
        "add-new": "Add New",
      },
      selectedComponent: "quick-copy",
      copyFields: {},
      editFieldId: null,
    };
  },
  mounted() {
    browser.runtime
      .sendMessage({ op: messageTypes.REQUEST_CURRENT_COPYFIELDS })
      .then((response) => {
        this.copyFields = response.payload;
      });

    browser.runtime.onMessage.addListener(this.handleMessage);
  },
  methods: {
    onTabSelected: function (componentName) {
      this.selectedComponent = componentName;
    },
    // handler for "save" button on add-new component
    // called on both editing of existing field or addition of new field
    handleSaveNewItem: function (payloadFromComponent) {
      const payloadForMessage = {
        op: messageTypes.EDIT_FROM_POPUP,
        ...payloadFromComponent,
      };
      browser.runtime.sendMessage(payloadForMessage).then(() => {
        this.selectedComponent = "quick-copy";
      });
      this.editFieldId = null;
    },
    handleMessage(message) {
      const { op, payload } = message;
      if (op === messageTypes.RESPONSE_CURRENT_COPYFIELDS) {
        this.copyFields = payload;
      }
    },
    handleDeleteField(fieldId) {
      browser.runtime.sendMessage({
        op: messageTypes.DELETE_FROM_POPUP,
        fieldId,
      });
    },
    handleEditField(fieldId) {
      this.editFieldId = fieldId;
      this.selectedComponent = "add-new";
    },
    handleMakeQuick(fieldId) {
      browser.runtime.sendMessage({ op: messageTypes.MAKE_QUICK, fieldId });
    },
  },
};
</script>

<style scoped>
.tabset {
  display: flex;
  flex-direction: row;
  background-color: #f9f9fa;
}
.tab {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0.4rem;
}
p {
  text-align: center;
}
.unselected-tab {
  cursor: pointer;
}
.selected-tab {
  margin: 0px 4px 8px 4px;
  box-shadow: 0px 0.2rem 0.2rem #b1b1b3;
  background-color: #0064b7;
}
.selected-tab > p {
  color: #f9f9fa;
}
@supports (-moz-appearance: none) {
  .tab {
    margin-top: 0.2rem;
  }
}
</style>
