import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { AppTitleBarStyle as AppTitlebarStyle } from "src/enums/AppTitleBarStyle"
import { SidebarMode } from "src/enums/SidebarMode"
import { Theme } from "src/enums/Theme"
import { UserSettingsKeys } from "src/enums/UserSettingsKeys"
import { watchUserSettings, getUserSettings } from "src/utils/decorators"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  @watchUserSettings(UserSettingsKeys.theme)
  theme: Theme = getUserSettings(UserSettingsKeys.theme, Theme.Dark)

  @watchUserSettings(UserSettingsKeys.floatingSidebar)
  isFloatingSidebar = getUserSettings(UserSettingsKeys.floatingSidebar, false)

  @watchUserSettings(UserSettingsKeys.titlebarStyle)
  appTitlebarStyle = getUserSettings(UserSettingsKeys.titlebarStyle, AppTitlebarStyle.Commandbar)

  isSidebarShow = true

  _sidebarMode: SidebarMode = SidebarMode.DockPinned

  sidebarActiveMenuId = "tools"

  @watchUserSettings(UserSettingsKeys.textAreaWordWrap)
  textAreaWordWrap = getUserSettings(UserSettingsKeys.textAreaWordWrap, false)

  windowSize = { width: 0, height: 0 }

  isWindowMaximized: boolean = false

  constructor() {
    makeAutoObservable(this)

    this.recalculateWindowSize()
    this.setupPersistence()
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.InterfaceStore,
      storage: localforage,
      stringify: false,
      properties: [
        "isSidebarShow",
        "_sidebarMode"
      ]
    })
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }

  get sidebarMode() {
    if (this.isFloatingSidebar) return SidebarMode.FloatUnpinned
    return this._sidebarMode
  }

  set sidebarMode(mode: SidebarMode) {
    this._sidebarMode = mode
  }

  toggleSidebar() {
    this.isSidebarShow = !this.isSidebarShow
  }

  hideSidebar() {
    this.isSidebarShow = false
  }

  showSidebar() {
    this.isSidebarShow = true
  }

  toggleSidebarAlwaysFloating() {
    this.isFloatingSidebar = !this.isFloatingSidebar

    if (!this.isFloatingSidebar) {
      this.isSidebarShow = true
    }
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }

  setTheme(theme: any) {
    this.theme = theme
  }

  setAppTitlebarStyle(style: AppTitlebarStyle) {
    this.appTitlebarStyle = style
  }

  setIsWindowMaximized(value: boolean) {
    this.isWindowMaximized = value
  }
}

export const interfaceStore = new InterfaceStore()
