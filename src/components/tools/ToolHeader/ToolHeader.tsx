import { observer } from "mobx-react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolStore } from "src/stores/toolStore"

import { ToolBatchModeButton } from "../ToolBatchModeButton"
import { ToolLoadFromHistoryButton } from "../ToolLoadFromHistoryButton"

import "./ToolHeader.scss"

export const ToolHeader = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const isToolReadOnly = activeTool.isReadOnly

  const onClickHistory = () => {
    toolStore.toggleHistoryPanel()
  }

  const onClickBackToTool = () => {
    toolStore.openTool(activeTool)
  }

  const onClickClean = () => {
    toolStore.resetTool()
  }

  return (
    <div className="ToolHeader">
      <div className="ToolHeader-button-list">
        {isToolReadOnly && (
          <Button icon={assets.BackSVG} onClick={onClickBackToTool}>
          Back To Tool Editor
          </Button>
        )}
        <Button icon={assets.NewspaperSVG} onClick={onClickBackToTool}>
          Sample
        </Button>
        <Button icon={assets.CleanSVG} onClick={onClickClean}>
          Clear
        </Button>
        <ToolLoadFromHistoryButton/>
        <ToolBatchModeButton />
      </div>

      <div className="ToolHeader-button-list">
        <Button icon={assets.SettingsSVG}>
          Tool Settings
        </Button>
        <Button icon={assets.HistorySVG} onClick={onClickHistory}>
          History
        </Button>
      </div>
    </div>
  )
})
