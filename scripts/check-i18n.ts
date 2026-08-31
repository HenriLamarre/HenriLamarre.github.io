/**
 * Lists every string that has English but no French yet.
 *
 * English is the source of truth: write it, and the site falls back to it
 * until a translation exists. This script is what stops a gap from shipping
 * unnoticed — run it before committing.
 *
 * Node 24 strips the types itself, so there is nothing to install:
 *   node scripts/check-i18n.ts
 */
import { NODES } from '../src/graph/data.ts'
import { blockTexts } from '../src/graph/blocks.ts'
import { UI } from '../src/i18n/ui.ts'
import type { Text } from '../src/i18n/types.ts'

type Gap = { where: string; english: string }

const gaps: Gap[] = []

function check(where: string, text: Text | undefined) {
  if (!text) return
  if (!text.fr?.trim()) gaps.push({ where, english: text.en })
}

for (const node of NODES) {
  check(`${node.id}.name`, node.name)
  check(`${node.id}.description`, node.description)
  node.body?.forEach((block, i) => {
    for (const [field, text] of blockTexts(block)) {
      check(`${node.id}.body[${i}].${block.type}.${field}`, text)
    }
  })
  check(`${node.id}.link.label`, node.link?.label)
}

for (const [key, text] of Object.entries(UI)) {
  check(`ui.${key}`, text)
}

if (gaps.length === 0) {
  console.log(`i18n: every string is translated (${NODES.length} nodes).`)
  process.exit(0)
}

console.log(`i18n: ${gaps.length} string(s) awaiting French\n`)
for (const gap of gaps) {
  console.log(`  ${gap.where}`)
  console.log(`    en: ${gap.english}`)
}
process.exit(1)
