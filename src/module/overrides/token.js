import OD6S from "../config/config-od6s.js";

export class OD6SToken extends foundry.canvas.placeables.Token {

    /* Override */
    _canDrag(user, event) {
        if (!this.controlled) return false;
        if (!user.isGM && event.interactionData.object.actor.type === 'container') return false;
        const tool = game.activeTool;
        if ((tool !== "select") || game.keyboard.isModifierActive(foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.CONTROL)) return false;
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

        // Categorize new effects
        const tokenEffects = this.document.effects;
        const actorEffects = this.actor?.temporaryEffects || [];
        let overlay = {
            src: this.document.overlayEffect,
            tint: null
        };

        // Draw status effects
        if ( tokenEffects.length || actorEffects.length ) {
            const promises = [];


            // Draw actor effects first
            for ( const f of actorEffects ) {
                const status = [...f.statuses][0];
                if ( !f.icon ) continue;
                if(!this.isOwner && OD6S.hiddenStatusEffects.find(e=> e === status)) continue;
                const tint = Color.from(f.tint ?? null);
                if ( f.getFlag("core", "overlay") ) {
                    if ( overlay ) promises.push(this._drawEffect(overlay.src, overlay.tint));
                    overlay = {src: f.icon, tint};
                    continue;
                }
                promises.push(this._drawEffect(f.icon, tint));
            }

            // Next draw token effects
            for ( const f of tokenEffects ) {
                const status = [...f.statuses][0];
                if(!this.isOwner && OD6S.hiddenStatusEffects.find(e=> e === status)) continue;
                promises.push(this._drawEffect(f, null));
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


