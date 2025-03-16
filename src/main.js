import "./assets/tailwind.css";
import "./style.css";
import PrimeVue from "primevue/config";
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(PrimeVue, {
    theme: 'none',
    darkModeSelector: false,
});

app.use(pinia);
app.use(router);

app.mount('#app');
