// scripts/make-compendium.js
// Gera packs/thaumaturge-shield-implement.db (JSON Lines) com feats do Shield Implement.

const fs = require("fs");
const path = require("path");

const PACKS_DIR = path.join(__dirname, "..", "packs");
const OUT_DB = path.join(PACKS_DIR, "thaumaturge-shield-implement.db");

/** util simples para _id curto e estável */
function id(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 40);
}

/** helper: grava um documento (1 linha JSON) no .db */
function writeDoc(fd, doc) {
  fs.writeSync(fd, JSON.stringify(doc) + "\n");
}

/** base PF2e Item (feat) */
function featBase(name, level, traits = ["thaumaturge", "implement", "shield"]) {
  return {
    _id: id(name),
    name,
    type: "feat",
    img: "icons/equipment/shield/heater-wooden-boss.webp",
    system: {
      category: "class",
      level: { value: level },
      traits: {
        value: traits,
        rarity: "common",
        custom: ""
      },
      prerequisites: { value: [] },
      featType: { value: "classfeature" },
      description: { value: "" },
      rules: []
    }
  };
}

/** Feat: Initiate Benefit */
function featInitiate() {
  const doc = featBase("Shield Implement (Initiate Benefit)", 1);
  doc.system.description.value = `
<p><strong>Initiate Benefit</strong></p>
<p>You gain the <em>Shield Block</em> general feat. If your shield implement would be reduced to 0 Hit Points, it’s instead reduced to 1 Hit Point, its circumstance bonus to AC when you Raise a Shield is reduced by 1 (this can’t reduce the bonus below 0), and you can’t Shield Block with your shield implement until it loses the broken condition. You can still use your shield as an implement when it has the broken condition.</p>
<p>At 5th level, whenever you <em>Exploit Vulnerability</em>, you can also <em>Raise a Shield</em> as a free action.</p>
<p><em>This feat asks you to choose which owned shield will be your implement.</em></p>`.trim();

  doc.system.rules = [
    {
      key: "ChoiceSet",
      flag: "shieldImplement",
      prompt: "Choose your Shield Implement (owned shield item)",
      rollOption: "shield-implement:selected",
      choices: { ownedItems: true, types: ["shield"] }
    },
    { key: "GrantItem", uuid: "Compendium.pf2e.feats-srd.Item.Shield Block" },
    {
      key: "ActiveEffectLike",
      mode: "override",
      path: "flags.pf2e.thaumShield.implementUuid",
      value: "@item.flags.pf2e.rulesSelections.shieldImplement"
    },
    {
      key: "RollOption",
      domain: "action:exploit-vulnerability",
      option: "thaum-shield:free-raise-shield",
      priority: 50,
      value: true,
      predicate: [{ gte: ["actor:level", 5] }]
    }
  ];
  return doc;
}

/** Feat: Adept Benefit */
function featAdept() {
  const doc = featBase("Shield Implement (Adept Benefit)", 7);
  doc.system.description.value = `
<p><strong>Adept Benefit</strong></p>
<p>When you have your shield implement raised, you gain a status bonus to your saves against spells and other magic effects equal to your circumstance bonus to AC from your shield.</p>
<p>In addition, damage you take as a result of a spell or magical effect while your Shield is Raised can trigger your Shield Block reaction, even if the damage isn’t physical.</p>
<p><em>Includes roll options/flags so macros can allow Shield Block vs. magical damage.</em></p>`.trim();

  doc.system.rules = [
    {
      key: "RollOption",
      domain: "all",
      option: "thaum-shield:raised",
      value: true,
      toggleable: true,
      label: "Shield Implement: Raised"
    },
    {
      key: "FlatModifier",
      selector: "saving-throw",
      type: "status",
      predicate: ["thaum-shield:raised", { or: ["magical", "spell"] }],
      value: "@actor.flags.pf2e.thaumShield.acCircumstance || 0"
    },
    {
      key: "RollOption",
      domain: "all",
      option: "thaum-shield:magic-block-enabled",
      value: true
    },
    {
      key: "ActiveEffectLike",
      mode: "upgrade",
      path: "actor.flags.pf2e.thaumShield.acCircumstance",
      value: 0
    }
  ];
  return doc;
}

/** Feat: Intensify Vulnerability */
function featIntensify() {
  const doc = featBase("Shield Implement (Intensify Vulnerability)", 9);
  doc.system.description.value = `
<p><strong>Intensify Vulnerability</strong></p>
<p>If you succeed at a Strike against the target of your Exploit Vulnerability, your shield regains Hit Points equal to half your level. If your shield is already at full Hit Points, you instead increase your shield’s Hardness by your Charisma modifier until the beginning of your next turn. These effects aren’t cumulative if you hit more than once.</p>
<p><em>This feat sets flags so a macro can apply healing/temporary Hardness directly to the chosen shield.</em></p>`.trim();

  doc.system.rules = [
    {
      key: "RollOption",
      domain: "attack-roll",
      option: "thaum-shield:intensify-on-hit",
      value: true
    },
    {
      key: "ActiveEffectLike",
      mode: "override",
      path: "flags.pf2e.thaumShield.implementUuid",
      value: "@item.flags.pf2e.rulesSelections.shieldImplement"
    },
    {
      key: "ActiveEffectLike",
      mode: "override",
      path: "flags.pf2e.thaumShield.applyTarget",
      value: "shield"
    }
  ];
  return doc;
}

/** Item de efeito “aura” aplicado em Paragon (chamado pela aura) */
function auraEffectDoc() {
  const doc = {
    _id: id("Shield Implement Aura Effect"),
    name: "Shield Implement — Aura Effect",
    type: "effect",
    img: "icons/magic/defensive/barrier-shield-dome-blue.webp",
    system: {
      tokenIcon: { show: true },
      level: { value: 17 },
      duration: { value: 1, unit: "rounds", sustained: false, expiry: "turn-start" },
      start: { value: 0, initiative: null },
      traits: { rarity: "common", value: ["aura", "thaumaturge", "implement", "shield"] },
      description: {
        value:
          "<p>While within 15 feet of the Thaumaturge with a raised shield implement, you gain the shield's circumstance bonus to AC and the Adept saves bonus vs. magical effects.</p>"
      },
      rules: [
        {
          key: "FlatModifier",
          selector: "ac",
          type: "circumstance",
          value: "@origin.flags.pf2e.thaumShield.acCircumstance || 0"
        },
        {
          key: "FlatModifier",
          selector: "saving-throw",
          type: "status",
          predicate: [{ or: ["magical", "spell"] }],
          value: "@origin.flags.pf2e.thaumShield.acCircumstance || 0"
        }
      ]
    }
  };
  return doc;
}

/** Feat: Paragon Benefit */
function featParagon(auraEffectUuid) {
  const doc = featBase("Shield Implement (Paragon Benefit)", 17, [
    "thaumaturge",
    "implement",
    "shield",
    "aura"
  ]);
  doc.system.description.value = `
<p><strong>Paragon Benefit</strong></p>
<p>When you have your shield implement raised, the circumstance bonuses from your shield (both to AC and saves vs. magical effects) also apply to allies within 15 feet. You can use your Shield Block reaction to defend yourself or an ally within 15 feet.</p>`.trim();

  doc.system.rules = [
    {
      key: "Aura",
      radius: 15,
      slug: "thaum-shield-aura",
      traits: ["thaumaturge", "implement", "shield"],
      effects: [{ uuid: auraEffectUuid }]
    },
    {
      key: "RollOption",
      domain: "all",
      option: "thaum-shield:can-block-for-allies",
      value: true
    }
  ];
  return doc;
}

/** MAIN */
(function main() {
  if (!fs.existsSync(PACKS_DIR)) fs.mkdirSync(PACKS_DIR, { recursive: true });
  const fd = fs.openSync(OUT_DB, "w");

  const aura = auraEffectDoc();
  writeDoc(fd, aura);

  const f1 = featInitiate();
  const f2 = featAdept();
  const f3 = featIntensify();
  const paragon = featParagon(
    `Compendium.pf2e-thaumaturge-shield.thaumaturge-shield-implement.Item.${aura._id}`
  );

  [f1, f2, f3, paragon].forEach((d) => writeDoc(fd, d));

  fs.closeSync(fd);

  console.log("✔ Compendium gerado em:", OUT_DB);
})();