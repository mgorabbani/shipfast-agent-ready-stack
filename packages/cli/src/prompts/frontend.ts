import * as p from "@clack/prompts"
import type { Frontend } from "../types.js"

export async function promptFrontend(): Promise<Frontend> {
  const frontend = await p.select({
    message: "Which frontend?",
    options: [
      { value: "expo", label: "Expo (Mobile)", hint: "iOS, Android, Web — React Native" },
      { value: "web", label: "Vite + React (Web)", hint: "SPA with Shadcn/ui + TailwindCSS" },
    ],
  })

  if (p.isCancel(frontend)) process.exit(0)
  return frontend as Frontend
}
