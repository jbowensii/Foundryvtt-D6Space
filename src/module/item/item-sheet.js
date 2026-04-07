// OD6S Item sheet (AppV2) — renders per-type templates and handles dice/pip editing for skills, weapons, and armor.
import {od6sutilities} from "../system/utilities.js";
import OD6S from "../config/config-od6s.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ItemSheetV2 with some very simple modifications
 * @extends {HandlebarsApplicationMixin(ItemSheetV2)}
 */
export class OD6SItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["od6s", "sheet", "item"],
        position: { width: 520, height: 480 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        actions: {
            editTemplateAttribute: OD6SItemSheet.#onEditTemplateAttribute,
            addTemplateItem: OD6SItemSheet.#onAddTemplateItem,
            editTemplateItem: OD6SItemSheet.#onEditTemplateItem,
            deleteTemplateItem: OD6SItemSheet.#onDeleteTemplateItem,
            addEffect: OD6SItemSheet.#onAddEffect,
            editEffect: OD6SItemSheet.#onEditEffect,
            deleteEffect: OD6SItemSheet.#onDeleteEffect,
            addLabel: OD6SItemSheet.#onAddLabel,
            deleteLabel: OD6SItemSheet.#onDeleteLabel,
            addActorType: OD6SItemSheet.#onAddActorType,
            deleteActorType: OD6SItemSheet.#onDeleteActorType,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/item/item-skill-sheet.html" }
    };

    /** @override — use the correct template for this item's type */
    async _preparePartContext(partId, context) {
        context = await super._preparePartContext(partId, context);
        return context;
    }

    /**
     * @override — AppV2 workaround: bypass the static PARTS template cache so each item type
     * renders its own template (item-skill-sheet, item-weapon-sheet, etc.) instead of the
     * single template declared in PARTS.
     */
    async _renderHTML(context, options) {
        const template = `systems/od6s/templates/item/item-${this.document.type}-sheet.html`;
        // Pass the full context directly — no need for _preparePartContext spread
        const htmlString = await foundry.applications.handlebars.renderTemplate(template, context);
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        const element = doc.body.firstElementChild;
        return { form: element };
    }

    /* -------------------------------------------- */

    /** @override */
    async _prepareContext(options) {
        // Replicate the data structure from the old AppV1 ItemSheet.getData()
        const item = this.document;
        const source = item.toObject();
        const context = {
            item: item,
            source: source,
            system: item.system,
            flags: item.flags,
            config: CONFIG,
            editable: this.isEditable,
            owner: item.isOwner,
            limited: item.limited,
            options: this.options,
            cssClass: this.isEditable ? "editable" : "locked",
            type: item.type,
            name: item.name,
            img: item.img,
            // Provide effects list
            effects: item.effects?.contents || [],
            // Provide rollData for templates that use it
            rollData: item.getRollData ? item.getRollData() : {},
        };
        // Backward compat — templates may reference {{data.xxx}} from the AppV1 era
        context.data = context;
        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        // AppV2 workaround: manually init AppV1-style tab navigation since AppV2 doesn't do it
        if (!this._sheetTabs) {
            this._sheetTabs = new foundry.applications.ux.Tabs({
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "description",
                callback: () => {}
            });
        }
        this._sheetTabs.bind(this.element);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Change event listeners bound via native DOM
        this.element.querySelector('.editskill')?.addEventListener('change', this._editSkill.bind(this));
        this.element.querySelector('.editspecialization')?.addEventListener('change', this._editSpecialization.bind(this));
        this.element.querySelector('.editweapondamage')?.addEventListener('change', this._editWeaponDamage.bind(this));
        this.element.querySelector('.editweaponstun')?.addEventListener('change', this._editWeaponStunDamage.bind(this));
        this.element.querySelector('.editweaponfirecontrol')?.addEventListener('change', this._editWeaponFireControl.bind(this));
        this.element.querySelector('.editarmor')?.addEventListener('change', this._editArmor.bind(this));

        // Change listener for label editing
        this.element.querySelector('.label-edit')?.addEventListener('change', this._editLabel.bind(this));
    }

    /* -------------------------------------------- */
    /* Action Handlers (static, for click actions)  */
    /* -------------------------------------------- */

    static #onEditTemplateAttribute(event, target) {
        this._editTemplateAttribute(event);
    }

    static #onAddTemplateItem(event, target) {
        this._addTemplateItem(event);
    }

    static #onEditTemplateItem(event, target) {
        this._editTemplateItem(event);
    }

    static #onDeleteTemplateItem(event, target) {
        this._deleteTemplateItem(event);
    }

    static #onAddEffect(event, target) {
        this._addEffect();
    }

    static #onEditEffect(event, target) {
        this._editEffect(event);
    }

    static #onDeleteEffect(event, target) {
        this._deleteEffect(event);
    }

    static #onAddLabel(event, target) {
        this._addLabel(event);
    }

    static #onDeleteLabel(event, target) {
        this._deleteLabel(event);
    }

    static #onAddActorType(event, target) {
        this._addActorType();
    }

    static #onDeleteActorType(event, target) {
        this._deleteActorType(event);
    }

    /* -------------------------------------------- */
    /* Instance Methods                             */
    /* -------------------------------------------- */

    async _addActorType() {
        const data =
            {"actorTypes": game.od6s.OD6SActor.TYPES.filter(i => !this.item.system.actor_types.includes(i))};
        const addTemplate = "systems/od6s/templates/item/item-add-actor-type.html";
        const html = await renderTemplate(addTemplate, data);
        const label = game.i18n.localize("OD6S.ACTOR_TYPE")
        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.ADD") + " " + label },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.ADD"),
                callback: (event, button, dialog) => this._addActorTypeAction(
                    (button.form ?? dialog.element).querySelector("#actor-type").value
                )
            }
        });
    }

    async _addActorTypeAction(type) {
        const update = {};
        update.id = this.item.id;
        update.system = {};
        update.system.actor_types = this.item.system.actor_types;
        update.system.actor_types.push(type);
        await this.item.update(update);
    }

    async _deleteActorType(ev) {
        const type = ev.currentTarget.dataset.type;
        const update = {};
        update.id = this.item.id;
        update.system = {};
        update.system.actor_types = this.item.system.actor_types.filter(i => i !== type);
        // Prune template items that are no longer valid for the remaining actor types
        update.system.items = [];
        for (const i of this.item.system.items) {
            for (const t of update.system.actor_types) {
                if (OD6S.allowedItemTypes[t].includes(i.type)) {
                    update.system.items.push(i);
                    break;
                }
            }
        }
        await this.item.update(update);
    }

    async _addLabel(ev) {
        const itemData = {"id": this.item.id};
        const addTemplate = "systems/od6s/templates/item/item-add-label.html";
        const html = await renderTemplate(addTemplate, itemData);
        const label = game.i18n.localize("OD6S.LABEL");

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.ADD") + " " + label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.ADD"),
                callback: (event, button, dialog) => this._addLabelAction(
                    (button.form ?? dialog.element).querySelector("#key").value,
                    (button.form ?? dialog.element).querySelector("#value").value)
            }
        });
    }

    async _addLabelAction(key, value) {
        if (this.item.system.labels[key]) {
            ui.notifications.warn(game.i18n.localize("OD6S.LABEL_ALREADY_EXISTS"))
            return;
        }
        const update = {};
        update.id = this.item.id;
        update[`system.labels.${key}`] = value;

        await this.item.update(update);
    }

    async _editLabel(ev) {
        const update = {};
        update.id = this.item.id;
        update[`system.labels.${ev.currentTarget.dataset.key}`] = ev.target.value;
        await this.item.update(update);
    }

    async _deleteLabel(ev) {
        const update = {};
        update.id = this.item.id;
        update.system = this.item.system;
        // Foundry convention: `-=key` with null value deletes a key from an object
        update[`system.labels.-=${ev.currentTarget.dataset.key}`] = null;
        await this.item.update(update);
    }

    async _addEffect() {
        const name = game.i18n.localize('OD6S.NEW_ACTIVE_EFFECT')
        const effect = await this.document.createEmbeddedDocuments("ActiveEffect",
            [
                {name: name},
            ]
        );
        const sheet = new ActiveEffectConfig(effect[0]);
        sheet.render(true);
    }

    async _editEffect(ev) {
        const effect = this.document.getEmbeddedDocument("ActiveEffect", ev.currentTarget.dataset.effectId);
        const sheet = new ActiveEffectConfig(effect);
        sheet.render(true);
    }

    async _deleteEffect(ev) {
        await this.document.deleteEmbeddedDocuments("ActiveEffect", [ev.currentTarget.dataset.effectId]);
    }

    async _editSkill(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newScore;

        const oldDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.base);

        if (event.target.id === "dice") {
            newScore = od6sutilities.getScoreFromDice(event.target.value,
                oldDice.pips);
        } else if (event.target.id === "pips") {
            newScore = od6sutilities.getScoreFromDice(oldDice.dice,
                event.target.value);
        }
        if (this.actor != null) {
            const skills = this.actor.items.filter(i => i.type === "skill");
            const update = skills.map(() => {
                return {
                    id: itemId,
                    _id: itemId,
                    "system.base": newScore
                }
            })
            await this.actor.updateEmbeddedDocuments("Item", update);
            await this.item.sheet.render(false, {"log": true});
        } else {
            const update = {
                id: this.item.id,
                _id: this.item.id,
                "system.base": newScore
            }
            await this.item.update(update);
        }
    }

    async _editSpecialization(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newScore;

        const oldDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.score);

        if (event.target.id === "system.die.dice") {
            newScore = od6sutilities.getScoreFromDice(event.target.value,
                oldDice.pips);
        } else if (event.target.id === "system.die.pips") {
            newScore = od6sutilities.getScoreFromDice(oldDice.dice,
                event.target.value);
        }
        if (this.actor != null) {
            const skills = this.actor.items.filter(i => i.type === "specialization");
            const update = skills.map(() => {
                return {
                    id: itemId,
                    _id: itemId,
                    'system.base': newScore
                }
            })
            await this.actor.updateEmbeddedDocuments("Item", update);
            await this.item.sheet.render(false, {"log": true});
        } else {
            const update = {
                id: itemId,
                "system.base": newScore
            }
            await this.item.update(update, {'diff': true});
        }
    }

    async _editWeaponDamage(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newDamage;
        if (event.currentTarget.dataset.score === "") {
            event.currentTarget.dataset.score = 0;
        }
        const oldDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.score);

        if (event.target.id === "dice") {
            newDamage = od6sutilities.getScoreFromDice(event.target.value, oldDice.pips);
        } else if (event.target.id === "pips") {
            newDamage = od6sutilities.getScoreFromDice(oldDice.dice, event.target.value);
        }

        if (this.actor != null) {
            const updates = [];

            const update = {
                _id: itemId
            }
            update.system = {};
            update.system.damage = {};
            update.system.damage.score = newDamage;
            updates.push(update);

            if (this.actor.isToken) {
                if (this.actor.token.linked) {
                    await this.actor.updateEmbeddedDocuments("Item", updates);
                } else {
                    await this.actor.updateEmbeddedDocuments("Item", updates);
                }
            } else {
                await this.actor.updateEmbeddedDocuments("Item", updates);
            }
        } else {
            const update = {
                "system.damage.score": newDamage,
            }
            await this.item.update(update, {'diff': true});
        }
    }

    async _editWeaponStunDamage(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newDamage;
        if (event.currentTarget.dataset.score === "") {
            event.currentTarget.dataset.score = 0;
        }
        const oldDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.score);

        if (event.target.id === "dice") {
            newDamage = od6sutilities.getScoreFromDice(event.target.value, oldDice.pips);
        } else if (event.target.id === "pips") {
            newDamage = od6sutilities.getScoreFromDice(oldDice.dice, event.target.value);
        }

        if (this.actor != null) {
            const updates = [];

            const update = {
                _id: itemId
            }
            update.system = {};
            update.system.stun = {};
            update.system.stun.score = newDamage;
            updates.push(update);

            if (this.actor.isToken) {
                if (this.actor.token.linked) {
                    await this.actor.updateEmbeddedDocuments("Item", updates);
                } else {
                    await this.actor.updateEmbeddedDocuments("Item", updates);
                }
            } else {
                await this.actor.updateEmbeddedDocuments("Item", updates);
            }
        } else {
            const update = {
                "system.stun.score": newDamage,
            }
            await this.item.update(update, {'diff': true});
        }
    }

    async _editWeaponFireControl(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newScore;
        if (event.currentTarget.dataset.score === "") {
            event.currentTarget.dataset.score = 0;
        }
        const oldDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.score);

        if (event.target.id === "dice") {
            newScore = od6sutilities.getScoreFromDice(event.target.value, oldDice.pips);
        } else if (event.target.id === "pips") {
            newScore = od6sutilities.getScoreFromDice(oldDice.dice, event.target.value);
        }

        if (this.actor != null) {
            const weapons = this.actor.items.filter(i => i.type === "vehicle-weapon" || i.type === 'starship-weapon');
            const update = weapons.map(() => {
                return {
                    id: itemId,
                    _id: itemId,
                    "system.fire_control.score": newScore
                }
            })
            await this.actor.updateEmbeddedDocuments("Item", update);
        } else {
            const update = {
                id: this.item.id,
                "system.fire_control.score": newScore,
            }
            await this.item.update(update, {'diff': true});
        }
    }

    async _getGameItemsByType(type) {
        const compendia = await od6sutilities.getItemsFromCompendiumByType(type);
        const world = await od6sutilities.getItemsFromWorldByType(type);
        const data = compendia.concat(world);
        return data.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        })
    }

    async _addTemplateItem(event) {
        // Prepare a list of character template items that can be added
        const type = event.currentTarget.dataset.type;
        const templateItems = await Promise.all(await this._getGameItemsByType(type));
        const newItem = {
            templateItems: templateItems
        }

        const addTemplate = "systems/od6s/templates/item/item-template-add.html";
        const html = await renderTemplate(addTemplate, newItem);
        const label = game.i18n.localize(OD6S.itemLabels[event.currentTarget.dataset.type] || event.currentTarget.dataset.type);

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.ADD") + " " + label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.ADD"),
                callback: (event2, button, dialog) => this._addTemplateItemAction(
                    (button.form ?? dialog.element).querySelector("#itemname").value,
                    event.currentTarget.dataset.type,
                    this)
            }
        });
    }

    async _addTemplateItemAction(name, type, itemSheet) {
        if (this.item.type === 'item-group') {
            let allowed = false;
            for (const [key, items] of Object.entries(OD6S.allowedItemTypes)) {
                if (this.item.system.actor_types.includes(key)) {
                    for (const i of items) {
                        if (OD6S.templateItemTypes['item-group'].includes(i)) {
                            allowed = true;
                            break;
                        }
                    }
                }
            }
            if (!allowed) return;
        } else {
            if (!OD6S.templateItemTypes[this.item.type].includes(type)) return;
        }

        const item = await od6sutilities.getItemByName(name);
        let description;
        if (typeof (item) !== "undefined" && item !== null) {
            description = item.system.description;
        } else {
            description = "";
        }

        const newItem = {
            name: name,
            type: type,
            description: description
        }

        itemSheet.item.system.items.push(newItem);
        const update = {};
        update.id = itemSheet.id;
        update.system = itemSheet.item.system;
        await itemSheet.item.update(update, {diff: true});
        await this.render();
    }

    async _editTemplateItem(event) {
        const item = await this.item.system.items.find(i => i.name === event.currentTarget.dataset.name)
        const itemData = {
            name: event.currentTarget.dataset.name,
            type: event.currentTarget.dataset.type,
            description: item.description
        }

        const editTemplate = "systems/od6s/templates/item/item-template-item-edit.html";
        const html = await renderTemplate(editTemplate, itemData);
        const label = game.i18n.localize(OD6S.itemLabels[event.currentTarget.dataset.type] || event.currentTarget.dataset.type);

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.EDIT") + " " + label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.EDIT"),
                callback: (event2, button, dialog) => this._editTemplateItemAction(
                    (button.form ?? dialog.element).querySelector("#itemdesc").value,
                    event,
                    this)
            }
        });
    }

    async _editTemplateItemAction(desc, event, itemSheet) {
        const data = event.currentTarget.dataset;
        const newItem = {
            name: data.name,
            type: data.type,
            description: desc
        }

        const itemIndex = itemSheet.item.system.items.findIndex(
            i => i.name === data.name && i.type === data.type);
        itemSheet.item.system.items[itemIndex] = newItem;
        const update = {};
        update.id = itemSheet.item.id;
        update.system = itemSheet.item.system;
        await itemSheet.item.update(update, {diff: false});
        await this.render();
    }

    async _deleteTemplateItem(event) {
        const confirmText = "<p>" + game.i18n.localize("OD6S.DELETE_CONFIRM") + "</p>";
        await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("OD6S.DELETE") },
            content: confirmText,
            yes: {
                label: game.i18n.localize("OD6S.DELETE"),
                callback: async () => {
                    const itemIndex = this.item.system.items.findIndex(
                        i => i.name === event.currentTarget.dataset.name
                            && i.type === event.currentTarget.dataset.type);
                    this.item.system.items.splice(itemIndex, 1);
                    const update = {};
                    update.id = this.item.id;
                    update.system = this.item.system;
                    await this.item.update(update, {diff: true})
                    this.render();
                }
            },
            no: { label: game.i18n.localize("Cancel") }
        })
    }

    async _editTemplateAttribute(event) {
        const score = event.currentTarget.dataset.score;
        /* Structure to pass to dialog */
        const editData = {
            score: score
        }

        const editTemplate = "systems/od6s/templates/item/item-attribute-edit.html";
        const html = await renderTemplate(editTemplate, editData);

        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.EDIT") + " " + event.currentTarget.dataset.label + "!" },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.EDIT_ATTRIBUTE"),
                callback: (event2, button, dialog) => this._editAttributeAction(
                    (button.form ?? dialog.element).querySelector("#dice").value,
                    (button.form ?? dialog.element).querySelector("#pips").value,
                    event,
                    this)
            }
        });
    }

    async _editAttributeAction(dice, pips, event, itemSheet) {
        const newScore = od6sutilities.getScoreFromDice(dice, pips);
        const attrname = event.currentTarget.dataset.attrname;
        switch (event.currentTarget.dataset.sub) {
            case "base":
                itemSheet.item.system.attributes[attrname] = newScore;
                break;
            case "min":
                itemSheet.item.system.attributes[attrname].min = newScore;
                break;
            case "max":
                itemSheet.item.system.attributes[attrname].max = newScore;
                break;
        }
        const update = {};
        update.id = itemSheet.item.id;
        update.system = itemSheet.item.system;
        await itemSheet.item.update(update, {diff: true});
        this.render();
    }

    async _editArmor(event) {
        // Prepare item update
        const itemId = event.currentTarget.dataset.itemId;
        let newScore;
        const update = {};
        update.id = itemId;
        update._id = itemId;
        update.system = {};

        const oldPrDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.pr);
        const oldErDice = od6sutilities.getDiceFromScore(event.currentTarget.dataset.er);

        if (event.target.id === "prDice") {
            newScore = od6sutilities.getScoreFromDice(event.target.value, oldPrDice.pips);
            update.system.pr = newScore;
        } else if (event.target.id === "prPips") {
            newScore = od6sutilities.getScoreFromDice(oldPrDice.dice, event.target.value);
            update.system.pr = newScore;
        } else if (event.target.id === "erDice") {
            newScore = od6sutilities.getScoreFromDice(event.target.value, oldErDice.pips);
            update.system.er = newScore;
        } else if (event.target.id === "erPips") {
            newScore = od6sutilities.getScoreFromDice(oldErDice.dice, event.target.value);
            update.system.er = newScore;
        }

        if (this.actor != null) {
            await this.actor.updateEmbeddedDocuments("Item", [update]);
        } else {
            await this.item.update(update);
        }
    }

    /**
     * Override
     */
    async _onDrop(event) {
        event.preventDefault();
        // Try to extract the data
        let data;
        try {
            //data = JSON.parse(event.dataTransfer.getData('text/plain'));
            data = TextEditor.getDragEventData(event)
        } catch {
            return false;
        }

        // Handle different data types
        let item = '';
        switch (data.type) {
            case "Item":
                item = await this._onDropItem(event, data);
        }

        if (typeof (item) === 'undefined') {
            return;
        }

        // Determine if this item type is allowed on the template
        return await this._addTemplateItemAction(item.name, item.type, this);
    }

    async _onDropItem(event, data) {
        const item = await Item.implementation.fromDropData(data);

        switch (this.item.type) {
            case 'item-group':
            case 'species-template':
            case 'character-template':
                return item;

            case 'weapon':
                if (item.type === 'specialization') {
                    this.item.system.stats.specialization = item.system.name;
                    await this.item.update(this.item.system, {diff: true});
                }
        }

    }
}
