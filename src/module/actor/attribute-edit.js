import {od6sutilities} from "../system/utilities.js";

export class od6sattributeedit {

    async _onAttributeEdit(event) {
        event.preventDefault();

        const attribute = event.currentTarget.dataset.attrname;
        const score = this.actor.system.attributes[attribute].base;

        /* Structure to pass to dialog */
        const editData = {
            score: score
        }

        const advanceTemplate = "systems/od6s/templates/actor/common/attribute-edit.html";
        const html = await renderTemplate(advanceTemplate, editData);

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.EDIT") + " " + event.currentTarget.dataset.label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.EDIT_ATTRIBUTE"),
                callback: (event2, button, dialog) => {
                    const form = button.form ?? dialog.element;
                    return od6sattributeedit.editAttributeAction(
                        form.querySelector("#dice").value,
                        form.querySelector("#pips").value,
                        event,
                        this.actor);
                }
            }
        });
    }

    static async editAttributeAction(dice, pips, event, actor) {
        event.preventDefault();
        const newScore = od6sutilities.getScoreFromDice(dice, pips);
        const attribute = event.currentTarget.dataset.attrname;

        const update = {};
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
