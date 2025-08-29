Hooks.once("ready", async () => {
  const pack = game.packs.get("pf2e-thaumaturge-shield.thaumaturge-shield-implement");

  if (!pack) return console.error("Compendium não encontrado!");

  const contents = await pack.getDocuments();
  if (contents.length > 0) return console.log("Feats já existem no compendium");

  const feats = [
    {
      name: "Initiate Benefit",
      type: "feat",
      system: {
        level: 1,
        traits: { value: [] },
        description: { value: `
You gain the Shield Block general feat. If your shield implement would be reduced to 0 Hit Points, it’s instead reduced to 1 Hit Point, its circumstance bonus to AC when you Raise a Shield is reduced by 1 (this can’t reduce the bonus below 0), and you can’t Shield Block with your shield implement until it loses the broken condition. You can still use your shield as an implement when it has the broken condition. At 5th level, whenever you Exploit Vulnerability, you can also Raise a Shield as a free action.
        ` }
      }
    },
    {
      name: "Adept Benefit",
      type: "feat",
      system: {
        level: 3,
        traits: { value: [] },
        description: { value: `
When you have your shield implement raised, you gain a status bonus to your saves against spells and other magic effects equal to your circumstance bonus to AC from your shield. In addition, damage you take as a result of a spell or magical effect while your Shield is Raised can trigger your Shield Block reaction, even if the damage isn’t physical.
        ` }
      }
    },
    {
      name: "Intensify Vulnerability",
      type: "feat",
      system: {
        level: 5,
        traits: { value: [] },
        description: { value: `
Every drop of blood you spill bolsters your shield. If you succeed at a Strike against the target of your Exploit Vulnerability, your shield regains a number of Hit Points equal to half your level. If your shield is already at full Hit Points, you instead increase your shield’s Hardness by your Charisma modifier until the beginning of your next turn. These effects aren’t cumulative if you hit with more than one Strike.
        ` }
      }
    },
    {
      name: "Paragon Benefit",
      type: "feat",
      system: {
        level: 9,
        traits: { value: [] },
        description: { value: `
When you have your shield implement raised, the circumstance bonuses from your shield (both to AC and to saves against spells and other magic effects) also apply to all your allies within 15 feet. You can use your Shield Block reaction in defense of yourself or any of your allies within 15 feet.
        ` }
      }
    }
  ];

  await pack.importDocuments(feats);
  console.log("Feats Thaumaturge Shield criados no compendium!");
});
