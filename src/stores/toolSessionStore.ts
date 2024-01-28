import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.js"
import { Tool } from "src/models/Tool"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolSession } from "src/types/ToolSession.js"
import { type ToolState } from "src/types/ToolState.js"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

class ToolSessionStore {
  /**
   * The store has been persisted
   */
  private _isPersisted: boolean = false

  /**
   * The store has been initialized
   */
  isInitialized: boolean = false

  /**
   * Allow editor to have multiple sessions at once
   *
   * @configurable
   */
  enableMultipleSession = true

  /**
   * Close the tool when the last session is closed
   *
   * @configurable
   */
  closeToolWhenLastSessionIsClosed = true

  /**
   * Unified tool sessions
   *
   * @configurable
   */
  unifiedToolSession = true

  /**
   * New created session will be placed in the last of session (most right)
   * Only applied when creating session using hotkey
   *
   * Creating new session using `Tool Tabbar Add button` will always placed at the end of list
   *
   * @configurable
   */
  placeNewSessionToLast = false

  /**
   * List of tool sessions
   */
  sessions: ToolSession[] = []

  /**
   * List of tools that has running action
   */
  runningTools: Record<string, Tool | undefined> = {}

  /**
   * Pair of toolId and list of created sequence of session
   */
  sessionSequences: Record<string, boolean[]> = {}

  /**
   * Pair of each tool last active sessionId
   */
  activeSessionIdOfTools: Record<string, string> = {}

  /**
   * Currently active sessionId
   */
  activeSessionId: string = ""

  /**
   * ToolSessionStore constructor
   */
  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Setup persistence to load previous
   *
   * @returns
   */
  setupPersistence() {
    if (this._isPersisted) {
      return
    }

    this.setIsPersisted(true)

    void makePersistable(this, {
      name: StorageKeys.ToolSessionStore,
      stringify: false,
      properties: [
        "sessionSequences",
        "enableMultipleSession",
        "activeSessionIdOfTools",
        "activeSessionId",
        "sessions"
      ]
    }).then(() => {
      void this.handleHydratedStore()
    })
  }

  /**
   * Action handler when store is successfully hydrated from storage
   */
  async handleHydratedStore() {
    const toolSession = this.sessions.find((session) => session.sessionId === this.activeSessionId)

    if (toolSession) {
      const tool = await this.getToolFromStorage(toolSession)
      this.activateTool(tool)
    }

    this.setIsInitialized(true)
  }

  /**
   * Set value of isInitialized\
   *
   * @param value
   */
  private setIsInitialized(value: boolean) {
    this.isInitialized = value
  }

  /**
   * Set value of isPersisted
   *
   * @param value
   */
  private setIsPersisted(value: boolean) {
    this._isPersisted = value
  }

  /**
   * Load tool from local storage and create new instance of tool
   *
   * @param toolSession
   * @param options
   * @returns
   */
  async getToolFromStorage(toolSession: ToolSession, options: { disablePersistence?: boolean } = {}) {
    /**
     * Return the active tool if has same sessionId
     */
    const activeTool = toolRunnerStore.getActiveTool()
    if (activeTool.sessionId === toolSession.sessionId) {
      return activeTool
    }

    /**
     * Try to retrieve tool from running tools when exists to get
     * same reference from mobx store
     */
    const runningTool = this.runningTools[toolSession.sessionId]
    if (runningTool && runningTool !== undefined) {
      return runningTool
    }

    /**
     * Try to retrieve tool from storage
     */
    const { disablePersistence = false } = options
    const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
    const toolState = await Tool.getToolStateFromStorage(toolSession.sessionId)

    if (toolState) {
      return new Tool(toolConstructor, { initialState: toolState, disablePersistence })
    }
    return new Tool(toolConstructor, { initialState: toolSession, disablePersistence })
  }

  /**
   * Set value of isActionRunning and isKeepAlive
   *
   * @param sessionId
   * @param value
   */
  keepAliveSession(sessionId: string, value: boolean) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === sessionId)

    if (sessionIndex > -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        isActionRunning: value,
        isKeepAlive: value
      }
    }
  }

  /**
   * Create new session and set as active tool
   *
   * @param toolConstructor
   */
  createSession(
    toolConstructor: ToolConstructor,
    toolOptions: ConstructorParameters<typeof Tool>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    /**
     * Exit if there is no tool to be created
     */
    if (toolConstructor.toolId === "") {
      return
    }

    /**
     * Create sessionName for tool
     */
    const newOptions: typeof toolOptions = {
      ...toolOptions,
      sessionSequenceNumber: this.attachSessionSequence(toolConstructor)
    }

    /**
     * Initialize new tool based on arguments
     */
    const tool = new Tool(toolConstructor, newOptions)

    /**
     * Push new tool into session
     */
    this.pushIntoSessionList(tool.toSession(), placeSessionAtTheEnd)
    this.activateTool(tool)

    return tool.toSession()
  }

  /**
   * Create session from tool history
   *
   * @param toolHistory
   */
  createSessionFromHistory(toolHistory: ToolState) {
    const mainTool = toolStore.mapOfLoadedTools[toolHistory.toolId]
    this.createSession(mainTool, { initialState: toolHistory })
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param toolConstructor
   */
  findOrCreateSession(toolConstructor: ToolConstructor) {
    const runningSessions = this.getRunningSessionsFromTool(toolConstructor.toolId)

    /**
     * Create new if there is no existing sessions
     */
    if (runningSessions.length === 0) {
      this.createSession(toolConstructor)

    /**
     * Restore active session(s) of tool
     */
    } else {
      const activeTool = toolRunnerStore.getActiveTool()
      const lastToolSessionId = this.activeSessionIdOfTools[toolConstructor.toolId]

      /**
       * Skip action if the session is already opened
       */
      if (activeTool.sessionId === lastToolSessionId) {
        return
      }

      const lastToolSession = runningSessions.find(
        (toolSession) => toolSession.sessionId === lastToolSessionId
      )

      void this.openSession(lastToolSession ?? runningSessions[0])
    }
  }

  /**
   * Open tool session and set active
   *
   * @param tool
   */
  async openSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (activeTool.sessionId === toolSession.sessionId) {
      return
    }

    const tool = await this.getToolFromStorage(toolSession)
    this.activateTool(tool)
  }

  /**
   * Activate created session of tool
   *
   * @param tool
   */
  activateTool(tool: Tool) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (tool.sessionId === activeTool.sessionId) {
      return
    }

    /**
     * Deactivate currently active tool
     */
    void this.deactivateTool(activeTool)

    /**
     * Set new tool as active tool
     */
    toolRunnerStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  /**
   * Deactivate session but keep it in the list of session
   */
  private async deactivateTool(tool: Tool) {
    /**
     * Save to state if the tool has running action
     */
    if (tool.isActionRunning) {
      this.runningTools[tool.sessionId] = tool

    /**
     * Disable session reference to store if session has no action running
     */
    } else {
      tool.stopStore()

      if (this.runningTools[tool.sessionId]) {
        this.runningTools[tool.sessionId] = undefined
      }
    }
  }

  /**
   * Close tool session and remove from list of session state
   *
   * @param tool
   */
  async closeSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Save old sessions of tool for future reference
     */
    const oldSessionsOfTool = this.getRunningSessions(toolSession.toolId)

    /**
     * Filter sessions without closed tool
     */
    this.sessions = this.sessions.filter((session) => session.sessionId !== toolSession.sessionId)

    /**
     * Begin process to close session
     */
    await this.proceedCloseSession(toolSession)

    /**
     * Early exit if closed session is not currently active tool
     */
    if (activeTool.sessionId !== toolSession.sessionId) {
      return
    }

    const newSessionsOfTool = this.getRunningSessions(toolSession.toolId)

    /**
     * Create another session if closed session if the last session of tool
     */
    if (newSessionsOfTool.length === 0) {
      /**
       * Reset session sequence (to remove array item with value = false) because list is empty
       */
      this.resetToolSessionSequence(toolSession.toolId)

      /**
       * Open empty tool if user has preference to close tool when all session is closed
       */
      if (this.closeToolWhenLastSessionIsClosed) {
        this.activateTool(Tool.empty())
        return
      }

      /**
       * Open new session of tool
       */
      const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
      this.createSession(toolConstructor)

    /**
     * Open another existing sessions from tool based on closed tool session index
     */
    } else {
      let newSessionToBeOpened
      const closedSessionIndex = oldSessionsOfTool.findIndex(
        (session) => session.sessionId === toolSession.sessionId
      )

      /**
       * If closed session is not found on list of session, it means closeSession()
       * was called more than once with same session (usually because hold the hotkey)
       */
      if (closedSessionIndex < 0) {
        return
      }

      if (closedSessionIndex <= newSessionsOfTool.length - 1) {
        newSessionToBeOpened = newSessionsOfTool[closedSessionIndex]
      } else {
        newSessionToBeOpened = newSessionsOfTool[closedSessionIndex - 1]
      }

      void this.openSession(newSessionToBeOpened)
    }
  }

  /**
   * Close all session and remove it's store reference as well as the storage
   */
  closeAllSession() {
    this.sessions.forEach((session) => {
      void this.closeSession(session)
    })

    /**
     * Empty the session
     */
    this.sessions = []

    /**
     * Reset session sequence
     */
    this.sessionSequences = {}

    /**
     * Open empty tool
     */
    this.activateTool(Tool.empty())
  }

  /**
   * Close all session except one tool session
   *
   * @param toolSession
   */
  async closeOtherSession(toolSession: ToolSession) {
    this.sessions.forEach((session) => {
      if (session.sessionId !== toolSession.sessionId) {
        void this.closeSession(session)
      }
    })

    /**
     * Empty the session and remains the choosen tool sesion
     */
    this.sessions = [toolSession]

    /**
     * Reset session sequence
     */
    this.sessionSequences = {}
    this.sessionSequences[toolSession.toolId] = [true]
    if (toolSession.sessionSequenceNumber) {
      this.sessionSequences[toolSession.toolId][toolSession.sessionSequenceNumber] = true
    }

    /**
     * Open empty tool
     */
    const tool = await this.getToolFromStorage(toolSession)
    if (tool) {
      this.activateTool(tool)
    }
  }

  /**
   * Reset session sequence of tool
   *
   * @param toolId
   */
  resetToolSessionSequence(toolId: string) {
    this.sessionSequences[toolId] = [true]
  }

  /**
   * Generate session name for tool
   *
   * @param tool
   * @returns
   */
  attachSessionSequence(tool: ToolConstructor) {
    if (!this.sessionSequences[tool.toolId]) {
      this.resetToolSessionSequence(tool.toolId)
    }

    if (this.sessionSequences[tool.toolId].length === 1) {
      this.sessionSequences[tool.toolId][1] = true
      return 1
    }

    let nextIndex
    const sessionSequences = toJS(this.sessionSequences[tool.toolId])
    const smallestIndex = sessionSequences.findIndex((e) => !e || e === undefined)

    if (smallestIndex === -1) {
      nextIndex = sessionSequences.length
    } else {
      nextIndex = smallestIndex
    }

    /**
     * This block code purposely to prevent new session has same sequence number
     * when holding the CLOSE_TAB hotkey
     */
    if (nextIndex === 1) {
      const runningSessions = this.getRunningSessionsFromTool(tool.toolId)

      /**
       * When tool has 1 running session but nextIndex is 1, increase the nextIndex
       */
      if (runningSessions.length === 1 && runningSessions[0].sessionSequenceNumber === nextIndex) {
        this.sessionSequences[tool.toolId][1] = true
        nextIndex = nextIndex + 1
      }
    }

    this.sessionSequences[tool.toolId][nextIndex] = true
    return nextIndex
  }

  /**
   * Detach tool with default session names
   *
   * @param toolSession
   */
  async detachSessionSequence(toolSession: ToolSession, tool?: Tool) {
    const sessions = this.sessionSequences[toolSession.toolId] ?? []
    const deletedIndex = sessions.findIndex(
      (_, index) => index === toolSession.sessionSequenceNumber
    )

    if (deletedIndex >= 0) {
      this.sessionSequences[toolSession.toolId][deletedIndex] = false
    }

    if (sessions.filter((e) => e).length === 1) {
      this.resetToolSessionSequence(toolSession.toolId)
    }

    /**
     * Remove sequence number from actual tool
     */
    const retrievedTool = tool ?? (await this.getToolFromStorage(toolSession))
    if (retrievedTool) {
      retrievedTool.setSessionSequenceNumber(undefined)
      await retrievedTool.hydrateStore()
    }
  }

  /**
   * Set pair of toolId and sessionId
   *
   * @param tool
   */
  setActiveToolSessionId(tool: ToolSession) {
    this.activeSessionIdOfTools[tool.toolId] = tool.sessionId
    this.activeSessionId = tool.sessionId
  }

  /**
   * Save tool session to history if tool has been modified
   * and delete its local storage
   *
   * @param tool
   */
  private async proceedCloseSession(toolSession: ToolSession) {
    let isAddedToHistory = false
    /**
     * Load tool from storage but disable the persistence, we only need
     * to get tool state and save it into history
     */
    const tool = await this.getToolFromStorage(toolSession, { disablePersistence: true })

    if (tool) {
      /**
       * If state has been changed, insert into history
       */
      if (tool.getIsInputAndOutputHasValues() && tool.isInputValuesModified && tool.runCount > 0) {
        isAddedToHistory = toolHistoryStore.addHistory(tool.toState())
      }
    }

    /**
     * Remove closed tool session name from store
     */
    await this.detachSessionSequence(toolSession, tool)

    if (!isAddedToHistory) {
      void Tool.removeToolStateFromStorage(toolSession.sessionId)
    }
  }

  /**
   * Push created tool session into list
   *
   * @param tool
   */
  pushIntoSessionList(tool: ToolSession, placeSessionAtTheEnd: boolean = false) {
    if (this.placeNewSessionToLast || placeSessionAtTheEnd) {
      this.sessions.push(tool)
    } else {
      const activeTool = toolRunnerStore.getActiveTool()

      const indexOfActiveTool = this.sessions.findIndex((session) => (
        session.sessionId === activeTool.sessionId
      ))

      this.sessions.splice(indexOfActiveTool + 1, 0, tool)
    }
  }

  /**
   * Get all sessions of tool
   *
   * @param toolId
   * @returns
   */
  getRunningSessionsFromTool(toolId: string) {
    return this.sessions.filter((session) => session.toolId === toolId)
  }

  /**
   * Get running sessions based on use preferences
   *
   * @param toolId
   * @returns
   */
  getRunningSessions(toolId: string) {
    if (this.unifiedToolSession) {
      return this.sessions
    }

    return this.getRunningSessionsFromTool(toolId)
  }

  /**
   * Switch index position of session
   *
   * @param fromSessionId
   * @param toSessionId
   */
  switchSessionPosition(fromSessionId: string, toSessionId: string) {
    const fromIndex = this.sessions.findIndex((session) => session.sessionId === fromSessionId)
    const toIndex = this.sessions.findIndex((session) => session.sessionId === toSessionId)

    // Remove the item from the original index
    const removedItem = this.sessions.splice(fromIndex, 1)[0]

    // Insert the removed item at the new index
    this.sessions.splice(toIndex, 0, removedItem)
  }

  /**
   *
   * @param toolSession
   * @param newSessionName
   */
  async renameSession(toolSession: ToolSession, newSessionName: string) {
    void this.detachSessionSequence(toolSession)

    /**
     * Set session name to actual tool
     */
    const retrievedTool = await this.getToolFromStorage(toolSession)
    if (retrievedTool) {
      retrievedTool.setSessionName(newSessionName)
      void retrievedTool.hydrateStore()
    }

    /**
     * Set session name to tool session
     */
    this.setSessionName(toolSession, newSessionName)

    /**
     * Switch session order to itself for react to be able pickup the new state
     */
    this.switchSessionPosition(toolSession.sessionId, toolSession.sessionId)
  }

  /**
   * Set session name of tool session
   *
   * @param toolSession
   * @param sessionName
   */
  private setSessionName(toolSession: ToolSession, sessionName: string) {
    toolSession.sessionName = sessionName
  }
}

export const toolSessionStore = new ToolSessionStore()
