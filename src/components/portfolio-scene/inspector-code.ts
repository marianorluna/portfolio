import type { PortfolioData } from "@/types/portfolio";
import type { FloorUserData } from "@/utils/building-model";

type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];
type CodeLineIndent = "i1" | "i2";

function sanitizeCodeValue(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function toPascalCase(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function wrapAttr(
  attr: string,
  value: string,
  indent: CodeLineIndent,
): string {
  const safe = sanitizeCodeValue(value);
  return (
    `<div class="cl cl-${indent} cl-attr">` +
    `<span class="na">${attr}</span>` +
    ` <span class="p">=</span> ` +
    `<span class="s">"${safe}"</span>` +
    `</div>`
  );
}

export function buildFloorCodeHtml(
  d: FloorUserData,
  codeHtmlText: {
    jsonResponseComment: string;
    status: string;
    sync: string;
  }
): string {
  return (
    `<div class="cl">` +
    `<span class="p">&lt;</span><span class="nc">FloorNode</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">guid</span><span class="p">=</span><span class="s">"${d.id}"</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">level</span><span class="p">={</span><span class="m">${d.level}</span><span class="p">}</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">elevation</span><span class="p">={</span><span class="m">${d.elevation}</span><span class="p">}</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">properties</span><span class="p">={{</span>` +
    `</div>` +
    `<div class="cl cl-i2">` +
    `<span class="na">area_m2</span><span class="p">:</span> <span class="m">${d.area}</span><span class="p">,</span>` +
    `</div>` +
    `<div class="cl cl-i2">` +
    `<span class="na">material</span><span class="p">:</span> <span class="s">"${d.material}"</span>` +
    `</div>` +
    `<div class="cl cl-i1"><span class="p">}}</span></div>` +
    `<div class="cl"><span class="p">/&gt;</span></div><br><br>` +
    `<div class="cl"><span class="cm">${codeHtmlText.jsonResponseComment}</span></div>` +
    `<div class="cl">` +
    `<span class="kd">status</span>: <span class="s">"${codeHtmlText.status}"</span>` +
    `</div>` +
    `<div class="cl">` +
    `<span class="kd">sync</span>: <span class="s">"${codeHtmlText.sync}"</span>` +
    `</div>`
  );
}

export function buildProjectCodeHtml(
  project: ProjectItem,
  template: PortfolioData["ui"]["inspector"]["codeHtml"]["projectTemplate"]
): string {
  const componentName = toPascalCase(project.name);

  const stackItems = project.stack
    .map(t => `<span class="s">"${sanitizeCodeValue(t)}"</span>`)
    .join(`<span class="p">,</span> `);

  return (
    `<div class="cl"><span class="cm">// → ${sanitizeCodeValue(project.name)}</span></div>` +
    `<div class="cl">` +
    `<span class="kd">const</span> ` +
    `<span class="nc">${componentName}</span> ` +
    `<span class="p">=</span> ` +
    `<span class="p">()</span> ` +
    `<span class="kd">=&gt;</span> ` +
    `<span class="p">(</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="p">&lt;</span><span class="nc">${sanitizeCodeValue(template.componentTag)}</span>` +
    `</div>` +
    `<div class="cl cl-i2"><span class="cm">${sanitizeCodeValue(template.contextComment)}</span></div>` +
    wrapAttr(template.contextLabel, project.context, "i2") +
    wrapAttr(template.impactLabel, project.impact, "i2") +
    `<div class="cl cl-i2"><span class="cm">${sanitizeCodeValue(template.roleComment)}</span></div>` +
    wrapAttr(template.roleLabel, project.role, "i2") +
    wrapAttr(template.platformLabel, project.platform, "i2") +
    wrapAttr(template.scopeLabel, project.scope, "i2") +
    `<div class="cl cl-i2"><span class="cm">${sanitizeCodeValue(template.stackComment)}</span></div>` +
    `<div class="cl cl-i2">` +
    `<span class="na">${sanitizeCodeValue(template.stackLabel)}</span>` +
    ` <span class="p">=</span> <span class="p">{[</span>${stackItems}<span class="p">]}</span>` +
    `</div>` +
    `<div class="cl cl-i1"><span class="p">&gt;</span></div>` +
    `<div class="cl cl-i1">` +
    `<span class="p">&lt;/</span>` +
    `<span class="nc">${sanitizeCodeValue(template.componentTag)}</span>` +
    `<span class="p">&gt;</span>` +
    `</div>` +
    `<div class="cl"><span class="p">);</span></div>`
  );
}
