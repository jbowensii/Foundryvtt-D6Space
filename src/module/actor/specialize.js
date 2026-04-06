import OD6S from "../config/config-od6s.js";
import {od6sutilities} from "../system/utilities.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class SpecializeDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        classes: ["od6s", "dialog"],
        tag: "form",
        position: { width: 400, height: "auto" },
        window: { title: "OD6S.CREATE_SPECIALIZATION" },
        form: { handler: SpecializeDialog.#onSubmit, closeOnSubmit: true }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/actor/common/specialize.html" }
    };

    constructor(options = {}) {
        super(options);
        this.newItemData = options.newItemData;
        this.actorSheet = options.actorSheet;
        this.skillId = options.skillId;
    }

    async _prepareContext(options) {
        return this.newItemData;
    }

    _onRender(context, options) {
        this.element.querySelectorAll('.freeadvancecheckbox').forEach(el => {
            el.addEventListener('change', async () => {
                /* Whenever this is toggled, reset cpcost */
                this.newItemData.freeadvance = !(this.newItemData.freeadvance);
                if (this.newItemData.freeadvance) {
                    this.newItemData.cpcost = 0;
                } else {
                    this.newItemData.cpcost = this.newItemData.originalcpcost;
                }
                this.render();
            });
        });

        this.element.querySelectorAll('.specializationname').forEach(el => {
            el.addEventListener('change', async ev => {
                this.newItemData.specname = ev.target.value;
                this.render();
            });
        });

        this.element.querySelectorAll('.dice').forEach(el => {
            el.addEventListener('change', async ev => {
                this.newItemData.dice = ev.target.value;
                this.render();
            });
        });

        this.element.querySelectorAll('.pips').forEach(el => {
            el.addEventListener('change', async ev => {
                this.newItemData.pips = ev.target.value;
                this.render();
            });
        });
    }

    static async #onSubmit(event, form, formData) {
        await od6sspecialize.addSpecialization(
            this.actorSheet,
            this.newItemData,
            this.skillId
        );
    }
}

export class od6sspecialize {

    activateListeners(html)
    {
        super.activateListeners(html);
    }

    async _onSpecialize(event) {
        event.preventDefault();
        // Create the specialization item, tied to the correct attribute/skill
        const skill = this.actor.getEmbeddedDocument("Item",
            event.currentTarget.dataset.itemId, true);
        const derivedScore = (+skill.system.score) + (+this.actor.system.attributes[skill.system.attribute.toLowerCase()].score) + 1
        const cpCost = Math.floor(Math.floor(derivedScore/OD6S.pipsPerDice)/2);
        let newItemData = {
            specname: "",
            type: "specialization",
            skill: skill.name,
            attribute: skill.system.attribute,
            description: skill.system.description,
            score: derivedScore,
            cpcost: cpCost,
            originalcpcost: cpCost,
            actor: this.actor,
            freeadvance: false,
            dice: od6sutilities.getDiceFromScore(derivedScore - 1).dice,
            pips: od6sutilities.getDiceFromScore(derivedScore - 1).pips
        }

        new SpecializeDialog({
            newItemData: newItemData,
            actorSheet: this,
            skillId: skill.id,
            window: { title: game.i18n.localize("OD6S.CREATE_SPECIALIZATION") + "!" }
        }).render({ force: true });

    }

    static async addSpecialization(actorSheet, itemData, skillId, dice, pips) {
        // Can't have a blank name
        if (typeof(itemData.specname)==='undefined' || itemData.specname==="" ) {
            ui.notifications.error(game.i18n.localize("OD6S.ERR_SPECIALIZATION_NAME"));
            return;
        }

        // Can't spend what you don't have
        if (actorSheet.actor.type === "character") {
            if ((+itemData.cpcost) > (+actorSheet.actor.system.characterpoints.value) &&
                actorSheet.actor.system.sheetmode.value !== "freeedit") {
                ui.notifications.warn(game.i18n.localize("OD6S.NOT_ENOUGH_CP_SPEC"));
                return;
            }
        }

        // Create new specialization item, derived from original skill
        let newItemData = duplicate(actorSheet.actor.getEmbeddedDocument("Item",
            skillId, true));
        let base = 0;
        if(actorSheet.actor.type === "npc") {
            // Get the score from the form
            base = (+od6sutilities.getScoreFromDice(itemData.dice, itemData.pips)) -
                itemData.actor.system.attributes[itemData.attribute].base;
        } else {
            base = (+newItemData.system.base) + 1;
        }

        newItemData = {
            name: itemData.specname,
            type: itemData.type,
            system: {
                attribute: itemData.attribute,
                description: itemData.specname,
                base: base,
                time: itemData.time,
                skill: itemData.skill
            }
        }

        await actorSheet.actor.createEmbeddedDocuments('Item', [newItemData]);

        // Deduct character points
        if (actorSheet.actor.type === "character") {
            if ((+itemData.cpcost) > 0 &&  actorSheet.actor.system.sheetmode.value !== "freeedit") {
                const update = {};
                update.id = actorSheet.actor.id;
                update.system = {};
                update.system.characterpoints = {};
                update.system.characterpoints.value -= actorSheet.actor.system.characterpoints.value;
                await actorSheet.actor.update(update, {diff: true});
            }
        }

        actorSheet.render();
    }
}
