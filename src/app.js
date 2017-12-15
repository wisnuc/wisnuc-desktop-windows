import React from 'react'
import ReactDom from 'react-dom'
import Debug from 'debug'
import { ipcRenderer, remote } from 'electron'
import injectTapEventPlugin from 'react-tap-event-plugin'
import i18n from 'i18n'

import MDNS from './common/mdns'
import Fruitmix from './Fruitmix'

/* modify debug filter before application starts' */
const debug = Debug('app')
localStorage.debug = '*component*'

/* i18n config */

const lang = navigator.language
i18n.configure({
	updateFiles: false,
  locales: ['en-US', 'zh-CN'],
  directory: remote.app.getAppPath() + '\\locales',
  defaultLocale: lang === 'zh-CN' ? 'zh-CN' : 'en-US'
})

/* required by Material UI */
injectTapEventPlugin()

/* render method */
const render = () => ReactDom.render(<Fruitmix />, document.getElementById('app'))

/* start mdns scan */
global.mdnsStore = []
global.mdns = MDNS(ipcRenderer, global.mdnsStore, render)
global.mdns.scan()

document.addEventListener('dragover', (e) => {
  e.preventDefault()
})

document.addEventListener('drop', (e) => {
  e.preventDefault()
})

/* render after config loaded */
ipcRenderer.on('CONFIG_UPDATE', (event, config) => {
  console.log('CONFIG_UPDATE', config)
  global.config = config
  if (config.global && config.global.locales) i18n.setLocale(config.global.locales)
  render()
})
