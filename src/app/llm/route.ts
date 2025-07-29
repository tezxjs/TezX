// app/api/docs/route.ts

import { NextRequest } from "next/server";
import docs from "../docs.json"; // ✅ Make sure it's in root or alias set in tsconfig

export function GET(req: NextRequest) {
    // 1️⃣ Header instructions
    const header = `\
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 Welcome to the LLM Documentation API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This endpoint serves all predefined documentation content at once.
Use this to:
- Integrate with an AI assistant (system prompts)
- Quickly scan all guides in one place
- Serve as offline or read-only reference

🔧 Format: Markdown
📁 Total Docs: ${docs?.files?.length ?? 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available Documents:
${docs?.files?.map((r, i) => ` ${i + 1}. ${r.name} (${req?.url}${r.path})`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // 2️⃣ Combine and format each doc block
    const content = docs?.files
        ?.map(
            (r, i) => `\
──────────────────────────────
📄 ${r.name}
📂 Folder: ${r.folder}
🛣️ Path: /docs/${r.path}
──────────────────────────────

${r.content.trim()}

`
        )
        .join("\n\n");

    // 3️⃣ Final combined response
    return new Response(header + content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
