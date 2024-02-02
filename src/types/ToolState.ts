/**
 * Tool properties to put into storage
 */
export interface ToolState {
  toolId: string
  sessionId: string
  sessionName?: string
  sessionSequenceNumber?: number
  inputValues: any
  outputValues: any
  isBatchModeEnabled: boolean
  batchModeInputKey: string
  batchModeOutputKey: string
  createdAt: number
  actionRunCount: number
  isOutputValuesModified: boolean
  isInputValuesModified: boolean
  isDeleted: boolean
  inputFieldsState: Record<string, any>
  outputFieldsState: Record<string, any>
  isAutoRunAndFirstTime: boolean
}
