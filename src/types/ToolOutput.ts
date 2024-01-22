import { type listOfOutputComponent } from "src/components/outputs"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof OutputComponentProps> : never

interface BaseOutput<K extends Record<string, any> = any> {
  /**
   * Field name that will be used as key in output map to show the value
   */
  key: keyof K

  /**
   * Label of field
   */
  label: string

  /**
   * Allow this field as batch operations
   */
  allowBatch?: boolean
}

interface ToolOutputText<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Text"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Text>
}

interface ToolOutputTextarea<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.TextArea>
}

interface ToolOutputGridStat<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.GridStat>
}

interface ToolOutputDiff<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Diff>
}

interface ToolOutputImage<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Image>
}

interface ToolOutputFile<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "File"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.File>
}

interface ToolOutputCode<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Code>
}

export type ToolOutput<K extends Record<string, string> = any> =
  ToolOutputText<K>
  | ToolOutputTextarea<K>
  | ToolOutputGridStat<K>
  | ToolOutputDiff<K>
  | ToolOutputImage<K>
  | ToolOutputFile<K>
  | ToolOutputCode<K>
