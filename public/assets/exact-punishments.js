import { isWarning, punishmentReason, punishmentStatus, punishmentEnd } from "./punishment-presentation.js?v=2";

export function exactPunishmentCard(item, date, appealHref = null) {
  const preview = document.documentElement.hasAttribute("data-preview-root");
  const template = document.querySelector("#exact-punishment-" + (preview ? item.designIndex ?? 0 : 0));
  const node = template.content.firstElementChild.cloneNode(true);
  node.classList.add("punishment-record-card");
  if (preview && item.designIndex !== undefined) { node.querySelector("a")?.remove(); return node; }
  node.removeAttribute("data-b-class");
  const top = node.firstElementChild, identity = top.firstElementChild;
  top.classList.add("punishment-card-heading");
  identity.classList.add("punishment-card-identity");
  const head = document.createElement("img");
  head.className = "punishment-player-head";
  head.alt = "";
  head.width = 48; head.height = 48; head.loading = "lazy";
  const fallback = new URL("./market/player-head-base.svg", import.meta.url).href;
  head.src = item.player ? "https://mc-heads.net/avatar/" + encodeURIComponent(item.player) + "/48" : fallback;
  head.addEventListener("error", () => { head.src = fallback; }, { once: true });
  const person = document.createElement("div");
  person.className = "punishment-player";
  identity.replaceWith(person); person.append(head, identity);
  node.querySelector("h2").textContent = item.player || "Unknown player";
  node.querySelector("div>div>p").textContent = isWarning(item) ? "Warning" : item.punishmentType || "Punishment";
  const state = node.querySelector(".tag");
  state.textContent = punishmentStatus(item);
  state.className = "tag " + (!isWarning(item) && item.state === "ACTIVE" ? "tag-red" : "tag-plain");
  node.querySelector(":scope>p").textContent = punishmentReason(item);
  const values = [["Issued", date(item.issuedAt)]];
  values.push(["Issued by", item.issuedBy || "Unavailable"]);
  const end = punishmentEnd(item);
  values.push([end.label, end.value]);
  const meta = node.querySelector("dl");
  meta.replaceChildren();
  for (const [label, value] of values) {
    const group = document.createElement("div"), term = document.createElement("dt"), description = document.createElement("dd");
    term.textContent = label; description.textContent = value; group.append(term, description); meta.append(group);
  }
  const link = node.querySelector("a");
  if (!appealHref) link?.remove();
  else if (link) { link.href = appealHref; link.style.marginTop = "auto"; }
  return node;
}
