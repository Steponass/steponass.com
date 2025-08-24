import { mount } from 'svelte'
import '@styles/reset.css'
import '@styles/properties.css'
import '@styles/variables.css'
import '@styles/fonts.css'
import '@styles/globals.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
