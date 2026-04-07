// OD6S Token override — restricts container dragging and filters hidden status effects from non-owners.
import OD6S from "../config/config-od6s.js";

export class OD6SToken extends foundry.canvas.placeables.Token {

    /* Override */
    _canDrag(user, event) {
        if (!this.controlled) return false;
        if (!user.isGM && event.interactionData.object.actor.type === 'container') return false;
        const tool = game.activeTool;
        if (!tool || (tool !== "select") || game.keyboard.isModifierActive(foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.CONTROL)) return false;
        const blockMove = game.paused && !game.user.isGM;
        return !this._movement && !blockMove;
    }

    async drawEffects() {
        const wasVisible = this.effects.visible;
        this.effects.visible = false;
        this.effects.removeChildren().forEach(c => c.destroy());
        this.effects.bg = this.effects.addChild(new PIXI.Graphics());
        this.effects.bg.visible = false;
        this.effects.overlay = null;

        // Use Actor effects only — TokenDocument#effects and #overlayEffect are deprecated (removed in v14)
        const actorEffects = this.actor?.temporaryEffects || [];
        let overlay = { src: null, tint: null };

        if ( actorEffects.length ) {
            const promises = [];

            // Draw actor effects, hiding wound status icons from non-owners
            for ( const f of actorEffects ) {
                const status = [...f.statuses][0];
                if ( !f.img ) continue;
                if(!this.isOwner && OD6S.hiddenStatusEffects.find(e=> e === status)) continue;
                const tint = Color.from(f.tint ?? null);
                if ( f.getFlag("core", "overlay") ) {
                    if ( overlay && overlay.src ) promises.push(this._drawEffect(overlay.src, overlay.tint));
                    overlay = {src: f.img, tint};
                    continue;
                }
                promises.push(this._drawEffect(f.img, tint));
            }

            await Promise.all(promises);
        }

        // Draw overlay effect
        this.effects.overlay = await this._drawOverlay(overlay.src, overlay.tint);
        this.effects.bg.visible = true;
        this.effects.visible = wasVisible;
        this._refreshEffects();
    }
}
