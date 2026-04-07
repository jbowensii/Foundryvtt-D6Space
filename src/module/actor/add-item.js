import {od6sutilities} from "../system/utilities.js";
import {OD6SItem} from "../item/item.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class OD6SAddItem extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "add-item",
        classes: ["od6s"],
        tag: "form",
        position: { width: 300, height: 300 },
        window: { title: "OD6S.ADD" },
        form: { handler: OD6SAddItem.#onSubmit, closeOnSubmit: true }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/actor/common/add-item.html" }
    };

    constructor(options = {}) {
        super(options);
        this.itemData = options.itemData;
        this.itemData.selected = 0;
        this.itemData.description = this.itemData?.items[0]?.system?.description;
        this.dice = 0;
        this.pips = 0;
        if (typeof(this.itemData.description) === 'undefined') this.itemData.description = "";
    }

    async _prepareContext(options) {
        return { object: this.itemData };
    }

    _onRender(context, options) {
        this.element.querySelectorAll('.select-skill').forEach(el => {
            el.addEventListener('change', ev => {
                this.itemData.selected = +ev.currentTarget.value;
                this.itemData.description = this.itemData.items[this.itemData.selected].system?.description;
                if (typeof(this.itemData.description) === 'undefined') this.itemData.description = "";
                this.setPosition({ height: "auto" });
                this.render();
            });
        });

        this.element.querySelectorAll('.addskill').forEach(el => {
            el.addEventListener('change', ev => {
                if(ev.target.id === 'dice') {
                    this.dice = +(ev.target.value);
                } else if(ev.target.id === 'pips') {
                    this.pips = +(ev.target.value);
                }
            });
        });
    }

    static async #onSubmit(event, form, formData) {
        const fd = formData.object;
        if (event.submitter.value === 'cancel') {
            return;
        }

        let actor;
        if(fd.token !== '') {
            const token = game.scenes.active.tokens.get(fd.token);
            actor = token.actor;
        } else {
            actor = await game.actors.get(fd.actor);
        }

        if (event.submitter.value === 'selected') {
            const items = JSON.parse(fd.serializeditems);

            if (items[fd['add-item']].type === "skill" || items[fd['add-item']].type === "specialization") {
                items[fd['add-item']].system.base = (od6sutilities.getScoreFromDice(this.dice, this.pips))
            }
            const _result = await actor.createEmbeddedDocuments('Item', [items[fd['add-item']]]);
            await actor.sheet.getData();
            this.itemData.caller.render(false);
        }

        if (event.submitter.value === 'empty') {
            const itemData = {};
            itemData.system = {};
            itemData.type = fd.type;

            if (itemData.type === "skill" || itemData.type === "specialization") {
                itemData.system.attribute = fd.attrname;
            }

            itemData.name = game.i18n.localize('OD6S.NEW_ITEM');
            const item = await new OD6SItem(itemData);
            await actor.createEmbeddedDocuments('Item', [item.toObject()]);
            this.itemData.caller?.render(false);
        }
    }
}

export default OD6SAddItem;
