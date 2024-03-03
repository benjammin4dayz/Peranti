import { toJS } from "mobx"
import { useMemo, type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { AppletComponentContent } from "src/contexts/AppletInputContext/AppletInputContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { type AppletInput } from "src/types/AppletInput"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface AppletInputRendererProps {
  appletInput: AppletInput
  readOnly?: boolean
}

export const AppletInputRenderer: FC<AppletInputRendererProps> = (props) => {
  const { readOnly, appletInput } = props
  const { show } = useContextMenu()

  const activeApplet = activeAppletStore.getActiveApplet()
  const renderCounter = useSelector(() => activeAppletStore.getActiveApplet().renderCounter)

  /**
   * Rendered field state
   */
  const defaultValue = activeApplet.inputValues[appletInput.key] ?? appletInput.defaultValue
  const initialState = useMemo(() => activeApplet.inputFieldsState[appletInput.key], [renderCounter])

  /**
   * Batch mode state
   */
  const isBatchModeEnabled = useSelector(() => activeApplet.isBatchModeEnabled)
  const batchModeInputKey = useSelector(() => activeApplet.batchModeInputKey)

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeApplet.maximizedField)

  /**
   * Component to be rendered
   */
  const inputComponent = appletComponentService.getInputComponent(appletInput.component, isBatchModeEnabled)
  const Component: FC<InputComponentProps<any>> = inputComponent.component

  const handleValueChange = (val: unknown) => {
    activeApplet.setInputValue(appletInput.key, val)
  }

  const handleStateChange = (state: unknown) => {
    activeApplet.setInputFieldState(appletInput.key, state)
  }

  const handleContextMenu = (event: any) => {
    if (activeApplet.isDeleted) {
      return
    }

    show({
      event,
      id: ContextMenuKeys.AppletComponent,
      props: {
        appletInput: toJS(appletInput),
        component: inputComponent
      }
    })
  }

  const additionalProps: Record<string, any> = {}
  if (["Code", "PipelineEditor"].includes(appletInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (maximizedField.enabled && maximizedField.type === "input" && maximizedField.key !== appletInput.key) {
    return
  }

  if (isBatchModeEnabled && batchModeInputKey !== appletInput.key) {
    return
  }

  return (
    <AppletComponentContent.Provider value={{ type: "input", fieldKey: appletInput.key }}>
      <Component
        {...appletInput.props}
        key={appletInput.key}
        fieldKey={appletInput.key}
        label={appletInput.label}
        defaultValue={defaultValue}
        readOnly={readOnly}
        onValueChange={handleValueChange}
        onContextMenu={handleContextMenu}
        {...additionalProps}
      />
    </AppletComponentContent.Provider>
  )
}
