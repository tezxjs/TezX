/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import ClipboardJS from "clipboard";
import hljs from "highlight.js";
// import "highlight.js/styles/docco.css"; // Syntax highlighting theme
import "highlight.js/styles/github-dark.css"; // Syntax highlighting theme

// import "highlight.js/styles/atom-one-light.css"; // Syntax highlighting theme

import { marked } from "marked";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

export default function MarkdownRenderer({ markdown }: { markdown: string }) {
  const htmlContent = useMemo(() => {
    const option = {
      highlight: (code: any, lang: any) => {
        try {
          const language = hljs.getLanguage(lang) ? lang : "bash";
          // if (!language) {
          //     return code;
          // }
          return hljs.highlight(code, { language }).value;
        } catch (error: any) {
          console.error(`Error highlighting code: ${error.message}`);
          return code; // Return unhighlighted code if an error occurs
        }
      },
      langPrefix: "hljs language-",
      gfm: true,
    };
    marked.setOptions(option as any);

    // marked.use({ extensions: [remarkGfm()] });

    return marked(markdown);
  }, [markdown]);

  // Add syntax highlighting effects
  useEffect(() => {
    hljs.highlightAll();
  }, [htmlContent]);

  useEffect(() => {
    const clipboard = new ClipboardJS(".copy-btn");
    clipboard.on("success", (e) => {
      toast.success("Code copied to clipboard!");
      // setTimeout(() => setCopySuccess(''), 2000);
    });
    clipboard.on("error", () => toast.error("Failed to copy"));
    return () => {
      clipboard.destroy();
    };
  }, []);

  // const updatedHtmlContent = (htmlContent as any)?.replace(
  //   /<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g,
  //   (match: any, classNames: any, codeContent: any) => {
  //     return `
  //       <div class="relative">
  //         <button
  //           class="absolute right-2 rounded top-2 btn btn-xs btn-outline copy-btn btn-primary"
  //           data-clipboard-text="${codeContent.trim()}"
  //         >
  //           <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18px" width="18px" xmlns="http://www.w3.org/2000/svg">
  //           <path fill="none" d="M0 0h24v24H0z">
  //           </path>
  //           <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
  //           </svg>
  //         </button>
  //         <pre><code class="border rounded-lg ${classNames}">${codeContent}</code></pre>
  //       </div>
  //     `;
  //   },
  // );
  const updatedHtmlContent = (htmlContent as any)?.replace(
    /<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g,
    (match: any, classNames: any, codeContent: any) => {
      return `
        <div class="relative">
          <button
            class="absolute right-2 rounded top-2 btn btn-xs btn-outline text-[white!important] copy-btn btn-primary"
            data-clipboard-text="${codeContent.trim()}"
          >
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18px" width="18px" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
            </svg>
          </button>
          <pre><code class="${classNames}">${codeContent}</code></pre>
        </div>
      `;
    },
  );

  // const updatedHtmlContent = (htmlContent as any)?.replace(
  //     /<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g,
  //     (match: any, classNames: any, codeContent: any) => {
  //         return `
  //     <div class="relative group">
  //       <button
  //         class="absolute right-2 rounded top-2 btn btn-xs btn-outline hidden group-hover:block copy-btn btn-accent"
  //         data-clipboard-text="${codeContent.trim()}"
  //       >
  //         <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
  //         <path fill="none" d="M0 0h24v24H0z">
  //         </path>
  //         <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
  //         </svg>
  //       </button>
  //       <pre><code class="${classNames}">${codeContent}</code></pre>
  //     </div>
  //   `;
  //     }
  // );

  return (
    <div
      className="prose xl:prose-lg max-w-full"
      dangerouslySetInnerHTML={{
        __html: updatedHtmlContent,
      }}
    />
  );
}
