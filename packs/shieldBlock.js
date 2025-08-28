let actor = canvas.tokens.controlled[0]?.actor;
if (!actor) return;
if (actor.flags.shieldRaised) ui.notifications.info("Shield Block triggered!");
