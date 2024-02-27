import cronstrue from "cronstrue"

import { AppletConstructorModel } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const cronReadableTool = new AppletConstructorModel<InputFields, OutputFields>({
  appletId: "cron-parser",
  name: "CRON Parser",
  category: "Date Time",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' min-content"
  },
  inputFields: [
    {
      key: "input",
      label: "CRON Expression",
      component: "Text",
      defaultValue: "",
      allowBatch: true,
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Text",
      allowBatch: true
    }
  ],
  samples: [
    {
      name: "Sample 1",
      inputValues: {
        input: "* * * * *"
      }
    },
    {
      name: "Sample 2",
      inputValues: {
        input: "0 0/30 * * * *"
      }
    },
    {
      name: "Sample 3",
      inputValues: {
        input: "0 08-17 * * 5-0"
      }
    },
    {
      name: "Batch Sample",
      isBatchModeEnabled: true,
      inputValues: {
        input: "0 0 * * * *\n0 08-17 * * 5-0\n0 0/30 * * * *"
      }
    }
  ],
  action: ({ inputValues }) => {
    const { input } = inputValues
    if (input.trim().length === 0) {
      return { output: "" }
    }

    const inputLines = input.split("\n")

    const outputLines = inputLines.map((line) => {
      try {
        return cronstrue.toString(line)
      } catch {
        return "Invalid CRON Format"
      }
    })
    const output = outputLines.join("\n")

    return { output }
  }
})

export default cronReadableTool
