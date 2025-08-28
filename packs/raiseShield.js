let actor = canvas.tokens.controlled[0]?.actor;
if (!actor) return;
actor.setFlag("pf2e","shieldRaised",true);
ui.notifications.info("Shield Raised!");
