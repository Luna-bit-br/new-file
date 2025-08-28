let actor = canvas.tokens.controlled[0]?.actor;
if (!actor) return;
let allies = canvas.tokens.placeables.filter(t=>t.actor && t.actor!==actor && t.actor.system.attributes.hp.value>0 && canvas.grid.measureDistance(actor.token,t)<=15);
for (let ally of allies) {
  ally.actor.createEmbeddedDocuments("ActiveEffect",[{
    label:"Paragon Shield Bonus",
    icon:actor.items.find(i=>i.name.includes("Shield Implement"))?.img,
    duration:{rounds:1},
    changes:[
      {key:"system.attributes.ac.value",mode:2,value:actor.system.attributes.ac.value-10},
      {key:"system.attributes.saves.all.value",mode:2,value:actor.system.attributes.saves.all.value}
    ]
  }]);
}
ui.notifications.info("Applied Paragon Shield bonus to allies within 15ft");
