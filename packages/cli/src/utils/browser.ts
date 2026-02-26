import open from "open"
import * as p from "@clack/prompts"
import pc from "picocolors"

export async function openAndCollect(opts: {
  service: string
  url: string
  instructions: string[]
  envKey: string
  placeholder?: string
  validate?: (key: string) => Promise<string | undefined>
}): Promise<string> {
  p.log.step(pc.bold(`Setting up ${opts.service}`))
  for (const instruction of opts.instructions) {
    p.log.info(instruction)
  }

  const shouldOpen = await p.confirm({
    message: `Open ${opts.url} in browser?`,
    initialValue: true,
  })

  if (p.isCancel(shouldOpen)) process.exit(0)
  if (shouldOpen) await open(opts.url)

  const key = await p.text({
    message: `Paste your ${opts.envKey}:`,
    placeholder: opts.placeholder ?? "sk_...",
    validate: (v) => {
      if (!v.trim()) return `${opts.envKey} is required`
    },
  })

  if (p.isCancel(key)) process.exit(0)
  const keyStr = key as string

  if (opts.validate) {
    const spinner = p.spinner()
    spinner.start(`Validating ${opts.service} key...`)
    const error = await opts.validate(keyStr)
    if (error) {
      spinner.stop(`Validation failed: ${error}`)
      return openAndCollect(opts) // retry
    }
    spinner.stop(`${opts.service} key validated!`)
  }

  return keyStr
}

export async function openUrl(url: string) {
  await open(url)
}
