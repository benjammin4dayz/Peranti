import jsonata from "jsonata"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  jsonString: InputFieldsType.Code
  expression: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const jsonataTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "jsonata",
  name: "JSONata",
  description: "JSON query and transformation language",
  category: "JSON",
  inputFields: [
    {
      key: "expression",
      label: "Expression",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    },
    {
      key: "jsonString",
      label: "JSON",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Result",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  action: async({ inputValues }) => {
    const { jsonString, expression } = inputValues

    if (jsonString.trim().length === 0 || expression.trim().length === 0) {
      return { output: "" }
    }

    try {
      const jsonData = JSON.parse(jsonString)
      const jsonataExpression = jsonata(expression)
      const output = await jsonataExpression.evaluate(jsonData)

      return { output }
    } catch (e: any) {
      if (e?.message) {
        return { output: e?.message }
      }

      return { output: "Error" }
    }
  }
}

export default jsonataTool
