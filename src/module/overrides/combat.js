import {od6sutilities} from "../system/utilities.js";
import {od6sInitRoll} from "../apps/od6sroll.js";

export class OD6SCombat extends Combat {

    /**
     * Override rollInitiative to show custom dialog for characters.
     * This logic was previously in OD6SCombatTracker._onCombatantControl(),
     * but CombatTracker was converted to AppV2 in v13 and can no longer be
     * subclassed the same way. The Combat document class is unaffected.
     * @param {string[]} ids - Array of combatant IDs to roll initiative for
     * @param {object} [options] - Options for the roll
     * @returns {Promise<Combat>}
     */
    async rollInitiative(ids = [], options = {}) {
        // If a single combatant and they're a character, use the custom dialog
        if (ids.length === 1) {
            const combatant = this.combatants.get(ids[0]);
            if (combatant?.actor?.type === "character") {
                // Use the custom initiative roll dialog for characters
                const tracker = ui.combat;
                await od6sInitRoll._onInitRollDialog(tracker, combatant);
                return this;
            }
        }

        // For NPCs and batch rolls, apply GM roll hiding and use default behavior
        if (game.user.isGM && game.settings.get('od6s', 'hide-gm-rolls')) {
            options.messageOptions ??= {};
            options.messageOptions.rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
        }
        return super.rollInitiative(ids, options);
    }

    /**
     * Advance the combat to the next round
     * @returns {Promise<Combat>}
     */
    async nextRound() {
        // Handle auto-explosive rolls if end-of-round is set
        if(game.settings.get('od6s','auto_explosive') ** game.settings.get('od6s','explosive_end_of_round')) {
            await od6sutilities.detonateExplosives(this);
        }

        let turn = this.turn === null ? null : 0; // Preserve the fact that it's no-one's turn currently.
        if ( this.settings.skipDefeated && (turn !== null) ) {
            turn = this.turns.findIndex(t => !t.isDefeated);
            if (turn === -1) {
                ui.notifications.warn("COMBAT.NoneRemaining", {localize: true});
                turn = 0;
            }
        }
        let advanceTime = Math.max(this.turns.length - this.turn, 0) * CONFIG.time.turnTime;
        advanceTime += CONFIG.time.roundTime;
        let nextRound = this.round + 1;

        // Update the document, passing data through a hook first
        const updateData = {round: nextRound, turn};
        const updateOptions = {advanceTime, direction: 1};
        Hooks.callAll("combatRound", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }

}
