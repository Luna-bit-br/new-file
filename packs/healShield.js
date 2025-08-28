let actor = canvas.tokens.controlled[0]?.actor;
if (!actor) return;
let shield = actor.items.find(i=>i.name.includes("Shield Implement"));
let level = actor.system.details.level.value;
if (shield.system.hp.value < shield.system.hp.max)
  shield.update({"system.hp.value": Math.min(shield.system.hp.max,shield.system.hp.value + Math.floor(level/2))});
else
  actor.createEmbeddedDocuments("ActiveEffect",[{
    label:"Shield Hardness",
    icon:shield.img,
    duration:{rounds:1},
    changes:[{key:"system.attributes.shieldHardness.value",mode:2,value:actor.system.abilities.cha.mod}]
  }]);
