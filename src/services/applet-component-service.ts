import { open } from "@tauri-apps/api/dialog"
import toast from "react-hot-toast"

import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { FileInput } from "src/components/inputs/FileInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput"
import { TextInput } from "src/components/inputs/TextInput"
import { CodeOutput } from "src/components/outputs/CodeOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { MermaidOutput } from "src/components/outputs/MermaidOutput"
import { PintoraOutput } from "src/components/outputs/PintoraOutput"
import { ReactOutput } from "src/components/outputs/ReactOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput"
import { TextOutput } from "src/components/outputs/TextOutput"
import { SettingsView } from "src/components/settings/SettingsView"
import { Component } from "src/models/Component.js"
import { convertCRLFtoLF } from "src/utils/convert-crlf-to-lf.js"
import { createFileFromUint32Array } from "src/utils/create-file-from-uint32-array.js"
import { getFileNameFromPath } from "src/utils/get-file-name-from-path.js"

import { fileService } from "./file-service.js"

class AppletComponentService {
  /**
   * List of input components
   */
  readonly inputs = {
    Checkbox: new Component({
      component: CheckboxInput
    }),

    TextArea: new Component({
      component: TextAreaInput,
      copyAs: "text",
      readFileMimes: ["text/*", "application/json"],
      readFileAs: "text"
    }),

    Text: new Component({
      component: TextInput,
      batchComponent: "Code",
      copyAs: "text"
    }),

    Select: new Component({
      component: SelectInput
    }),

    Switch: new Component({
      component: SwitchInput
    }),

    Run: new Component({
      component: RunInput
    }),

    File: new Component({
      component: FileInput,
      readFileMimes: ["*"],
      readFileAs: "file"
    }),

    Code: new Component({
      component: CodeInput,
      copyAs: "text",
      readFileMimes: ["text/*", "application/json"],
      readFileAs: "text"
    })
  }

  /**
   * List of ouptut components
   */
  readonly outputs = {
    Code: new Component({
      component: CodeOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    Diff: new Component({
      component: DiffOutput
    }),

    File: new Component({
      component: FileOutput
    }),

    GridStat: new Component({
      component: GridStatOutput
    }),

    IFrame: new Component({
      component: IFrameOutput
    }),

    Image: new Component({
      component: ImageOutput,
      saveAs: "image"
    }),

    Markdown: new Component({
      component: MarkdownOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    TextArea: new Component({
      component: TextAreaOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    Text: new Component({
      component: TextOutput,
      batchComponent: "Code",
      copyAs: "text",
      saveAs: "text"
    }),

    Settings: new Component({
      component: SettingsView
    }),

    Mermaid: new Component({
      component: MermaidOutput
    }),

    Pintora: new Component({
      component: PintoraOutput
    }),

    React: new Component({
      component: ReactOutput
    })
  }

  /**
   * Get input component or its batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getInputComponent(componentName: keyof typeof this.inputs, isBatchComponent: boolean = false) {
    const inputComponent = this.inputs[componentName]
    const batchInputComponent = this.inputs[inputComponent.batchComponent as keyof typeof this.inputs]

    return isBatchComponent ? batchInputComponent : inputComponent
  }

  /**
   * Get output component or its batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getOutputComponent(componentName: keyof typeof this.outputs, isBatchComponent: boolean = false) {
    const outputComponent = this.outputs[componentName]
    const batchOutputComponent = this.outputs[outputComponent.batchComponent as keyof typeof this.outputs]

    return isBatchComponent ? batchOutputComponent : outputComponent
  }

  /**
   * Read file as content based on component type
   *
   * @param component
   * @param filePath
   * @returns
   */
  async readFileFromComponent(component: Component, filePath: string) {
    const readFileAs = component.readFileAs
    const fileName = getFileNameFromPath(filePath)

    try {
      if (readFileAs === "text") {
        const fileContent = await fileService.readFileAsText(filePath)
        return convertCRLFtoLF(fileContent)
      } else if (readFileAs === "file") {
        const file = await fileService.readFileAsBinary(filePath)
        return createFileFromUint32Array(file, getFileNameFromPath(filePath))
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} as ${readFileAs}`)
    }
  }

  /**
   * Open OS file picker / manager to choose file, and open the file as content
   * based on component type
   *
   * @param component
   * @returns
   */
  async openFileAndReadFromComponent(component: Component) {
    const selectedFilePath = await open()

    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await this.readFileFromComponent(component, selectedFilePath)
    }
  }
}

export const appletComponentService = new AppletComponentService()
