import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { ComponentLabel } from "src/components/common/ComponentLabel"
import { LargeInputWarning } from "src/components/common/LargeInputWarning"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./CodeOutput.scss"

interface CodeOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const CodeOutput: FC<CodeOutputProps> = (props) => {
  const { value, label = "Output", initialState, ...baseCodeMirrorProps } = props

  return (
    <div className="CodeOutput">
      <ComponentLabel label={label} />
      <LargeInputWarning input={value}>
        <BaseCodeMirror
          {...baseCodeMirrorProps}
          value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
          initialStateCodeMirror={initialState}
          readOnly
        />
      </LargeInputWarning>
    </div>
  )
}
