import * as p from "@clack/prompts"
import path from "path"
import fs from "fs"

export async function promptProject(nameArg?: string): Promise<{ name: string; dir: string }> {
  const name = nameArg ?? (await p.text({
    message: "What is your project name?",
    placeholder: "my-app",
    validate: (v) => {
      if (!v) return "Project name is required"
      if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only"
    },
  })) as string

  if (p.isCancel(name)) process.exit(0)

  const dir = path.resolve(process.cwd(), name)
  if (fs.existsSync(dir)) {
    p.log.error(`Directory "${name}" already exists.`)
    process.exit(1)
  }

  return { name, dir }
}
