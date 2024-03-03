import Papa from "papaparse"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  csvString: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.DataGrid
}

export const csvTableViewerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "csv-table-viewer",
  name: "CSV Viewer",
  description: "View CSV data format in pretty spreadsheet view",
  category: "CSV",
  inputFields: [
    {
      key: "csvString",
      label: "CSV String",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "DataGrid"
    }
  ],
  action: async({ inputValues }) => {
    const { csvString } = inputValues
    let data: any[] = []

    try {
      data = Papa.parse(csvString).data
      console.log({ data })
    } catch (error) {
      console.log(error)
    }

    return { output: JSON.stringify(data) }
  }
})
