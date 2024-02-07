import { useStore } from "@nanostores/react"
import clsx from "clsx"
import { observer } from "mobx-react"
import { atom } from "nanostores"
import { type MouseEventHandler, type FC, useEffect, useRef, memo, type FocusEventHandler, useMemo } from "react"
import { type ItemParams, useContextMenu, Item, Separator } from "react-contexify"
import SimpleBar from "simplebar-react"

import { ContextMenu } from "src/components/common/ContextMenu"
import { WindowControls } from "src/components/window/WindowControls"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { useDragAndDropJS } from "src/hooks/useDragAndDropJS"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { hotkeysStore } from "src/stores/hotkeysStore"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolSession } from "src/types/ToolSession"

import "./ToolTabbar.scss"

import { interfaceStore } from "src/stores/interfaceStore"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"

const $renamingSessionId = atom<string>("")

export const ToolTabbar: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const sessions = toolSessionStore.getRunningSessions(activeTool.toolId)
  const activeIndex = sessions.findIndex((tab) => tab.sessionId === activeTool.sessionId)
  const appTitlebarStyle = interfaceStore.appTitlebarStyle

  const ref = useRef<HTMLDivElement>(null)

  const isToolActive = (toolSession: ToolSession) => (
    toolSession.sessionId === activeTool.sessionId
  )

  const onClickAddTab = () => {
    toolSessionStore.createSession(activeTool, undefined, true)
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    toolSessionStore.createSession(activeTool, undefined)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    let toolSession
    if (nextActiveIndex > sessions.length - 1) {
      toolSession = sessions[0]
    } else {
      toolSession = sessions[nextActiveIndex]
    }

    void toolSessionStore.openSession(toolSession)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex - 1
    let toolSession
    if (nextActiveIndex < 0) {
      toolSession = sessions[sessions.length - 1]
    } else {
      toolSession = sessions[nextActiveIndex]
    }

    void toolSessionStore.openSession(toolSession)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void toolSessionStore.closeSession(activeTool.toSession())
  })

  useHotkeysModified(hotkeysStore.keys.RESTORE_CLOSED_TAB, (event) => {
    event?.preventDefault()
    void toolHistoryStore.restoreLastHistory()
  })

  useHotkeysModified(hotkeysStore.keys.RENAME_ACTIVE_TAB, (event) => {
    event?.preventDefault()
    $renamingSessionId.set(activeTool.sessionId)
  })

  useEffect(() => {
    if (ref.current) {
      const onScroll = (event: WheelEvent) => {
        if (ref.current) {
          event.preventDefault()
          ref.current.scrollLeft += event.deltaY
        }
      }

      ref.current.addEventListener("wheel", onScroll)
      return () => {
        ref.current?.removeEventListener("wheel", onScroll)
      }
    }
  }, [ref])

  return (
    <>
      <div className="ToolTabbar" data-tauri-drag-region>
        <div className="ToolTabbar-inner">
          <SimpleBar
            className="ToolTabbar-inner-simplebar"
            scrollableNodeProps={{ ref }}
          >
            {sessions.map((toolSession) => (
              <TabItem
                key={toolSession.sessionId.concat(toolSession.sessionName ?? "")}
                toolSession={toolSession}
                active={isToolActive(toolSession)}
              />
            ))}

            {!(activeTool.toolId === "") && (
              <div onClick={onClickAddTab} className="ToolTabbar-item new">
                <div className="ToolTabbar-icon">
                  <img src={Icons.Plus} alt="Add Tab" />
                </div>
              </div>
            )}
          </SimpleBar>
        </div>

        {appTitlebarStyle === AppTitleBarStyle.Tabbar && <WindowControls />}
      </div>

      <TabbarContextMenu />
    </>
  )
})

interface TabItemProps {
  toolSession: ToolSession
  active: boolean
}

interface MenuParams {
  toolSession: ToolSession
}

type TabbarContextMenuItemParams = ItemParams<MenuParams>

const TabbarContextMenu: FC = () => {
  const handleCloseAllSession = () => {
    toolSessionStore.closeAllSession()
  }

  const handleCloseSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      void toolSessionStore.closeSession(toolSession)
    }
  }

  const handleCloseOtherSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      void toolSessionStore.closeOtherSession(toolSession)
    }
  }

  const handleRenameSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      $renamingSessionId.set(toolSession.sessionId)
    }
  }

  return (
    <ContextMenu id={ContextMenuKeys.ToolTabbar}>
      <Item
        id="copy"
        onClick={handleCloseSession}
      >
        Close
      </Item>
      <Item
        id="paste"
        onClick={handleCloseOtherSession}
      >
        Close Others
      </Item>
      <Item
        id="pick-from-file"
        onClick={handleCloseAllSession}
      >
        Close All
      </Item>
      <Separator />
      <Item
        id="save-to-file"
        onClick={handleRenameSession}
      >
        Raname
      </Item>
    </ContextMenu>
  )
}

const TabItem: FC<TabItemProps> = memo((props) => {
  const { toolSession, active } = props
  const { sessionId, sessionName, sessionSequenceNumber, toolId, isActionRunning } = toolSession
  const renamingSessionId = useStore($renamingSessionId)
  const isRenamingSession = useMemo(() => renamingSessionId === sessionId, [renamingSessionId])
  const tabLabelRef = useRef<HTMLDivElement>(null)

  const { show } = useContextMenu()

  const getSessionName = () => {
    if (sessionName) return sessionName
    return toolStore.mapOfLoadedToolsName[toolId]?.concat(`-${sessionSequenceNumber}`)
  }

  const handleMouseDown: MouseEventHandler = (event) => {
    if (event.button === 0) {
      /**
       * Dont open the session when user click on close button
       */
      const clickedElement = event.target as HTMLDivElement
      if (clickedElement.tagName.toLowerCase() === "img" ||
        clickedElement.classList.contains("ToolTabbar-icon")) {
        event.stopPropagation()
        event.preventDefault()
        return
      }

      void toolSessionStore.openSession(toolSession)
    } else if (event.button === 1) {
      event.preventDefault()
    }
  }

  const handleMouseUp: MouseEventHandler = (event) => {
    if (event.button === 1) {
      void toolSessionStore.closeSession(toolSession)
    }
  }

  const handleContextMenu: MouseEventHandler = (event) => {
    show({
      event,
      id: ContextMenuKeys.ToolTabbar,
      props: { toolSession }
    })
  }

  const handleCloseTab: MouseEventHandler = (event) => {
    event.stopPropagation()
    void toolSessionStore.closeSession(toolSession)
  }

  /**
   * Scroll tool tabbar to this tab when active
   */
  useEffect(() => {
    if (active && draggableElementRef.current) {
      draggableElementRef.current.scrollIntoView()
    }
  }, [active])

  /**
   * Select all text when starting to rename this tab
   */
  useEffect(() => {
    if (isRenamingSession) {
      if (tabLabelRef.current) {
        tabLabelRef.current.focus()

        const range = document.createRange()
        range.selectNodeContents(tabLabelRef.current)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }, [isRenamingSession])

  /**
   * Blur the input for renaming tab when user hit Enter
   */
  useEffect(() => {
    const { current: tabLabelInput } = tabLabelRef

    if (tabLabelInput) {
      const keyDownListener = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          tabLabelInput.blur()
        }
      }

      tabLabelInput.addEventListener("keydown", keyDownListener)
      return () => {
        tabLabelInput?.removeEventListener("keydown", keyDownListener)
      }
    }
  }, [tabLabelRef.current])

  /**
   * Rename session when rename tab input get blur event
   */
  const handleSessionNameInputBlur: FocusEventHandler<HTMLDivElement> = () => {
    $renamingSessionId.set("")

    if (tabLabelRef.current) {
      const tabLabel = tabLabelRef.current.innerText

      if (tabLabel !== getSessionName()) {
        void toolSessionStore.renameSession(toolSession, tabLabel)
      }
    }
  }

  const { draggableElementRef, draggableElementPlaceholderRef } = useDragAndDropJS({
    onMouseUp: (event) => {
      const elementBelowMouse = document.elementsFromPoint(event.clientX, event.clientY)
      const otherTabbar = elementBelowMouse.find((element) => (
        element.classList.contains("ToolTabbar-item") && !element.classList.contains("active")
      ))

      if (otherTabbar) {
        const targetSessionId = (otherTabbar as HTMLDivElement).getAttribute("data-session-id")
        if (targetSessionId) {
          toolSessionStore.switchSessionPosition(sessionId, targetSessionId)
        }
      }
    }
  })

  return (
    <div
      id={ContextMenuKeys.ToolTabbar}
      className="ToolTabbar-item-container"
      key={toolSession.sessionId.concat(toolSession.sessionName ?? "")}
    >
      <div ref={draggableElementPlaceholderRef}></div>
      <div
        ref={draggableElementRef}
        key={toolSession.sessionId}
        className={clsx("ToolTabbar-item", { active })}
        data-session-id={toolSession.sessionId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <div
          ref={tabLabelRef}
          className="ToolTabbar-item-label"
          contentEditable={isRenamingSession}
          onBlur={handleSessionNameInputBlur}
          suppressContentEditableWarning
        >
          {getSessionName()}
          {isActionRunning ? " ..." : ""}
        </div>
        <div className="ToolTabbar-icon" onClickCapture={handleCloseTab}>
          <img src={Icons.Close} alt="Close Tab" />
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.active === nextProps.active &&
    prevProps.toolSession.isActionRunning === nextProps.toolSession.isActionRunning &&
    prevProps.toolSession.sessionName === nextProps.toolSession.sessionName &&
    prevProps.toolSession.sessionSequenceNumber === nextProps.toolSession.sessionSequenceNumber
})
