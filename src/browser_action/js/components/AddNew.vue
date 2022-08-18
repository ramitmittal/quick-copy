<template>
  <div>
    <form @submit.prevent="onSubmit">
      <label for="label">Description</label>
      <input v-model.trim="label" type="text" class="moz-bg-white" /><br />
      <label for="text">Content</label>
      <textarea v-model="text" type="text" class="moz-bg-white" rows="2" />
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  // used for editing existing name: value
  props: {
    editFieldData: {
      required: false,
    },
    editFieldId: {
      required: false,
    },
  },
  // set components's data to values from props
  data() {
    return {
      label: this.editFieldData ? this.editFieldData.label : "",
      text: this.editFieldData ? this.editFieldData.text : "",
    };
  },
  // if props aren't provided, attempt to read from clipboard
  mounted() {
    if (!this.editFieldData || this.editFieldData.text === "") {
      document.getElementsByTagName("textarea")[0].focus();
      document.execCommand("paste");
      document.getElementsByTagName("input")[0].focus();
    } else {
      document.getElementsByTagName("input")[0].focus();
    }
  },
  methods: {
    onSubmit() {
      if (this.text.length > 0 && this.label.length > 0) {
        this.$emit("save-validated", {
          text: this.text,
          label: this.label,
          fieldId: this.editFieldId,
        });
      }
    },
  },
};
</script>

<style scoped>
div {
  padding: 1.8rem;
}
input,
textarea {
  border: 1px solid #d7d7db;
  display: block;
  border-radius: 4px;
  padding: 0.4rem;
  width: 100%;
}
textarea {
  font-size: 0.9rem;
}
button {
  color: #ffffff;
  background-color: #ea6a00;
  cursor: pointer;
  border-width: 0px;
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
  margin-top: 0.6rem;
}
button:hover {
  background-color: #b75300;
}
</style>
