#!/usr/bin/env node
/* 测量学局劲工具 · 网页轻量版
   把目录版打包成一个自包含的 HTML 文件。
   用法：node tools/build-single.js [--out 文件路径] */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "dist", "测量学局劲-轻量版.html");
const SINGLE_NAME = "测量学局劲-轻量版.html";

function fail(message) {
  console.error("[build-single] " + message);
  process.exit(1);
}

function parseArgs(argv) {
  let out = DEFAULT_OUT;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      if (!argv[i + 1]) fail("--out 需要一个文件路径。");
      out = path.resolve(argv[i + 1]);
      i += 1;
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log("用法：node tools/build-single.js [--out 文件路径]");
      process.exit(0);
    } else {
      fail("未知参数：" + argv[i]);
    }
  }
  return { out };
}

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function inlineJs(code) {
  return code.replace(/<\/script/gi, "<\\/script");
}

function inlineCss(code) {
  return code.replace(/<\/style/gi, "<\\/style");
}

function checkScripts() {
  fs.readdirSync(path.join(ROOT, "assets"))
    .filter((name) => /\.js$/i.test(name))
    .forEach(function (name) {
      const file = path.join(ROOT, "assets", name);
      try {
        execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
      } catch (err) {
        const detail = err && err.stderr ? String(err.stderr) : String(err);
        fail("语法检查失败：" + file + "\n" + detail);
      }
    });
}

const README_CSS = `
#titlebar > .readme-btn {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-2);
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
}
#titlebar > .readme-btn:hover { background: var(--surface-hover); color: var(--ink); border-color: var(--line-strong); }
#titlebar > .readme-btn:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 1px; }
#readme-dialog { border: 0; padding: 0; background: transparent; width: 100vw; max-width: 100vw; height: 100vh; max-height: 100vh; margin: 0; color: var(--ink); }
#readme-dialog[open] { display: flex; align-items: center; justify-content: center; }
#readme-dialog::backdrop { background: rgba(15, 23, 42, 0.48); backdrop-filter: blur(2px); }
.readme-panel { width: min(880px, calc(100vw - 32px)); max-height: min(88vh, 920px); display: flex; flex-direction: column; background: var(--paper); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.3); overflow: hidden; }
.readme-head { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line); background: var(--shell-2); }
.readme-head-text { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.readme-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; color: var(--muted); }
#readme-title { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.3; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.readme-version { margin-left: auto; flex: 0 0 auto; font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }
.readme-close { flex: 0 0 auto; width: 32px; height: 32px; border: 1px solid var(--line); border-radius: 999px; background: var(--paper); color: var(--ink-2); font-size: 20px; line-height: 1; cursor: pointer; display: grid; place-items: center; }
.readme-close:hover { background: var(--surface-hover); color: var(--ink); }
.readme-close:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 1px; }
.readme-body { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 18px 24px 28px; font-size: 14px; line-height: 1.75; color: var(--ink-2); user-select: text; -webkit-user-select: text; overscroll-behavior: contain; }
.readme-body > :first-child { margin-top: 0; }
.readme-body h1, .readme-body h2, .readme-body h3, .readme-body h4 { color: var(--ink); line-height: 1.35; margin: 1.4em 0 0.5em; }
.readme-body h1 { font-size: 20px; }
.readme-body h2 { font-size: 17px; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
.readme-body h3 { font-size: 15px; }
.readme-body p { margin: 0 0 0.9em; }
.readme-body ul, .readme-body ol { margin: 0 0 1em; padding-left: 1.5em; }
.readme-body li { margin: 0.25em 0; }
.readme-body code { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: 0.92em; background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: 0.08em 0.32em; }
.readme-body pre { margin: 0 0 1em; padding: 12px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; overflow: auto; }
.readme-body pre code { border: 0; padding: 0; background: transparent; font-size: 12.5px; line-height: 1.6; }
.readme-body table { width: 100%; border-collapse: collapse; margin: 0 0 1.2em; font-size: 13px; }
.readme-body th, .readme-body td { border: 1px solid var(--line); padding: 7px 9px; text-align: left; vertical-align: top; }
.readme-body th { background: var(--surface-hover); color: var(--ink); font-weight: 600; }
.readme-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }
.readme-body blockquote { margin: 0 0 1em; padding: 0.2em 0 0.2em 14px; border-left: 3px solid var(--line-strong); color: var(--muted); }
.readme-body hr { border: 0; border-top: 1px solid var(--line); margin: 1.4em 0; }
@media (max-width: 720px) {
  #titlebar > .readme-btn { padding: 0 9px; font-size: 10.5px; letter-spacing: 0.04em; }
  .tabs { overflow-x: auto; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .readme-panel { width: calc(100vw - 16px); max-height: 92vh; border-radius: 12px; }
  .readme-body { padding: 14px 16px 22px; }
  #readme-title { font-size: 15px; }
}
@media print {
  #readme-dialog, #titlebar > .readme-btn { display: none !important; }
}
`;

const README_JS_CODE = [
  '(function () {',
  '  var button = document.getElementById("readme-btn");',
  '  var dialog = document.getElementById("readme-dialog");',
  '  if (!button || !dialog) return;',
  '  var close = document.getElementById("readme-close");',
  '  function open() {',
  '    if (typeof dialog.showModal === "function") dialog.showModal();',
  '    else dialog.setAttribute("open", "");',
  '    var body = dialog.querySelector(".readme-body");',
  '    if (body) body.scrollTop = 0;',
  '  }',
  '  function shut() {',
  '    if (typeof dialog.close === "function") dialog.close();',
  '    else dialog.removeAttribute("open");',
  '  }',
  '  button.addEventListener("click", open);',
  '  if (close) close.addEventListener("click", shut);',
  '  dialog.addEventListener("click", function (event) {',
  '    if (event.target === dialog) shut();',
  '  });',
  '  document.addEventListener("keydown", function (event) {',
  '    if (event.key === "Escape" && dialog.hasAttribute("open")) {',
  '      event.preventDefault();',
  '      shut();',
  '    }',
  '  });',
  '})();'
].join("\n");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  const codes = [];
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, function (match, code) {
    codes.push("<code>" + code + "</code>");
    return "\u0000" + (codes.length - 1) + "\u0000";
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, function (match, label, url) {
    if (!/^(?:https?:\/\/|mailto:|#)/i.test(url)) {
      fail("README 含相对链接或不受支持的链接：" + url);
    }
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + "</a>";
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  out = out.replace(/\u0000(\d+)\u0000/g, function (match, index) {
    return codes[Number(index)];
  });
  return out;
}

function joinParagraph(lines) {
  let text = "";
  lines.forEach(function (line) {
    if (!text) {
      text = line;
      return;
    }
    const previous = text.slice(-1);
    const next = line.charAt(0);
    if (/[㐀-鿿]/.test(previous) && /[㐀-鿿]/.test(next)) text += line;
    else text += " " + line;
  });
  return text;
}

function splitTableRow(row) {
  let text = row.trim();
  if (text.charAt(0) === "|") text = text.slice(1);
  if (text.charAt(text.length - 1) === "|") text = text.slice(0, -1);
  return text.split("|").map(function (cell) {
    return cell.trim();
  });
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let paragraph = [];
  let i = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    out.push("<p>" + renderInline(joinParagraph(paragraph)) + "</p>");
    paragraph = [];
  }

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (/^\s*```/.test(line)) {
      flushParagraph();
      const language = line.trim().slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) fail("README 的代码块没有闭合。");
      i += 1;
      out.push(
        "<pre><code" + (language ? ' class="language-' + escapeHtml(language) + '"' : "") + ">" +
        escapeHtml(code.join("\n")) +
        "</code></pre>"
      );
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.*?)\s*$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      out.push("<h" + level + ">" + renderInline(heading[2]) + "</h" + level + ">");
      i += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      out.push("<hr>");
      i += 1;
      continue;
    }

    if (line.indexOf("|") >= 0 && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      const header = splitTableRow(line);
      const aligns = splitTableRow(lines[i + 1]).map(function (cell) {
        const left = cell.charAt(0) === ":";
        const right = cell.charAt(cell.length - 1) === ":";
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].indexOf("|") >= 0) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      function tableCell(tag, value, index) {
        const align = aligns[index] || "left";
        return "<" + tag + (align === "left" ? "" : ' style="text-align: ' + align + '"') + ">" +
          renderInline(value || "") + "</" + tag + ">";
      }
      let table = "<table><thead><tr>";
      header.forEach(function (cell, index) {
        table += tableCell("th", cell, index);
      });
      table += "</tr></thead><tbody>";
      rows.forEach(function (row) {
        table += "<tr>";
        header.forEach(function (cell, index) {
          table += tableCell("td", row[index], index);
        });
        table += "</tr>";
      });
      table += "</tbody></table>";
      out.push(table);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push("<li>" + renderInline(lines[i].replace(/^\s*[-*+]\s+/, "")) + "</li>");
        i += 1;
      }
      out.push("<ul>" + items.join("") + "</ul>");
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push("<li>" + renderInline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>");
        i += 1;
      }
      out.push("<ol>" + items.join("") + "</ol>");
      continue;
    }

    if (/^\s*>/.test(line)) {
      flushParagraph();
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      out.push("<blockquote><p>" + renderInline(joinParagraph(quote)) + "</p></blockquote>");
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }

  flushParagraph();
  return out.join("\n");
}

function takeReadmeTitle(markdown) {
  const match = markdown.match(/^\s*#\s+(.+?)\s*$/m);
  if (!match) return { title: "README", body: markdown };
  return {
    title: escapeHtml(match[1]),
    body: markdown.replace(match[0], "")
  };
}

function checkReadmeSource(markdown) {
  if (!markdown.trim()) fail("README.md 为空。");
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, "");
  const withoutCode = withoutFences.replace(/`[^`\n]*`/g, "");
  if (/!\[[^\]]*\]\([^)]*\)/.test(withoutCode)) {
    fail("README 不能包含图片：单文件版是离线文件，图片会失效。");
  }
  if (/<!--/.test(withoutCode)) {
    fail("README 含有 HTML 注释；单文件版只接受 Markdown。");
  }
  if (/<(?!https?:\/\/)[a-z][a-z0-9-]*\b/i.test(withoutCode)) {
    fail("README 含有 HTML 标签；单文件版只接受 Markdown。");
  }
  if (/^\s*\[[^\]]+\]:\s+\S+/m.test(withoutCode)) {
    fail("README 使用了引用式链接；请改成行内链接。");
  }
}

function readVersion() {
  try {
    const pkg = JSON.parse(read("package.json"));
    return pkg && pkg.version ? String(pkg.version) : "dev";
  } catch (err) {
    fail("package.json 解析失败：" + err.message);
  }
}

function injectReadmeButton(html) {
  const marker = "</nav>";
  const index = html.indexOf(marker);
  if (index < 0) fail("index.html 中找不到 </nav>。");
  const at = index + marker.length;
  const button = '\n    <button type="button" id="readme-btn" class="readme-btn" aria-haspopup="dialog" aria-controls="readme-dialog" title="查看 README（使用说明）">README</button>';
  return html.slice(0, at) + button + html.slice(at);
}

function buildReadmeBlock(bodyHtml, title, version) {
  return [
    '<dialog id="readme-dialog" class="readme-dialog" aria-labelledby="readme-title">',
    '  <div class="readme-panel">',
    '    <header class="readme-head">',
    '      <div class="readme-head-text">',
    '        <span class="readme-kicker">README</span>',
    '        <h2 id="readme-title">' + title + "</h2>",
    '      </div>',
    '      <span class="readme-version">v' + escapeHtml(version) + "</span>",
    '      <button type="button" id="readme-close" class="readme-close" aria-label="关闭 README" title="关闭">×</button>',
    '    </header>',
    '    <div class="readme-body" tabindex="0">',
    bodyHtml,
    '    </div>',
    '  </div>',
    '</dialog>'
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const out = args.out;
  if (out === ROOT || out === path.parse(out).root) fail("拒绝写入：" + out);

  checkScripts();

  const markdown = read("README.md");
  checkReadmeSource(markdown);
  const parsed = takeReadmeTitle(markdown);
  const version = readVersion();
  try {
    new vm.Script(README_JS_CODE);
  } catch (err) {
    fail("README 弹窗脚本语法错误：" + err.message);
  }
  const readmeBody = renderMarkdown(parsed.body);

  let html = read("index.html");
  const themeTag = '<script src="assets/theme.js"></script>';
  const styleTag = '<link rel="stylesheet" href="assets/style.css">';
  if (html.indexOf(themeTag) < 0) fail("index.html 中找不到 theme.js。");
  if (html.indexOf(styleTag) < 0) fail("index.html 中找不到 style.css。");

  html = html.replace(themeTag, "<script>\n" + inlineJs(read("assets/theme.js")) + "\n</script>");
  html = html.replace(styleTag, "<style>\n" + inlineCss(read("assets/style.css")) + "\n</style>");
  html = html.replace(/<script src="assets\/([^"]+)"><\/script>/g, function (match, name) {
    const file = path.join(ROOT, "assets", name);
    if (!fs.existsSync(file)) fail("缺少脚本：" + name);
    return "<script>\n" + inlineJs(fs.readFileSync(file, "utf8")) + "\n</script>";
  });

  if (/<(?:script|link)\b[^>]*(?:src|href)="assets\//i.test(html)) {
    fail("仍有指向 assets/ 的外部引用。");
  }

  html = injectReadmeButton(html);
  if (html.indexOf('id="readme-btn"') < 0) fail("README 按钮注入失败。");
  const headEnd = html.lastIndexOf("</head>");
  if (headEnd < 0) fail("index.html 中找不到 </head>。");
  html = html.slice(0, headEnd) + '<style id="readme-style">\n' + README_CSS + "\n</style>\n" + html.slice(headEnd);

  const license = read("LICENSE");
  if (/<\/script/i.test(license)) fail("LICENSE 含有 </script，无法安全内嵌。");

  const header = "<!--\n" +
    "  测量学局劲工具 · 网页轻量版\n" +
    "  Copyright (c) 2026 JNGKZbird\n" +
    "  Licensed under Mulan PSL v2. Full license text is embedded at the end of this file.\n" +
    "-->";
  html = html.replace("<!doctype html>", "<!doctype html>\n" + header);

  const licenseBlock = '<script type="text/plain" id="license-text">\n' + license + "\n</script>";
  const readmeBlock = buildReadmeBlock(readmeBody, parsed.title, version) +
    '\n<script id="readme-script">\n' + README_JS_CODE + "\n</script>";
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) fail("index.html 中找不到 </body>。");
  html = html.slice(0, bodyEnd) + readmeBlock + "\n" + licenseBlock + "\n" + html.slice(bodyEnd);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");

  console.log("单文件版已生成：");
  console.log("  " + out);
  console.log("  " + (fs.statSync(out).size / 1024).toFixed(1) + " KiB");
  console.log("  README：" + parsed.title + "（v" + version + "，" + markdown.length + " 字符）");
}

main();
