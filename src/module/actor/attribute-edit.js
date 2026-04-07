import {od6sutilities} from "../system/utilities.js";

export class od6sattributeedit {

    async _onAttributeEdit(event) {
        event.preventDefault();

        const attribute = event.currentTarget.dataset.attrname;
        const label = event.currentTarget.dataset.label;
        const score = this.actor.system.attributes[attribute].base;

        const editData = { score };

        const advanceTemplate = "systems/od6s/templates/actor/common/attribute-edit.html";
        const html = await foundry.applications.handlebars.renderTemplate(advanceTemplate, editData);

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.EDIT") + " " + label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.EDIT_ATTRIBUTE"),
                callback: (event2, button, dialog) => {
                    const form = button.form ?? dialog.element;
                    return od6sattributeedit.editAttributeAction(
                        form.querySelector("#dice").value,
                        form.querySelector("#pips").value,
                        attribute,
                        this.actor);
                }
            }
        });
    }

    static async editAttributeAction(dice, pips, attribute, actor) {
        const newScore = od6sutilities.getScoreFromDice(dice, pips);
        await actor.update({[`system.attributes.${attribute}.base`]: newScore});
    }
}
