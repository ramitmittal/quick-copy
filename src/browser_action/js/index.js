// https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;

import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
