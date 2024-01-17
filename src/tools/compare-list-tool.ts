import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  listA: string
  listB: string
}

interface OutputFields {
  output: OutputFieldsType.Textarea
  onlyExistInputA: OutputFieldsType.Textarea
  onlyExistInputB: OutputFieldsType.Textarea
}

const compareListTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "compare-lines",
  name: "Compare List",
  category: "List",
  layoutSetting: {
    direction: "vertical",
    inputAreaDirection: "horizontal",
    outputAreaDirection: "horizontal"
  },
  inputFields: [
    {
      key: "listA",
      label: "List A",
      component: "Textarea",
      defaultValue: ""
    },
    {
      key: "listB",
      label: "List B",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "onlyExistInputA",
      label: "Only Exist In List A",
      component: "Textarea"
    },
    {
      key: "output",
      label: "Exist In Both List",
      component: "Textarea"
    },
    {
      key: "onlyExistInputB",
      label: "Only Exist In List B",
      component: "Textarea"
    }
  ],
  action: (inputParams) => {
    const { listA, listB } = inputParams

    const linesA = listA.split("\n")
    const linesB = listB.split("\n")

    const bothExist = linesA.filter(line => linesB.includes(line)).join("\n")
    const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join("\n")
    const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join("\n")

    return { output: bothExist, onlyExistInputA, onlyExistInputB }
  }
}

export default compareListTool
