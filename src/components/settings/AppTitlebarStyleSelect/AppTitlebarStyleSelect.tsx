import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"
import { interfaceStore } from "src/stores/interfaceStore"

export const AppTitleBarStyleSelect: FC = () => {
  const { appTitlebarStyle } = interfaceStore

  const onChange = (value: AppTitleBarStyle) => {
    interfaceStore.setAppTitlebarStyle(value)
  }

  return (
    <SelectInput<AppTitleBarStyle>
      options={[
        { label: "Commandbar", value: AppTitleBarStyle.Commandbar },
        { label: "Tabbar", value: AppTitleBarStyle.Tabbar }
      ]}
      onSubmit={onChange}
      defaultValue={appTitlebarStyle}
    />
  )
}
