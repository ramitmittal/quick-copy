<template>
  <div>
    <form @submit.prevent="onSubmit">
      <label for="label">Description</label>
      <input v-model.trim="name" type="text" class="moz-bg-white" /><br />
      <label for="text">Content</label>
      <textarea v-model="value" type="text" class="moz-bg-white" rows="2" />
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      required: false,
      type: String,
      default: "",
    },
    text: {
      required: false,
      type: String,
      default: "",
    },
    fieldId: {
      required: false,
      type: String,
      default: "",
    },
  },
  data() {
    return {
      name: this.label,
      value: this.text,
    };
  },
  mounted() {
    if (this.dLabel === "") {
      document.getElementsByTagName("textarea")[0].focus();
      document.execCommand("paste");
    }
    document.getElementsByTagName("input")[0].focus();
  },
  methods: {
    onSubmit() {
      if (this.name.length > 0 && this.value.length > 0) {
        this.$emit("save-validated", {
          label: this.name,
          text: this.value,
          fieldId: this.fieldId,
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
.moz-bg-white:focus {
  border-color: #4A90E2; /* Highlight color when focused */
  outline: none; /* Removes the default focus outline */
}
textarea {
  resize: vertical;
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
