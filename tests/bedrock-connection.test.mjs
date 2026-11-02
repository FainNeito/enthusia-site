import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

test("connection copy buttons use the selected edition and show the copied address", async () => {
  const source = await readFile(new URL("../public/assets/enthusia.js", import.meta.url), "utf8");
  const start = source.indexOf("  function initCopyIp() {");
  const end = source.indexOf("  /* ------------------------------------------------------------------ tab rows", start);
  assert.ok(start >= 0 && end > start);
  let selected = "java";
  const copied = [];
  const title = {};
  const shown = {};
  const toast = { classList: { remove() {}, add() {} } };
  function button(mode) {
    return { getAttribute: () => mode, addEventListener(_event, listener) { this.click = listener; } };
  }
  const java = button("");
  const edition = button("edition");
  const bedrock = button("bedrock");
  const context = {
    cfg: { serverIp: "enthusia.net", bedrockIp: "bedrock.enthusia.net" },
    text: (value) => typeof value === "string" ? value.trim() : "",
    selectAll: (selector) => selector === "[data-copy-ip]" ? [java, edition, bedrock] : [shown],
    selectOne: (selector) => selector === "[data-toast]" ? toast
      : selector === "[data-toast-title]" ? title
        : selector === "[data-server-ip]" ? shown
          : { getAttribute: () => selected },
    copyText: (value) => { copied.push(value); return Promise.resolve(); },
    window: { clearTimeout() {}, setTimeout() {} }
  };
  vm.runInNewContext(`${source.slice(start, end)}\ninitCopyIp();`, context);
  java.click();
  edition.click();
  selected = "bedrock";
  edition.click();
  bedrock.click();
  assert.deepEqual(copied, ["enthusia.net", "enthusia.net", "bedrock.enthusia.net", "bedrock.enthusia.net"]);
  assert.equal(shown.textContent, "bedrock.enthusia.net");
});

test("join instructions show the Bedrock address for Bedrock and consoles", async () => {
  const html = await readFile(new URL("../public/join.html", import.meta.url), "utf8");
  const bedrock = html.split('data-switch-panel="device" data-value="bedrock"')[1];
  assert.ok(bedrock);
  const section = bedrock.split("</section>")[0];
  assert.match(section, /Enter bedrock\.enthusia\.net and port 19132/);
  assert.match(section, /data-copy-ip="bedrock"/);
  assert.doesNotMatch(section, />enthusia\.net</);
});
