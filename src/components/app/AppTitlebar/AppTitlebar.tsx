import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar"
import { WindowControls } from "src/components/window/WindowControls"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const showToolTabbar = titlebarStyle === AppTitleBarStyle.Tabbar

  if (showToolTabbar) {
    return null
  }

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div style={{ flex: 1, height: "100%" }} data-tauri-drag-region></div>

      {!showToolTabbar && (
        <>
          <div />
          <ToolSearchBar />
        </>
      )}

      <WindowControls />
    </div>
  )
}
