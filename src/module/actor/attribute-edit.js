import {od6sutilities} from "../system/utilities.js";

export class od6sattributeedit {

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _onAttributeEdit(event) {
        event.preventDefault();

        const attribute = event.currentTarget.dataset.attrname;
        const score = this.actor.system.attributes[attribute].base;

        /* Structure to pass to dialog */
        let editData = {
            score: score
        }

        const advanceTemplate = "systems/od6s/templates/actor/common/attribute-edit.html";
        const html = await renderTemplate(advanceTemplate, editData);

        new Dialog({
            title: game.i18n.localize("OD6S.EDIT") + " " + event.currentTarget.dataset.label + "!",
            content: html,
            buttons: {
                submit: {
                    label: game.i18n.localize("OD6S.EDIT_ATTRIBUTE"),
                    callback: dlg => {
                        const dlgEl = dlg instanceof HTMLElement ? dlg : dlg[0];
                        return od6sattributeedit.editAttributeAction(
                        dlgEl.querySelector("#dice").value,
                        dlgEl.querySelector("#pips").value,
                        event,
                        this.actor);
                    }
                }
            },
            default: "submit"
        }).render(true);
    }

    static async editAttributeAction(dice, pips, event, actor) {
        event.preventDefault();
        const newScore = od6sutilities.getScoreFromDice(dice, pips);
        const attribute = event.currentTarget.dataset.attrname;

        let update = {};
        update.id = actor.id;
        update.system = {};
        update.system.attributes = {};
        update.system.attributes[attribute] = {};
        update.system.attributes[attribute].base = newScore;

        await actor.update(update, {"diff": true});
        //await actor.update({[system.attributes[attribute].score]: newScore});
        actor.render();
    }
}
