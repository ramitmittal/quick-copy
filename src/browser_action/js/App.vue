<template>
  <div id="app">
    <Main />
  </div>
</template>

<script>
import Main from "./components/Main.vue";

export default {
  name: "App",
  components: {
    Main,
  },
};
</script>

<style>
@font-face {
  font-family: "Roboto";
  src: url("../static/Roboto-Regular.ttf");
}
* {
  font-family: "Roboto", sans-serif;
  color: #0c0c0d;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ffffff #ffffff;
}
input:focus,
textarea:focus,
button:focus {
    outline: none;
}
input, textarea {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    -o-box-sizing: border-box;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
}
#app {
  width: 400px;
}
*::-webkit-scrollbar {
  width: 8px;
}
*::-webkit-scrollbar-track {
  background: #ffffff;
}
*::-webkit-scrollbar-thumb {
  background: #ffffff;
}
</style>
