import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"

import { type ToolInput } from "src/types/ToolInput.ts"

import { ToolInputRenderer } from "../ToolInputRenderer"

interface ToolAreaInputProps {
  toolSessionId: string
  components: ToolInput[]
  direction?: "horizontal" | "vertical"
  readOnly?: boolean
}

export const ToolAreaInput: FC<ToolAreaInputProps> = memo((props) => {
  const { toolSessionId, components, direction, readOnly } = props

  return (
    <form action="#" className={clsx("ToolAreaInput", direction)}>
      {components.map((component) => (
        <ToolInputRenderer
          key={toolSessionId.concat(component.key as any)}
          field={component.key as any}
          label={component.label}
          component={component.component}
          props={component.props}
          defaultValue={component.defaultValue}
          readOnly={readOnly}
        />
      ))}
    </form>
  )
}, fastDeepEqual)
