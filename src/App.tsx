import { clsx } from "clsx"
import { type ReactNode, useEffect } from "react"
import { Route, useLocation } from "wouter"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import { withProviders } from "./app/providers/index.js"
import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { useSelector } from "./hooks/useSelector.js"
import { HomePage } from "./pages/HomePage/HomePage.js"
import { ToolPage } from "./pages/ToolPage"
import { toolRunnerStore } from "./stores/toolRunnerStore.js"

/**
 * AppRoot
 *
 * @param param0 ReactNode
 * @returns
 */
const AppRoot = ({ children }: { children: ReactNode }) => {
  const theme = useSelector(() => interfaceStore.theme)

  return (
    <div className={clsx("AppRoot", theme)}>
      {children}
    </div>
  )
}

/**
 * App
 *
 * @returns ReactNode
 */
const AppMain = () => {
  return (
    <AppRoot>
      <AppRouteListener />
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />

        <div className="AppContent">
          <AppSidebarContent />

          <Route path="/welcome">
            <HomePage />
          </Route>
          <Route path="/">
            <ToolPage />
          </Route>
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}

const AppRouteListener = () => {
  const [, setLocation] = useLocation()
  const tool = useSelector(() => toolRunnerStore.getActiveTool())

  useEffect(() => {
    if (tool.toolId === "") {
      setLocation("/welcome", { replace: true })
    } else {
      setLocation("/", { replace: true })
    }
  }, [tool.sessionId])

  return null
}

export const App = withProviders(AppMain)
