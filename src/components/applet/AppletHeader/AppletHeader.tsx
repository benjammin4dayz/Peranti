import { AppletSampleButton } from "src/components/buttons/AppletSampleButton"
import { DeleteClosedEditorButton } from "src/components/buttons/DeleteClosedEditorButton"
import { RestoreClosedEditorButton } from "src/components/buttons/RestoreClosedEditorButton"
import { ToggleBatchModeButton } from "src/components/buttons/ToggleBatchModeButton"
import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { appletSidebarService } from "src/services/applet-sidebar-service"

import "./AppletHeader.scss"

export const AppletHeader = () => {
  const handleClickSettings = () => {
    appletSidebarService.toggle()
  }

  return (
    <div className="AppletHeader">
      <div className="AppletHeader-button-list">
        <AppletSampleButton />
        <ToggleBatchModeButton />

        <DeleteClosedEditorButton />
        <RestoreClosedEditorButton />
      </div>

      <div className="AppletHeader-button-list">
        <Button icon={Icons.Settings} onClick={handleClickSettings}>
          Options
        </Button>
      </div>
    </div>
  )
}
