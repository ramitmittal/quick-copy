<template>
  <div>
    <div class="tabset">
      <div
        :class="[showListing ? 'selected-tab' : 'unselected-tab', 'tab']"
        @click="toggleListing(true)"
      >
        <p>Quick Copy</p>
      </div>
      <div
        :class="[!showListing ? 'selected-tab' : 'unselected-tab', 'tab']"
        @click="toggleListing(false)"
      >
        <p>Add New</p>
      </div>
    </div>
    <quick-copy
      v-if="showListing"
      :copy-fields="copyFields"
      @edit-field="handleEditField"
      @delete-field="handleDeleteField"
      @make-quick="handleMakeQuick"
    />
    <add-new
      v-if="!showListing"
      @save-validated="handleSaveItem"
      :label="copyFields[editFieldId]?.label"
      :text="copyFields[editFieldId]?.text"
      :fieldId="editFieldId"
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
      showListing: true,
      copyFields: {},
      editFieldId: "",
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    toggleListing: function (boolVal) {
      this.showListing = boolVal;
    },
    handleSaveItem: function (payloadFromComponent) {
      const payloadForMessage = {
        op: messageTypes.EDIT_FROM_POPUP,
        ...payloadFromComponent,
      };
      browser.runtime.sendMessage(payloadForMessage).then(() => {
        this.editFieldId = null;
        this.toggleListing(true);
        this.refreshData();
      });
    },
    refreshData() {
      return browser.runtime
        .sendMessage({ op: messageTypes.REQUEST_CURRENT_COPYFIELDS })
        .then((response) => {
          this.copyFields = response.payload;
        });
    },
    handleEditField(fieldId) {
      this.editFieldId = fieldId;
      this.toggleListing(false);
    },
    handleDeleteField(fieldId) {
      return browser.runtime
        .sendMessage({
          op: messageTypes.DELETE_FROM_POPUP,
          fieldId,
        })
        .then(this.refreshData);
    },
    handleMakeQuick(fieldId) {
      browser.runtime
        .sendMessage({ op: messageTypes.MAKE_QUICK, fieldId })
        .then(this.refreshData);
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
