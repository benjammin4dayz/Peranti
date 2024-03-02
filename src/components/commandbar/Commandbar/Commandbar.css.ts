import { createGlobalTheme, createGlobalThemeContract, globalStyle } from "@vanilla-extract/css"

import { darkThemeClass } from "src/styles/themes/dark.theme.css"
import { lightThemeClass } from "src/styles/themes/light.theme.css"

const contract = createGlobalThemeContract({
  backgroundColor: "commandbar-background",
  cmdkShadow: "cmdk-shadow",
  gray1: "gray1",
  gray2: "gray2",
  gray3: "gray3",
  gray4: "gray4",
  gray5: "gray5",
  gray6: "gray6",
  gray7: "gray7",
  gray8: "gray8",
  gray9: "gray9",
  gray10: "gray10",
  gray11: "gray11",
  gray12: "gray12",
  grayA1: "grayA1",
  grayA2: "grayA2",
  grayA3: "grayA3",
  grayA4: "grayA4",
  grayA5: "grayA5",
  grayA6: "grayA6",
  grayA7: "grayA7",
  grayA8: "grayA8",
  grayA9: "grayA9",
  grayA10: "grayA10",
  grayA11: "grayA11",
  grayA12: "grayA12"
})

createGlobalTheme(lightThemeClass, contract, {
  backgroundColor: "#ffffff",
  cmdkShadow: "0 16px 20px rgb(0 0 0 / 20%)",
  gray1: "hsl(0, 0%, 99%)",
  gray2: "hsl(0, 0%, 97.3%)",
  gray3: "hsl(0, 0%, 95.1%)",
  gray4: "hsl(0, 0%, 93%)",
  gray5: "hsl(0, 0%, 90.9%)",
  gray6: "hsl(0, 0%, 88.7%)",
  gray7: "hsl(0, 0%, 85.8%)",
  gray8: "hsl(0, 0%, 78%)",
  gray9: "hsl(0, 0%, 56.1%)",
  gray10: "hsl(0, 0%, 52.3%)",
  gray11: "hsl(0, 0%, 43.5%)",
  gray12: "hsl(0, 0%, 9%)",
  grayA1: "hsla(0, 0%, 0%, 0.012)",
  grayA2: "hsla(0, 0%, 0%, 0.027)",
  grayA3: "hsla(0, 0%, 0%, 0.047)",
  grayA4: "hsla(0, 0%, 0%, 0.071)",
  grayA5: "hsla(0, 0%, 0%, 0.09)",
  grayA6: "hsla(0, 0%, 0%, 0.114)",
  grayA7: "hsla(0, 0%, 0%, 0.141)",
  grayA8: "hsla(0, 0%, 0%, 0.22)",
  grayA9: "hsla(0, 0%, 0%, 0.439)",
  grayA10: "hsla(0, 0%, 0%, 0.478)",
  grayA11: "hsla(0, 0%, 0%, 0.565)",
  grayA12: "hsla(0, 0%, 0%, 0.91)"
})

createGlobalTheme(darkThemeClass, contract, {
  backgroundColor: "rgba(22, 22, 22, 1)",
  cmdkShadow: "0 16px 20px rgb(0 0 0 / 20%)",
  gray1: "hsl(0, 0%, 8.5%)",
  gray2: "hsl(0, 0%, 11%)",
  gray3: "hsl(0, 0%, 13.6%)",
  gray4: "hsl(0, 0%, 15.8%)",
  gray5: "hsl(0, 0%, 17.9%)",
  gray6: "hsl(0, 0%, 20.5%)",
  gray7: "hsl(0, 0%, 24.3%)",
  gray8: "hsl(0, 0%, 31.2%)",
  gray9: "hsl(0, 0%, 43.9%)",
  gray10: "hsl(0, 0%, 49.4%)",
  gray11: "hsl(0, 0%, 62.8%)",
  gray12: "hsl(0, 0%, 93%)",
  grayA1: "hsla(0, 0%, 100%, 0)",
  grayA2: "hsla(0, 0%, 100%, 0.026)",
  grayA3: "hsla(0, 0%, 100%, 0.056)",
  grayA4: "hsla(0, 0%, 100%, 0.077)",
  grayA5: "hsla(0, 0%, 100%, 0.103)",
  grayA6: "hsla(0, 0%, 100%, 0.129)",
  grayA7: "hsla(0, 0%, 100%, 0.172)",
  grayA8: "hsla(0, 0%, 100%, 0.249)",
  grayA9: "hsla(0, 0%, 100%, 0.386)",
  grayA10: "hsla(0, 0%, 100%, 0.446)",
  grayA11: "hsla(0, 0%, 100%, 0.592)",
  grayA12: "hsla(0, 0%, 100%, 0.923)"
})

globalStyle("[cmdk-root]", {
  pointerEvents: "all",
  border: "1px solid var(--border-color)",
  maxWidth: "640px",
  maxHeight: "500px",
  width: "100%",
  height: "100%",
  background: contract.backgroundColor,
  borderRadius: "var(--border-radius)",
  overflow: "hidden",
  boxShadow: "var(--cmdk-shadow)",
  transition: "all 100ms",
  outline: "none",
  display: "flex",
  flexDirection: "column",
  transform: "translateY(10px)",
  opacity: 0
})

globalStyle("[cmdk-root].open", {
  transform: "translateY(0px)",
  opacity: 1
})
