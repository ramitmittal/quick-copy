<template>
  <div class="main">
    <p v-if="copyFieldsIsEmpty" class="empty">
      You have not copied anything yet!<br />Please use the 'Add New' tab or
      Quick Copy shortcuts.
    </p>
    <div v-else>
      <transition name="slide-fade">
        <div v-if="toasterText.length > 0" class="toaster">Copied!</div>
      </transition>
      <div class="search">
        <img class="inside-icon" src="../../static/search.svg" />
        <input
          v-model.trim="searchTerm"
          placeholder="Type here to search"
          class="moz-bg-white"
        />
      </div>
      <div class="hide-scroll">
        <div
          v-for="(value, index) in reorderedCopyFields"
          :key="value.fieldId"
          class="flex-row"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver($event)"
          @drop="onDrop($event, index)"
        >
          <p
            class="caption-30"
            :title="makeString(value.text)"
            @click="executeCopy(value.text)"
          >
            {{ value.label }}
          </p>
          <div class="icons">
            <img
              v-if="value.quickSlotNumber"
              :title="quickSlotText(value.quickSlotNumber)"
              class="icon"
              src="../../static/star.svg"
              @click="$emit('make-quick', value.fieldId)"
            />
            <span v-if="value.quickSlotNumber" class="number-display">
              {{ value.quickSlotNumber }}
            </span>
            <img
              v-else
              class="icon"
              src="../../static/star-half-alt.svg"
              title="Add to Quick Slot"
              @click="$emit('make-quick', value.fieldId)"
            />
            <img
              class="icon"
              src="../../static/edit.svg"
              title="Edit"
              @click="$emit('edit-field', value.fieldId)"
            />
            <img
              class="icon"
              src="../../static/trash.svg"
              title="Delete"
              @click="$emit('delete-field', value.fieldId)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    copyFields: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      searchTerm: "",
      toasterText: "",
      draggedIndex: null,
      reorderedCopyFields: [],
    };
  },
  computed: {
    copyFieldsIsEmpty() {
      return Object.keys(this.copyFields).length === 0;
    },
    filteredCopyFields() {
      const searchTerm = this.searchTerm.toLowerCase();
      const copyFields = Object.entries(this.copyFields).map(([key, value]) => ({
        ...value,
        fieldId: key,
      }));

      const sortQuickSlotsFirst = (a, b) => {
        const aqsn = a.quickSlotNumber;
        const bqsn = b.quickSlotNumber;
        if (aqsn !== undefined && bqsn === undefined) return -1;
        if (aqsn === undefined && bqsn !== undefined) return 1;
        if (aqsn !== undefined && bqsn !== undefined) return aqsn - bqsn;
        return a.createdAt - b.createdAt;
      };

      return searchTerm === ""
        ? copyFields.sort(sortQuickSlotsFirst)
        : copyFields
            .filter((field) =>
              field.label.toLowerCase().includes(searchTerm)
            )
            .sort(sortQuickSlotsFirst);
    },
  },
  watch: {
    filteredCopyFields: {
      immediate: true,
      handler(newFilteredCopyFields) {
        this.reorderedCopyFields = newFilteredCopyFields;
      },
    },
    copyFields: {
      immediate: true,
      handler() {
        this.reorderedCopyFields = this.filteredCopyFields;
      },
    },
  },
  methods: {
    makeString(value) {
      return value.length > 200 ? `${value.substring(0, 200)}...` : value;
    },
    async executeCopy(value) {
      try {
        await navigator.clipboard.writeText(value);
        this.toasterText = "Copied!";
      } catch (err) {
        this.toasterText = "Failed!";
      }
      setTimeout(() => {
        this.toasterText = "";
      }, 1500);
    },
    quickSlotText(n) {
      return `Quick Slot ${n}.\nClick to remove from Quick Slot.`;
    },
    onDragStart(event, index) {
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', event.target.outerHTML);
    },
    onDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    onDrop(event, index) {
      event.preventDefault();
      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        const reorderedCopyFields = [...this.reorderedCopyFields];
        const draggedItem = reorderedCopyFields[this.draggedIndex];
        reorderedCopyFields.splice(this.draggedIndex, 1);
        reorderedCopyFields.splice(index, 0, draggedItem);
        this.reorderedCopyFields = reorderedCopyFields;
        this.updateCopyFields();
        this.draggedIndex = null;
      }
    },
    updateCopyFields() {
      const updatedCopyFields = this.reorderedCopyFields.reduce((acc, field) => {
        acc[field.fieldId] = { ...field };
        delete acc[field.fieldId].fieldId;
        return acc;
      }, {});
      this.$emit('update-copy-fields', updatedCopyFields);
    },
  },
};
</script>

<style scoped>
.main {
  padding: 1.8rem;
  max-height: 800px;
  flex-grow: 1;
}
div,
p {
  padding: 0px;
  margin: 0px;
}
.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 0.4rem;
  align-items: baseline;
}
.flex-row:hover {
  background: #ededf0;
}
.toaster {
  position: absolute;
  z-index: 100;
  right: 8px;
  background: #0064b7;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  color: #ffffff;
}
.icons {
  padding: 0px 0.2rem;
}
.caption-30 {
  color: #004985;
  cursor: pointer;
  padding: 0.4rem;
  overflow-wrap: break-word;
  max-width: 370px;
}
.icon {
  border-radius: 0.4rem;
  padding: 0.2rem;
}
.icon:hover {
  background: #d7d7db;
  cursor: pointer;
}
.number-display {
  color: #3b86c3;
  position: relative;
  font-size: 0.8em;
  left: -0.3rem;
  top: 0.1rem;
}
.empty {
  text-align: center;
}
.search {
  position: relative;
  margin: 0rem 0rem 1rem 0rem;
}
input {
  text-indent: 2.2rem;
  width: 100%;
  border: 1px solid #d7d7db;
  height: 2rem;
  display: block;
  border-radius: 0.4rem;
}
.inside-icon {
  position: absolute;
  display: block;
  width: 1.2rem;
  height: 1.2rem;
  left: 12px;
  top: 6px;
}

@supports (-webkit-appearance: none) {
  .caption-30 {
    font-size: 1.1rem;
  }
  .icon {
    width: 1.2rem;
    height: 1.2rem;
  }
  .flex-row {
    align-items: center;
  }
  .icons {
    display: flex;
    align-items: center;
  }
}
@supports (-moz-appearance: none) {
  .icon {
    width: 1.6rem;
    height: 1.6rem;
  }
}

/* list animation classses */
.hide-scroll {
  overflow-y: hidden;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* toaster animation classes */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
