import * as p from "@clack/prompts"
import pc from "picocolors"

export async function initCommand(name?: string) {
  p.intro(pc.bgCyan(pc.black(" shipstack-agent ")))
  p.log.info("Init command — not yet implemented")
  p.outro("Done!")
}
