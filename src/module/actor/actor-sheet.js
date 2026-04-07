import {od6sroll} from "../apps/od6sroll.js";
import {od6sInitRoll} from "../apps/od6sroll.js";
import {od6sadvance} from "./advance.js";
import {od6sspecialize} from "./specialize.js";
import {od6sattributeedit} from "./attribute-edit.js";
import {od6sutilities} from "../system/utilities.js";
import {OD6SAddCrew} from "./add-crew.js";
import {OD6SAddEmbeddedCrew} from "./add-embedded-crew.js";
import {OD6SAddItem} from "./add-item.js";
import OD6SItemInfo from "../apps/item-info.js";
import OD6S from "../config/config-od6s.js";
import OD6SCreateCharacter from "../apps/character-creation.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class OD6SActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["od6s", "sheet", "actor"],
        position: { width: 915, height: 800 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        actions: {}
    };

    static PARTS = {
        sheet: {
            template: "systems/od6s/templates/actor/common/actor-sheet.html",
            scrollable: [".sheet-body"]
        }
    };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        if (!options.parts?.length) {
            options.parts = ["sheet"];
        }
    }

    /**
     * Initialize tab navigation after first render.
     * AppV2 does not use the AppV1 Tabs helper automatically, so we
     * wire it up manually to preserve the existing template structure.
     */
    _initializeTabs() {
        if (this._sheetTabs) return;
        this._sheetTabs = new foundry.applications.ux.Tabs({
            navSelector: ".sheet-tabs",
            contentSelector: ".sheet-body",
            initial: "attributes",
            callback: () => {}
        });
    }

    /* -------------------------------------------- */

    /** @override */
    async _prepareContext(options) {
        const data = {
            actor: this.actor,
            source: this.actor.toObject(),
            system: this.actor.system,
            items: this.actor.items.map(i => {
                const itemObj = i.toObject();
                itemObj.id = i.id;
                itemObj.img = itemObj.img || CONST.DEFAULT_TOKEN;
                return itemObj;
            }),
            effects: this.actor.effects,
            owner: this.actor.isOwner,
            limited: this.actor.limited,
            editable: this.isEditable,
            cssClass: this.isEditable ? "editable" : "locked",
            config: CONFIG,
        };
        data.dtypes = ["String", "Number", "Boolean"];

        if (this.actor.type === 'character') {
            // Prepare items.
            this._prepareCharacterItems(data);
            this._setCommonFlags();
        } else if (this.actor.type === 'npc') {
            // Prepare items.
            this._prepareCharacterItems(data);
            this._setCommonFlags();
        } else if (this.actor.type === 'creature') {
            // Prepare items.
            this._prepareCharacterItems(data);
            this._setCommonFlags();
        } else if (this.actor.type === 'vehicle') {
            this._prepareVehicleItems(data);
        } else if (this.actor.type === 'starship') {
            this._prepareStarshipItems(data);
        } else if (this.actor.type === 'container') {
            this._prepareContainerItems(data);
        }

        data.items = data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        data.system = this.actor.system;

        if (this.actor.type !== 'container') {
            let attributes = [];
            for (const i in OD6S.attributes) {
                const entry = this.actor.system.attributes[i];
                entry.id = i;
                entry.sort = OD6S.attributes[i].sort;
                entry.active = OD6S.attributes[i].active;
                attributes.push(entry);
            }
            data.attrs = attributes.sort((a, b) => (a.sort) - (b.sort));
        }

        return data;
    }

    /** @override */
    _onFirstRender(context, options) {
        super._onFirstRender(context, options);
        // Set up drag-drop for AppV2
        this._createDragDropHandlers();
    }

    /**
     * Create drag-drop handlers for AppV2.
     * AppV2 does not automatically create DragDrop instances, so we
     * instantiate them ourselves and bind to the sheet element.
     */
    _createDragDropHandlers() {
        const dd = new foundry.applications.ux.DragDrop.implementation({
            dragSelector: "[data-drag]",
            dropSelector: null,
            permissions: {
                dragstart: () => this.actor.isOwner,
                drop: () => this.actor.isOwner
            },
            callbacks: {
                dragstart: this._onDragStart.bind(this),
                drop: this._onDrop.bind(this)
            }
        });
        dd.bind(this.element);
        this._dragDrop = [dd];
    }

    _setCommonFlags() {
        if (typeof (this.actor.getFlag('od6s', 'fatepointeffect')) === 'undefined') {
            this.actor.setFlag('od6s', 'fatepointeffect', false);
        }
        if (typeof (this.actor.getFlag('od6s', 'crew')) === 'undefined') {
            this.actor.setFlag('od6s', 'crew', '');
        }
        if (typeof (this.actor.getFlag('od6s', 'hasTakenTurn')) === 'undefined') {
            this.actor.setFlag('od6s', 'hasTakenTurn', false);
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} sheetData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;
        // Initialize containers.
        const gear = [];
        const skills = [];
        const specializations = [];
        const weapons = [];
        const armor = [];
        const advantages = [];
        const disadvantages = [];
        const specialabilities = [];
        const cybernetics = [];
        const manifestations = [];
        const actions = [];

        // Iterate through items, allocating to containers
        for (let i of sheetData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;
            // Append to gear.
            if (i.type === 'gear') {
                gear.push(i);
            }

            // Append to skills.
            else if (i.type === 'skill') {
                if (!OD6S.flatSkills &&
                    typeof (i.system.score) !== 'undefined' &&
                    typeof (i.system.attribute) !== 'undefined') {
                    if(!i.system.isAdvancedSkill) {
                        i.system.score = (+i.system.score) +
                            (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                    }
                }
                skills.push(i);
            }

            // Append to specializations
            else if (i.type === 'specialization') {
                if (!OD6S.flatSkills)
                    i.system.score = (+i.system.score) +
                        (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                specializations.push(i);
            }
            // Append to weapons
            else if (i.type === 'weapon') {
                weapons.push(i);
            } else if (i.type === 'armor') {
                armor.push(i);
            } else if (i.type === 'advantage') {
                advantages.push(i);
            } else if (i.type === 'disadvantage') {
                disadvantages.push(i);
            } else if (i.type === 'specialability') {
                specialabilities.push(i);
            } else if (i.type === "cybernetic") {
                cybernetics.push(i);
            } else if (i.type === "manifestation") {
                manifestations.push(i);
            } else if (i.type === "action") {
                actions.push(i);
            }
        }

        // Assign and return
        actorData.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.skills = skills.sort((a, b) => (a.sort) - (b.sort));
        actorData.specializations = specializations.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.armor = armor.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.advantages = advantages.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.disadvantages = disadvantages.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.specialabilities = specialabilities.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.cybernetics = cybernetics.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.manifestations = manifestations.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.actions = actions.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    _sortItems(items, sortType) {
        if(sortType === 'alpha') {
            return items.sort((a,b) => a.name.localeCompare(b.name));
        }
    }

    _resetSortToAlpha(items) {
        items = items.sort((a, b) => a.name.localeCompare(b.name));
        let sortNumber = 1000;
        for (const i in items) {
            items[i].sort = sortNumber;
            sortNumber = sortNumber + 500;
        }
        return items;
    }

    async _alphaSortAllItems() {
        const items = this._resetSortToAlpha(this.actor.items.contents);
        const updates = [];
        for (const i in items) {
            updates.push({
                _id: items[i]._id,
                sort: items[i].sort
            })
        }
        await this.actor.updateEmbeddedDocuments('Item', updates);
    }

    _prepareVehicleItems(sheetData) {
        const actorData = sheetData.actor;
        // Initialize containers.
        const vehicle_weapons = [];
        const vehicle_gear = [];
        const cargo_hold = [];
        const skills = [];
        const specializations = [];

        // Iterate through items, allocating to containers
        // let totalWeight = 0;
        for (let i of sheetData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;
            // Append to vehicle weapons
            if (i.type === 'skill') {
                if (!OD6S.flatSkills &&
                    typeof (i.system.score) !== 'undefined' &&
                    typeof (i.system.attribute) !== 'undefined') {
                    i.system.score = (+i.system.score) +
                        (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                }
                skills.push(i);
            }
            // Append to specializations
            else if (i.type === 'specialization') {
                if (!OD6S.flatSkills)
                    i.system.score = (+i.system.score) +
                        (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                specializations.push(i);
            } else if (i.type === 'vehicle-weapon') {
                vehicle_weapons.push(i);
            } else if (i.type === 'vehicle-gear') {
                vehicle_gear.push(i);
            } else if (i.type === 'armor' || i.type === 'weapon'
                || i.type === 'gear') {
                cargo_hold.push(i);
            }
        }

        // Assign and return
        actorData.vehicle_weapons = vehicle_weapons;
        actorData.vehicle_gear = vehicle_gear;
        actorData.cargo_hold = cargo_hold;
        actorData.skills = skills;
        actorData.specializations = specializations;
    }

    _prepareStarshipItems(sheetData) {
        const actorData = sheetData.actor;
        // Initialize containers.
        const starship_weapons = [];
        const starship_gear = [];
        const cargo_hold = [];
        const skills = [];
        const specializations = [];

        // Iterate through items, allocating to containers
        // let totalWeight = 0;
        for (let i of sheetData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;
            // Append to starship weapons
            if (i.type === 'skill') {
                if (!OD6S.flatSkills &&
                    typeof (i.system.score) !== 'undefined' &&
                    typeof (i.system.attribute) !== 'undefined') {
                    i.system.score = (+i.system.score) +
                        (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                }
                skills.push(i);
            }
            // Append to specializations
            else if (i.type === 'specialization') {
                if (!OD6S.flatSkills)
                    i.system.score = (+i.system.score) +
                        (+actorData.system.attributes[i.system.attribute.toLowerCase()].score);
                specializations.push(i);
            } else if (i.type === 'starship-weapon') {
                starship_weapons.push(i);
            } else if (i.type === 'starship-gear') {
                starship_gear.push(i);
            } else if (i.type === 'armor' || i.type === 'weapon'
                || i.type === 'gear') {
                cargo_hold.push(i);
            }
        }

        // Assign and return
        actorData.starship_weapons = starship_weapons;
        actorData.starship_gear = starship_gear;
        actorData.cargo_hold = cargo_hold;
        actorData.skills = skills;
        actorData.specializations = specializations;
    }

    _prepareContainerItems(sheetData) {
        if (!this.actor.isOwner) return;
        const actorData = sheetData.actor;

        // Initialize container.
        const container = [];

        for (let i of sheetData.items) {
            i.img = i.img || CONST.DEFAULT_TOKEN;
            container.push(i);
        }

        actorData.container = container;
    }


    /* -------------------------------------------- */

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        // Initialize and bind tab navigation for the existing template
        this._initializeTabs();
        this._sheetTabs.bind(this.element);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Alpha sort items
        this.element.querySelectorAll('.alpha-item-sort-button').forEach(el =>
            el.addEventListener('click', async ev => {
                await this._alphaSortAllItems();
                this.render();
            }));


        // Stun Tracker
        this.element.querySelectorAll('.track_stuns_counter').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                const update = {
                    system: {
                        stuns: {
                            value: 0
                        }
                    }
                }
                await this.actor.update(update);
                await this.render();
            }));

        // Embedded Pilot
        this.element.querySelectorAll('.embedded-pilot-add').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                const data = {};
                data.targets = game.collections.get('Actor').filter(a => a.type === 'npc' && !a.isToken);
                data.actor = this.actor.uuid;
                await new OD6SAddEmbeddedCrew({ crewData: data }).render({ force: true });
            }));

        this.element.querySelectorAll('.embedded-pilot-remove').forEach(el =>
            el.addEventListener('click', async ev => {
                // Remove skills/specs from the base actor
                let removeSkills = this.actor.skills.map(i=>i._id);
                removeSkills = removeSkills.concat(this.actor.specializations.map(i=>i._id));
                if(removeSkills.length > 0) {
                    await this.actor.deleteEmbeddedDocuments('Item', removeSkills);
                }

                //zero out attributes
                const update = {};
                update.system = {};
                for (let a in this.actor.system.attributes) {
                    update[`system.attributes.${a}.base`] = 0;
                    update[`system.embedded_pilot.actor`] = "";
                }
                await this.actor.update(update);
                this.render();
            }));


        // Character Creation
        this.element.querySelectorAll('.create-character').forEach(el =>
            el.addEventListener('click', async ev => {
                let newChar = new OD6SCreateCharacter({
                    actor: this.actor,
                    templates: od6sutilities.getAllItemsByType('character-template')
                });
                newChar.render({force: true});
                await this.close();
            }));

        // Roll Body Points
        this.element.querySelectorAll('.rollbodypoints').forEach(el =>
            el.addEventListener('click', async ev => {
                const confirmText = "<p>" + game.i18n.localize("OD6S.CONFIRM_ROLL_BODYPOINTS") + "</p>";
                await Dialog.prompt({
                    title: game.i18n.localize("OD6S.ROLL") + " " + game.i18n.localize(OD6S.bodyPointsName),
                    content: confirmText,
                    callback: () => {
                        return this._rollBodyPoints();
                    }
                })
            }));

        // Purchase click event
        this.element.querySelectorAll('.item-purchase').forEach(el =>
            el.addEventListener('click', async ev => {
                if (typeof (game.user.character) === 'undefined') {
                    ui.notifications.warn(game.i18n.localize('OD6S.WARN_NO_CHARACTER_ASSIGNED'));
                    return;
                }
                if (OD6S.cost === '0') {
                    await this.rollPurchase(ev, game.user.character.id);
                } else {
                    await this._onPurchase(ev.currentTarget.dataset.itemId, game.user.character.id);
                }
            }));

        // Transfer click event
        this.element.querySelectorAll('.item-transfer').forEach(el =>
            el.addEventListener('click', async ev => {
                if (typeof (game.user.character) === 'undefined') {
                    ui.notifications.warn(game.i18n.localize('OD6S.WARN_NO_CHARACTER_ASSIGNED'));
                    return;
                }
                //await this._onTransfer(ev.currentTarget.dataset.itemId, game.user.character.id);
                await this._onTransfer(ev.currentTarget.dataset.itemId,
                    ev.currentTarget.dataset.senderId,
                    ev.currentTarget.dataset.recId);
            }));

        // Edit body points
        this.element.querySelectorAll('.editbodypoints').forEach(el =>
            el.addEventListener('change', async ev => {
                await this.actor.setWoundLevelFromBodyPoints(ev.target.value);
                this.render();
            }));

        // Edit funds
        this.element.querySelectorAll('.edit-funds').forEach(el =>
            el.addEventListener('change', async ev => {
                const newScore = {};
                newScore.dice = 0;
                newScore.pips = 0;
                let updateScore = 0;
                const oldScore = od6sutilities.getDiceFromScore(this.actor.system.funds.score);
                if (ev.target.id === 'funds-dice') {
                    newScore.pips = oldScore.pips;
                    newScore.dice = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                } else if (ev.target.id === 'funds-pips') {
                    newScore.dice = oldScore.dice;
                    newScore.pips = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                }
                const update = {};
                update.id = this.actor.id;
                update[`system.funds.score`] = updateScore;
                await this.actor.update(update);
                this.render();
            }));

        // Edit maneuverability
        this.element.querySelectorAll('.edit-maneuverability').forEach(el =>
            el.addEventListener('change', async ev => {
                const newScore = {};
                newScore.dice = 0;
                newScore.pips = 0;
                let updateScore = 0;
                const oldScore = od6sutilities.getDiceFromScore(this.actor.system.maneuverability.score);
                if (ev.target.id === 'maneuverability-dice') {
                    newScore.pips = oldScore.pips;
                    newScore.dice = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                } else if (ev.target.id === 'maneuverability-pips') {
                    newScore.dice = oldScore.dice;
                    newScore.pips = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                }
                const update = {};
                update.id = this.actor.id;
                update[`system.maneuverability.score`] = updateScore;
                await this.actor.update(update);
                this.render();
            }));

        // Edit toughness
        this.element.querySelectorAll('.edit-toughness').forEach(el =>
            el.addEventListener('change', async ev => {
                const newScore = {};
                newScore.dice = 0;
                newScore.pips = 0;
                let updateScore = 0;
                const oldScore = od6sutilities.getDiceFromScore(this.actor.system.toughness.score);
                if (ev.target.id === 'toughness-dice') {
                    newScore.pips = oldScore.pips;
                    newScore.dice = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                } else if (ev.target.id === 'toughness-pips') {
                    newScore.dice = oldScore.dice;
                    newScore.pips = (+ev.target.value);
                    updateScore = od6sutilities.getScoreFromDice(newScore.dice, newScore.pips);
                }
                const update = {};
                update.id = this.actor.id;
                update[`system.toughness.score`] = updateScore;
                await this.actor.update(update);
                this.render();
            }));

        // Edit item quantity
        this.element.querySelectorAll('.edit-quantity').forEach(el =>
            el.addEventListener('change', async ev => {
                const item = await this.actor.items.get(ev.currentTarget.dataset.itemId);
                const update = {};
                update[`system.quantity`] = ev.target.value
                await item.update(update);
            }));

        // Use a consumable
        this.element.querySelectorAll('.use-consumable').forEach(el =>
            el.addEventListener('click', async ev => {
                const item = await this.actor.items.get(ev.currentTarget.dataset.itemId);
                const update = {};
                update.id = item._id;
                update[`system.quantity`] = item.system.quantity - 1;
                await item.update(update);

                const actorEffectsList = this.actor.getEmbeddedCollection('ActiveEffect');

                if (actorEffectsList.size > 0) {
                    let actorUpdate = [];
                    actorEffectsList.forEach(e => {
                        let [parentType, parentId, documentType, documentId] = e.origin?.split(".") ?? [];
                        if (parentType === "Scene") {
                            let actorType, actorId;
                            [parentType, parentId, actorType, actorId, documentType, documentId] = e.origin?.split(".") ?? [];
                        }
                        if (documentType === "Item") {
                            const effectItem = this.actor.items.find(i => i.id === documentId);
                            if (effectItem) {
                                if (e.disabled === true) {
                                    const effectUpdate = {};
                                    effectUpdate._id = e.id;
                                    effectUpdate.disabled = false;
                                    actorUpdate.push(effectUpdate);
                                }
                            }
                        }
                    })
                    await this.actor.updateEmbeddedDocuments('ActiveEffect', actorUpdate);
                }
            }));

        // Activate a manifestation
        this.element.querySelectorAll('.active-checkbox').forEach(el =>
            el.addEventListener('click', async ev => {
            ev.preventDefault();
            const item = this.actor.items.find(i => i.id === ev.currentTarget.dataset.itemId);

            if (item) {

                /*if (item.system.attack || (item.system.roll && !item.system.active)) {
                    return od6sroll._metaphysicsRollDialog(item, this.actor);
                }*/

                if (item.system.attack) {
                    return;
                }

                const update = {};
                update.id = item.id;
                update['system.active'] = !item.system.active;

                await item.update(update);
                const actorEffectsList = this.actor.getEmbeddedCollection('ActiveEffect');

                if (actorEffectsList.size > 0) {
                    let actorUpdate = [];
                    actorEffectsList.forEach(e => {
                        let [parentType, parentId, documentType, documentId] = e.origin?.split(".") ?? [];
                        if (parentType === "Scene") {
                            let actorType, actorId;
                            [parentType, parentId, actorType, actorId, documentType, documentId] = e.origin?.split(".") ?? [];
                        }
                        if (documentType === "Item") {
                            const effectItem = this.actor.items.find(i => i.id === documentId);
                            if (effectItem && !effectItem.system.consumable && effectItem.type === 'manifestation') {
                                if (e.disabled === effectItem.system.active) {
                                    const effectUpdate = {};
                                    effectUpdate._id = e.id;
                                    effectUpdate.disabled = !item.system.active;
                                    actorUpdate.push(effectUpdate);
                                }
                            }
                        }
                    })
                    await this.actor.updateEmbeddedDocuments('ActiveEffect', actorUpdate);
                }
            }
            this.render();
        }));

        // Equip an item
        this.element.querySelectorAll('.equip-checkbox').forEach(el =>
            el.addEventListener('change', async ev => {
            const item = this.actor.items.find(i => i.id === ev.currentTarget.dataset.itemId);

            if (item) {
                const update = {};
                update.id = item.id;
                update['system.equipped.value'] = !item.system.equipped.value;

                await item.update(update);
                const actorEffectsList = this.actor.getEmbeddedCollection('ActiveEffect');

                if (actorEffectsList.size > 0) {
                    let actorUpdate = [];
                    let itemUpdates = [];
                    actorEffectsList.forEach(e => {
                        let [parentType, parentId, documentType, documentId] = e.origin?.split(".") ?? [];
                        if (parentType === "Scene") {
                            let actorType, actorId;
                            [parentType, parentId, actorType, actorId, documentType, documentId] = e.origin?.split(".") ?? [];
                        }
                        if (documentType === "Item") {
                            const effectItem = this.actor.items.find(i => i.id === documentId);
                            if (effectItem && !effectItem.system.consumable &&
                                OD6S.equippable.includes(effectItem.type)) {
                                if (e.disabled === effectItem.system.equipped.value) {
                                    if (!effectItem.system.equipped.value) {
                                        for (let i = 0; i < e.changes.length; i++) {
                                            const c = e.changes[i];
                                            if (c.key.startsWith('system.items.skills')) {
                                                if (c.mode === 2) {
                                                    const t = c.key.split('.');
                                                    const item = this.actor.items.find(i => i.name === t[3]);
                                                    const itemUpdate = {};
                                                    itemUpdate.id = item.id;
                                                    itemUpdate.system = {};
                                                    itemUpdate.system.mod = 0;
                                                    itemUpdates.push(itemUpdate);
                                                }
                                            }
                                        }
                                    }
                                    const effectUpdate = {};
                                    effectUpdate._id = e.id;
                                    effectUpdate.disabled = !item.system.equipped.value;
                                    actorUpdate.push(effectUpdate);
                                }
                            }
                        }
                    })
                    await this.actor.updateEmbeddedDocuments('ActiveEffect', actorUpdate);
                    for (let u = 0; u < itemUpdates.length; u++) {
                        const a = this.actor.items.find(i => i.id === itemUpdates[u].id);
                        await a.update(itemUpdates[u]);
                    }
                }
            }
            this.render();
        }));

        // Free edit attribute
        const attributeEditDialog = new od6sattributeedit();
        this.element.querySelectorAll('.attribute-edit').forEach(el =>
            el.addEventListener('click', attributeEditDialog._onAttributeEdit.bind(this)));

        // Add Inventory Item
        this.element.querySelectorAll('.item-create').forEach(el =>
            el.addEventListener('click', this._onItemCreate.bind(this)));
        this.element.querySelectorAll('.cargo-hold-add').forEach(el =>
            el.addEventListener('click', this.actor.onCargoHoldItemCreate.bind(this.actor)));

        // Update Effect
        this.element.querySelectorAll('.effect-edit').forEach(el =>
            el.addEventListener('click', async ev => {
                const effect = this.actor.effects.get(ev.currentTarget.dataset.effectId);
                await effect.sheet.render(true);
            }));

        // Update Effect
        this.element.querySelectorAll('.effect-delete').forEach(el =>
            el.addEventListener('click', async ev => {
                await this.actor.deleteEmbeddedDocuments('ActiveEffect', [ev.currentTarget.dataset.effectId]);
            }));

        // Update Inventory Item
        this.element.querySelectorAll('.item-edit').forEach(el =>
            el.addEventListener('click', async ev => {
                let itemId;
                if (typeof (ev.currentTarget.dataset.itemId) !== 'undefined' &&
                    ev.currentTarget.dataset.itemId !== '') {
                    itemId = ev.currentTarget.dataset.itemId
                } else {
                    const li = ev.currentTarget.closest(".item");
                    itemId = li.dataset.itemId;
                }
                const item = this.actor.items.get(itemId);
                item.sheet.render(true);
            }));

        // Delete Inventory Item
        this.element.querySelectorAll('.item-delete').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                await this.actor.sheet.deleteItem(ev);
            }));

        // Rollable abilities.
        let rollDialog = new (od6sroll);
        this.element.querySelectorAll('.rolldialog').forEach(el =>
            el.addEventListener('click', rollDialog._onRollEvent.bind(this)));
        this.element.querySelectorAll('.initrolldialog').forEach(el =>
            el.addEventListener('click', od6sInitRoll._onInitRollDialog.bind(this)));
        this.element.querySelectorAll('.actionroll').forEach(el =>
            el.addEventListener('click', rollDialog._onRollItem.bind(this)));

        // Attribute/skill advances
        let advanceDialog = new (od6sadvance);
        this.element.querySelectorAll('.advancedialog').forEach(el =>
            el.addEventListener('click', advanceDialog._onAdvance.bind(this)));

        // Attribute context menu
        this.element.querySelectorAll('.attributedialog').forEach(el =>
            el.addEventListener('contextmenu', () => {
            }));

        // Skill context menu
        this.element.querySelectorAll('.skilldialog').forEach(el =>
            el.addEventListener('contextmenu', () => {
            }));

        // Skill specialization
        let specializeDialog = new (od6sspecialize);
        this.element.querySelectorAll('.specializedialog').forEach(el =>
            el.addEventListener('click', specializeDialog._onSpecialize.bind(this)));

        // Reset template/actor
        this.element.querySelectorAll('.reset-template').forEach(el =>
            el.addEventListener('click', () => {
                const confirmText = "<p>" + game.i18n.localize("OD6S.CONFIRM_TEMPLATE_CLEAR") + "</p>";
                Dialog.prompt({
                    title: game.i18n.localize("OD6S.CLEAR_TEMPLATE"),
                    content: confirmText,
                    callback: () => {
                        return this._onClearCharacterTemplate();
                    }
                })
            }));

        this.element.querySelectorAll('.reset-species-template').forEach(el =>
            el.addEventListener('click', () => {
                const confirmText = "<p>" + game.i18n.localize("OD6S.CONFIRM_SPECIES_TEMPLATE_CLEAR") + "</p>";
                Dialog.prompt({
                    title: game.i18n.localize("OD6S.CLEAR_SPECIES_TEMPLATE"),
                    content: confirmText,
                    callback: () => {
                        return this._onClearSpeciesTemplate();
                    }
                })
            }));

        // Force-exit from vehicle
        this.element.querySelectorAll('.vehicle-exit').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                await this.actor.setFlag('od6s', 'crew', '');
            }));

        // Add Item to actor using a button
        this.element.querySelectorAll('.item-add').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                await this.addItem(ev);
            }));

        // Open a crewmember's character sheet
        this.element.querySelectorAll('.crew-member').forEach(el =>
            el.addEventListener('click', async ev => {
                const actor = await od6sutilities.getActorFromUuid(ev.currentTarget.dataset.uuid);
                if (actor.testUserPermission(game.user, "OWNER")) actor.sheet.render('true')
            }));

        // Add/remove crew to vehicles
        this.element.querySelectorAll('.crew-add').forEach(el =>
            el.addEventListener('click', async ev => {
            ev.preventDefault();
            const data = {};
            data.crew = [];
            if (typeof (game.scenes.active) === 'undefined') return;
            let tokens = game.scenes.active.tokens;

            tokens = tokens.filter(t => typeof (t.actor) !== "undefined" && t.actor !== '' && t.actor !== null);

            if (tokens.length === 0) {
                !ui.notifications.warn(game.i18n.localize('OD6S.NO_TOKENS'));
                return;
            }

            // Filter out tokens who are a vehicle
            tokens = tokens.filter(t => t.actor.type !== "vehicle" && t.actor.type !== "starship");

            if (game.user.isGM) {
                // Filter out tokens who are already crew members in a vehicle
                tokens = tokens.filter((t) => !t.actor.isCrewMember());
            } else {
                // If a player, filter out hostile/neutral tokens
                tokens = tokens.filter(t => t.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY);

                // Filter out already-crewed tokens
                let crewed = [];
                for (let i = 0; i < tokens.length; i++) {
                    if (await OD6S.socket.executeAsGM("checkCrewStatus", tokens[i].actor.uuid)) {
                        crewed.push(tokens[i]);
                    }
                }

                tokens = tokens.filter((e) => !crewed.includes(e));
            }

            if (tokens.length === 0) {
                !ui.notifications.warn(game.i18n.localize('OD6S.NO_TOKENS'));
                return;
            }

            data.targets = tokens;
            data.actor = this.actor.uuid;
            data.type = this.actor.type;
            new OD6SAddCrew({ crewData: data }).render({ force: true });
        }));

        this.element.querySelectorAll('.crew-delete').forEach(el =>
            el.addEventListener('click', async ev => {
                ev.preventDefault();
                if (!game.user.isGM && this.actor.uuid === ev.currentTarget.dataset.crewid) {
                    return await OD6S.socket.executeAsGM('unlinkCrew', ev.currentTarget.dataset.crewid, ev.currentTarget.dataset.vehicleid);
                } else if (game.user.isGM && this.actor.uuid === ev.currentTarget.dataset.crewid) {
                    const vehicle = await od6sutilities.getActorFromUuid(ev.currentTarget.dataset.vehicleid)
                    await vehicle.sheet.unlinkCrew(this.actor.uuid);
                } else {
                    return await this.unlinkCrew(ev.currentTarget.dataset.crewid);
                }
            }));

        // Add/remove actions
        this.element.querySelectorAll('.addaction').forEach(el =>
            el.addEventListener('click', () => {
                this._onActionAdd();
            }));

        this.element.querySelectorAll('.combat-action').forEach(el =>
            el.addEventListener('contextmenu', (ev) => {
                this._onAvailableActionAdd(ev);
            }));

        // Roll available action
        this.element.querySelectorAll('.combat-action').forEach(el =>
            el.addEventListener('click', async (ev) => {
                await this._rollAvailableAction(ev);
            }));

        // Roll available vehicle action
        this.element.querySelectorAll('.vehicle-action').forEach(el =>
            el.addEventListener('click', async (ev) => {
                await this._rollAvailableVehicleAction(ev);
            }));

        // Edit misc action
        this.element.querySelectorAll('.editmiscaction').forEach(el =>
            el.addEventListener('change', async (ev) => {
                const update = {};
                update._id = ev.currentTarget.dataset.itemId;
                update.name = ev.target.value;
                const action = await this.actor.items.find(i => i.id === update._id);
                await action.update(update);
                this.render();
            }));

        // Edit active effect
        this.element.querySelectorAll('.edit-effect').forEach(el =>
            el.addEventListener('click', async (ev) => {
                await this._editEffect(ev);
            }));

        // Fate point in effect checkbox
        this.element.querySelectorAll('.fatepointeffect').forEach(el =>
            el.addEventListener('change', async () => {
            // Don't allow if actor has 0 points
            if (this.actor.system.fatepoints.value < 1) {
                await this.actor.setFlag('od6s', 'fatepointeffect', false)
                this.render();
                return;
            }

            let inEffect = this.actor.getFlag('od6s', 'fatepointeffect');
            await this.actor.setFlag('od6s', 'fatepointeffect', !inEffect);
            inEffect = this.actor.getFlag('od6s', 'fatepointeffect');
            if (inEffect) {
                const update = {};
                update.system = {};
                update.system.fatepoints = {};
                update.id = this.actor.id;
                update._id = this.actor._id;
                update.system.fatepoints.value = this.actor.system.fatepoints.value -= 1;
                await this.actor.update(update, {diff: true});
            }
        }));

        // Vehicle shield allocation
        this.element.querySelectorAll('.arc').forEach(el =>
            el.addEventListener('click', async (ev) => {
            const arc = ev.currentTarget.dataset.arc;
            const direction = ev.currentTarget.dataset.direction;
            const value = this.actor.system.shields.value;
            let allocated = this.actor.system.shields.allocated;
            let newValue = this.actor.system.shields.arcs[arc].value;
            let doUpdate = false;

            if (direction === "up") {
                if (allocated < value) {
                    newValue++;
                    allocated++;
                    doUpdate = true;
                }
            } else {
                if (this.actor.system.shields.arcs[arc].value > 0) {
                    newValue--;
                    allocated > 0 ? allocated-- : ui.notifications.error(game.i18n.localize('OD6S.ALLOCATION_ERROR'));
                    doUpdate = true;
                }
            }

            if (doUpdate) {
                const update = {};
                update._id = this.actor.id;
                update.id = this.actor.id;
                update.system = {};
                update.system.shields = {};
                update.system.shields.arcs = {};
                update.system.shields.arcs[arc] = {};
                update.system.shields.allocated = allocated;
                update.system.shields.arcs[arc].value = newValue;

                await this.actor.update(update, {diff: true});
            }
        }));

        // Show item details
        this.element.querySelectorAll('.show-item-details').forEach(el =>
            el.addEventListener('click', async (ev) => {
            ev.preventDefault();
            let item = game.actors.get(ev.currentTarget.dataset.actorId).items.get(ev.currentTarget.dataset.itemId);
            if (typeof (item) !== 'undefined') {
                new OD6SItemInfo(item).render({force: true});
            } else {
                const itemName = ev.currentTarget.dataset.itemName;
                item = await od6sutilities._getItemFromWorld(itemName);
                if (typeof (item) !== 'undefined') {
                    new OD6SItemInfo(item.data).render({force: true});
                } else {
                    // Check compendia
                    item = await od6sutilities._getItemFromCompendium(itemName);
                    if (typeof (item) !== 'undefined') {
                        new OD6SItemInfo(item.data).render({force: true});
                    }
                }
            }
        }));

        this.element.querySelectorAll('.merchant-quantity-owner').forEach(el =>
            el.addEventListener('change', async (ev) => {
                const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
                const update = {};
                update._id = item.id;
                update.system = {};
                update.system.quantity = ev.target.value;

                await this.actor.updateEmbeddedDocuments('Item', [update]);
            }));

        // Merchant owner edit cost
        this.element.querySelectorAll('.merchant-cost-owner').forEach(el =>
            el.addEventListener('change', async (ev) => {
                const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
                const update = {};
                update._id = item.id;
                update.system = {};
                update.system.cost = ev.target.value;

                await this.actor.updateEmbeddedDocuments('Item', [update]);
            }));

        // Merchant owner edit cost
        this.element.querySelectorAll('.merchant-price-owner').forEach(el =>
            el.addEventListener('change', async (ev) => {
                const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
                const update = {};
                update._id = item.id;
                update.system = {};
                update.system.price = ev.target.value;

                await this.actor.updateEmbeddedDocuments('Item', [update]);
            }));

        // Vehicle shield allocation by crew member
        this.element.querySelectorAll('.c-arc').forEach(el =>
            el.addEventListener('click', async (ev) => {
            const actor = await od6sutilities.getActorFromUuid(ev.currentTarget.dataset.uuid);
            const arc = ev.currentTarget.dataset.arc;
            const direction = ev.currentTarget.dataset.direction;
            const value = this.actor.system.vehicle.shields.value;
            let allocated = this.actor.system.vehicle.shields.allocated;
            let newValue = this.actor.system.vehicle.shields.arcs[arc].value;
            let doUpdate = false;

            if (direction === "up") {
                if (allocated < value) {
                    newValue++;
                    allocated++;
                    doUpdate = true;
                }
            } else {
                if (this.actor.system.vehicle.shields.arcs[arc].value > 0) {
                    newValue--;
                    allocated > 0 ? allocated-- : ui.notifications.error(game.i18n.localize('OD6S.ALLOCATION_ERROR'));
                    doUpdate = true;
                }
            }

            if (doUpdate) {
                const update = {};
                update.system = {};
                update.system.shields = {};
                update.system.shields.arcs = {};
                update.system.shields.arcs[arc] = {};
                update.system.shields.allocated = allocated;
                update.system.shields.arcs[arc].value = newValue;
                if (game.user.isGM) {
                    await actor.update(update, {diff: true});
                } else {
                    update.uuid = ev.currentTarget.dataset.uuid;
                    this.actor.modifyShields(update)
                }
            }
        }));

        // Event listener for skill usage checkboxes
        this.element.querySelectorAll('.skill-used-checkbox, .spec-used-checkbox').forEach(el =>
            el.addEventListener('change', async event => {
                const itemId = event.currentTarget.dataset.itemId;
                const item = this.actor.items.get(itemId);

                if (item) {
                    await item.update({'system.used.value': event.currentTarget.checked})
                        .catch(err => console.error('Failed to update item used status:', err));
                }
            }));

        // Event listener for Session Reset button
        this.element.querySelectorAll('.session-reset-button').forEach(el =>
            el.addEventListener('click', event => {
                const checkboxes = this.element.querySelectorAll('.skill-used-checkbox, .spec-used-checkbox');
                checkboxes.forEach(checkbox => {
                    const itemId = checkbox.dataset.itemId;
                    const item = this.actor.items.get(itemId);
                    if (item) {
                        item.update({'system.used.value': false}).catch(err => console.error(err));
                        checkbox.checked = false;
                    } else {
                        console.error("Item not found for reset: ", itemId);
                    }
                });
            }));

        // Drag events
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);

            if (this.actor.type === 'container' && !game.user.isGM) return;

            // Items
            this.element.querySelectorAll('li.item').forEach(li => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });

            // Combat Actions
            this.element.querySelectorAll('li.availableaction').forEach(li => {
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", this._dragAvailableCombatAction, false);
            });
            this.element.querySelectorAll('li.assignedaction').forEach(li => {
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", this._dragAssignedCombatAction, false);
            });

            // Crewmembers
            this.element.querySelectorAll('li.crew-list').forEach(li => {
                li.setAttribute('draggable', true);
                li.addEventListener("dragstart", this._dragCrewMember, false);
            });
        }
    }

    async deleteItem(ev) {
        // If this is a skill, deny if there are existing specializations.
        if (ev.currentTarget.dataset.type === "skill") {
            for (let i in this.actor.items) {
                if (this.actor.items[i].type === "specialization") {
                    if (this.actor.items[i].skill === ev.currentTarget.dataset.itemId) {
                        ui.notifications.error(game.i18n.localize("OD6S.ERR_SKILL_HAS_SPEC"));
                        return;
                    }
                }
            }
        }
        if (ev.currentTarget.dataset.confirm !== "false") {
            let itemId;
            if (typeof (ev.currentTarget.dataset.itemId) !== 'undefined' &&
                ev.currentTarget.dataset.itemId !== '') {
                itemId = ev.currentTarget.dataset.itemId
            } else {
                const li = ev.currentTarget.closest(".item");
                itemId = li.dataset.itemId;
            }
            const confirmText = "<p>" + game.i18n.localize("OD6S.DELETE_CONFIRM") + "</p>";
            await Dialog.prompt({
                title: game.i18n.localize("OD6S.DELETE"),
                content: confirmText,
                callback: async () => {
                    await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
                    this.render();
                }
            })
        } else {
            await this.actor.deleteEmbeddedDocuments('Item', [ev.currentTarget.dataset.itemId]);
            this.render();
        }
    }

    async addItem(ev, caller=this) {
        const data = {};
        data.type = ev.currentTarget.dataset.type;
        data.attrname = ev.currentTarget.dataset.attrname;
        data.new = !(typeof (ev.currentTarget.dataset.new) !== 'undefined' && ev.currentTarget.dataset.new === 'false');
        let worldItems = {};
        let compendiumItems = [];

        data.type = ev.currentTarget.dataset.type;
        data.label = game.i18n.localize('OD6S.ADD') + " " + game.i18n.localize(OD6S.itemLabels[data.type])
        data.label_empty = game.i18n.localize('OD6S.ADD_EMPTY') + " " + game.i18n.localize(OD6S.itemLabels[data.type])

        worldItems = game.items.filter(i => i.type === data.type);
        const cEntries = od6sutilities.getItemsFromCompendiumByType(data.type);

        if (data.type === 'skill') {
            worldItems = worldItems.filter(i => i.system.attribute === data.attrname);
            for (const i of cEntries) {
                const item = await od6sutilities._getItemFromCompendium(i.name);
                if (item.system.attribute === data.attrname) {
                    compendiumItems.push(item);
                }
            }
        } else {
            for (const i of cEntries) {
                const item = await od6sutilities._getItemFromCompendium(i.name);
                compendiumItems.push(item);
            }
        }

        //if it is a skill, do not include skills the actor already has
        if(data.type === 'skill') {
            worldItems = worldItems.filter(i => !this.actor.items.find(r => r.name === i.name));
            compendiumItems = compendiumItems.filter(i => !this.actor.items.find(r => r.name === i.name));
        }

        // Prefer world items
        compendiumItems = compendiumItems.filter(i => !worldItems.find(r => r.name === i.name));

        data.items = [...worldItems, ...compendiumItems].sort(function (a, b) {
            const x = a.name.toUpperCase();
            const y = b.name.toUpperCase();
            return x === y ? 0 : x > y ? 1 : -1;
        })

        data.serializeditems = JSON.stringify(data.items);
        data.actor = this.actor.id;
        data.token = this.actor.isToken === true ? this.actor.token._id : '';
        data.actorType = this.actor.type;

        if (data.type === 'skill' || data.type === 'spec') {
            if (data.type === 'skill' && data.attrname === 'met' && game.settings.get('od6s', 'metaphysics_attribute_optional')) {
                // No metaphysics attribute, set skill to default of 1D
                data.score = OD6S.pipsPerDice;
            } else {
                data.score = this.actor.system.attributes[data.attrname].base;
            }
        } else {
            data.score = 0;
        }
        data.caller = caller;
        await new OD6SAddItem({ itemData: data }).render({ force: true });
    }

    /**
     * Adds a 'generic' action to the action list
     * @returns {Promise<void>}
     * @private
     */
    async _onActionAdd() {
        const data = {
            name: game.i18n.localize('OD6S.ACTION_OTHER'),
            subtype: 'misc'
        }
        await this._createAction(data);
        this.render();
    }

    /**
     * Add an action via a right-click
     * @returns {Promise<void>}
     * @private
     */
    async _onAvailableActionAdd(event) {
        const data = {
            name: event.currentTarget.dataset.name,
            type: "availableaction",
            subtype: event.currentTarget.dataset.type,
            itemId: event.currentTarget.dataset.id,
            rollable: event.currentTarget.dataset.rollable
        }
        await this._createAction(data);
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;

        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = game.i18n.localize('OD6S.NEW') + ' ' + game.i18n.localize('ITEM.Type' + type.capitalize());
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];

        // Finally, create the item!
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    /**
     * Add an item group to an actor
     * @param event
     * @param item
     * @param data
     * @returns {Promise<void>}
     * @private
     */
    async _onDropItemGroup(event, item, data) {
        if (!this.actor.isOwner) return false;

        // Compare group target type to actor type
        if (item.system.actor_types.includes(this.actor.type)) {
            const templateItems = await this._templateItems(item.system.items);
            if (templateItems.length) {
                await this.actor.createEmbeddedDocuments('Item', templateItems);
            }
        }
    }

    /**
     * Add a species template to an actor
     * @param event
     * @param item
     * @param data
     * @returns {Promise<void>}
     * @private
     */
    async _onDropSpeciesTemplate(event, item, data) {
        const update = {};
        update.system = {};

        if (!this.actor.isOwner) return false;
        if (this.actor.type !== 'character' && this.actor.type !== 'npc') return false;
        if (this.actor.items.find(E => E.type === 'species-template')) {
            ui.notifications.error(game.i18n.localize("OD6S.ERROR_SPECIES_TEMPLATE_ALREADY_ASSIGNED"));
            return false;
        }

        update.system.attributes = {};
        for (const attribute in item.system.attributes) {
            update.system.attributes[attribute] = {};
            update.system.attributes[attribute].min = item.system.attributes[attribute].min;
            update.system.attributes[attribute].max = item.system.attributes[attribute].max;
        }

        update['system.species.content'] = item.name;
        update.id = this.actor.id;
        await this.actor.update(update, {diff: true});

        const templateItems = await this._templateItems(item.system.items);
        templateItems.push(item);
        if (templateItems.length) {
            await this.actor.createEmbeddedDocuments('Item', templateItems);
        }
    }

    /**
     * Add a character template to an actor
     * @param event
     * @param item
     * @param data
     * @returns {Promise<boolean|*>}
     * @private
     */
    async _onDropCharacterTemplate(event, item, data) {
        if (!this.actor.isOwner) return false;
        if (this.actor.type !== 'character') return false;
        // Check if a template has already been assigned to this actor
        if (this.actor.items.find(E => E.type === 'character-template')) {
            ui.notifications.error(game.i18n.localize("OD6S.ERROR_TEMPLATE_ALREADY_ASSIGNED"));
            return false;
        } else {
            await this._addCharacterTemplate(item);
        }
    }

    async _addCharacterTemplate(item) {
        const itemData = item.system;
        let update = {};
        update.system = {};

        // Set the actor's data to be equal to the data found in the template
        update.system['chartype.content'] = item.name;
        if (update.system['species.content'] === '') {
            update.system['species.content'] = itemData.species;
        }
        update.system['fatepoints.value'] = itemData.fp;
        update.system['characterpoints.value'] = itemData.cp;
        update.system['credits.value'] = itemData.credits;
        update.system['funds.score'] = itemData.funds;
        update.system['move.value'] = itemData.move;
        update.system['background.content'] = itemData.description;
        update.system['metaphysicsextranormal.value'] = itemData.me;

        for (const attribute in itemData.attributes) {
            update.system[`attributes.${attribute}.base`] = itemData.attributes[attribute];
        }
        update.id = this.actor.id;
        await this.actor.update(update, {diff: true});

        const templateItems = await this._templateItems(itemData.items);
        templateItems.push(item);
        if (templateItems.length) {
            await this.actor.createEmbeddedDocuments('Item', templateItems);
        }
    }

    /**
     * Takes an array of item names and returns an array of items.
     * @param itemList<Array>
     * @returns {Array}
     * @private
     */
    async _templateItems(itemList)
    {// Loop through template items and add to actor from world, then compendia.
        // Filter out items if config is set to do so.
        let templateItems = [];
        for (let i of itemList) {
            let templateItem = await od6sutilities._getItemFromWorld(i.name);
            if (typeof (templateItem) === 'undefined' || templateItem === null) {
                // Check compendia
                templateItem = await od6sutilities._getItemFromCompendium(i.name);
                if (typeof (templateItem) === 'undefined' || templateItem === null) {
                    continue;
                }
            }
            if ((i.type === 'advantage' || i.type === 'disadvantage') &&
                game.settings.get('od6s', 'hide_advantages_disadvantages')) continue;
            if (typeof i.description !== 'undefined' && i.description !== '' && i.description !== null) {
                templateItem.description = i.description;
            }

            // Filter out duplicate skills/specializations by name
            if (i.type === 'skill' || i.type === 'specialization' || i.type === 'specialability' ||
                i.type === 'disadvantage' || i.type === 'advanatage') {
                if (this.actor.items.filter(e => e.type === i.type && e.name === i.name).length) {
                    continue;
                }
            }

            // Metaphysics skills get 1D if the attribute is not used
            if(templateItem.type === 'skill' && templateItem.system.attribute === 'met' && game.settings.get('od6s', 'metaphysics_attribute_optional')) {
                templateItem.system.base = OD6S.pipsPerDice;
            }

            templateItems.push(templateItem);
        }
        return templateItems;
    }

    /**
     * Override
     */
    async _onDrop(event) {
        event.preventDefault();
        // Try to extract the data

        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }

        const actor = this.actor;
        // Handle the drop with a Hooked function
        const allowed = Hooks.call("dropActorSheetData", actor, this, data);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "ActiveEffect":
                return this._onDropActiveEffect(event, data);
            case "Actor":
                return this._onDropActor(event, data);
            case "Item":
                const item = await Item.fromDropData(data);
                switch (item.type) {
                    case "character-template":
                        return this._onDropCharacterTemplate(event, item, data);
                    case "item-group":
                        return this._onDropItemGroup(event, item, data);
                    case "species-template":
                        return this._onDropSpeciesTemplate(event, item, data);
                    case "skill":
                        if (typeof (item.system.attribute) === 'undefined' || item.system.attribute === '') {
                            ui.notifications.error(game.i18n.localize('OD6S.MISSING_ATTRIBUTE'))
                            return;
                        } else {
                            return this._onDropItem(event, data);
                        }
                    case "specialization":
                        if (typeof (item.system.attribute) === 'undefined' || item.system.attribute === '') {
                            ui.notifications.error(game.i18n.localize('OD6S.MISSING_ATTRIBUTE'))
                            return;
                        } else if (typeof (item.system.attribute) === 'undefined' || item.system.skill === '') {
                            ui.notifications.error(game.i18n.localize('OD6S.MISSING_SKILL'))
                            return;
                        } else if (!(actor.items.find(i => i.type === 'specialization' && i.name === item.name))) {
                            ui.notifications.warn(game.i18n.localize('OD6S.DOES_NOT_POSSESS_SKILL'));
                            return;
                        } else {
                            return this._onDropItem(event, data);
                        }
                    default:
                        return this._onDropItem(event, data);
                }
            case "Folder":
                return this._onDropFolder(event, data);
            case "availableaction":
                return await this._createAction(data);
            case "assignedaction":
                data.type = "action";
                data._id = data.itemId;
                return await this._onSortItem(event, data);
            case "crewmember":
                return await this._onSortCrew(event, data);
        }
        this.render();
    }

    /* Override */
    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        const item = await Item.implementation.fromDropData(data);
        const itemData = item.toObject();

        // Verify the actor can have the item type
        if (this.actor.type !== 'starship' && this.actor.type !== 'vehicle') {
            if (!OD6S.allowedItemTypes[this.actor.type].includes(itemData.type)) {
                return false;
            }
        }

        //Set any active effects on characters to disabled until the item is equipped unless the item is a cybernetic
        if (this.actor.type === 'character') {
            if (itemData.type !== 'cybernetic' &&
                itemData.type !== 'advantage' &&
                itemData.type !== 'disadvantage' &&
                itemData.type !== 'specialability') {
                itemData.effects.forEach((i) => {
                    i.disabled = true;
                })
            }
        } else if (this.actor.type === 'container') {
            if (this._isEquippable(itemData.type)) {
                itemData.system.equipped.value = false;
            }
        } else {
            // Do not equip cargo hold items
            if (OD6S.allowedItemTypes[this.actor.type].includes(itemData.type)) {
                if (this._isEquippable(itemData.type)) {
                    itemData.system.equipped.value = true;
                }
            } else {
                if (this._isEquippable(itemData.type)) {
                    itemData.system.equipped.value = false;
                }
                itemData.effects.forEach((i) => {
                    i.disabled = true;
                    i.transfer = false;
                })
            }
        }

        // Handle item sorting within the same Actor
        if (item.parent !== null && data.uuid.startsWith(item.parent.uuid)) {
            if (this.actor.type === 'starship' || this.actor.type === 'vehicle' &&
                !OD6S.allowedItemTypes[this.actor.type].includes(itemData.type)) {
                await this._onSortItem(event, itemData);
                await this._onSortCargoItem(event, itemData);
            } else if (this.actor.type === 'container') {
                await this._onSortContainerItem(event, itemData);
            } else {
                await this._onSortItem(event, itemData);
            }
        } else {
            // Could be dragging from sheet to sheet
            let sourceActor;
            if (typeof (data.actorId) !== 'undefined' && data.actorId !== null && data.actor !== '') {
                if (typeof (data.tokenId) !== 'undefined' && data.tokenId !== null && data.tokenId !== '') {
                    const scene = game.scenes.get(data.sceneId);
                    sourceActor = scene.tokens.get(data.tokenId).object.actor;
                } else {
                    sourceActor = game.actors.get(data.actorId);
                }
                if (game.user.isGM || sourceActor.isOwner) {
                    if (await this.actor.createEmbeddedDocuments("Item", Array.isArray(itemData) ? itemData : [itemData])) {
                        await sourceActor.deleteEmbeddedDocuments('Item', [system._id]);
                    }
                } else {
                    ui.notifications.warn('OD6S.WARN_NOT_DELETING_ITEM_OWNER');
                }
            } else {
                await this.actor.createEmbeddedDocuments("Item", Array.isArray(itemData) ? itemData : [itemData]);
            }
        }
        this.render();
    }

    _onSortItem(event, itemData) {

        // Get the drag source and drop target
        const items = this.actor.items;
        const source = items.get(itemData._id);
        const dropTarget = event.target.closest("li[data-item-id]");
        if ( !dropTarget ) return;
        const target = items.get(dropTarget.dataset.itemId);

        // Don't sort on yourself
        if ( source.id === target.id ) return;

        // Identify sibling items based on adjacent HTML elements
        const siblings = [];
        for ( let el of dropTarget.parentElement.children ) {
            const siblingId = el.dataset.itemId;
            if ( siblingId && (siblingId !== source.id) ) siblings.push(items.get(el.dataset.itemId));
        }

        // Perform the sort
        const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target._id;
            return update;
        });

        // Perform the update
        return this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    async _onSortCrew(event, data) {

        const crewMembers = [...this.actor.system.crewmembers];
        const source = crewMembers.filter(c=>c.uuid===data.crewUuid)[0];
        const dropTarget = event.target.closest("li[data-crew-uuid]");
        if ( !dropTarget ) return;
        const target = crewMembers.filter(c=>c.uuid===dropTarget.dataset.crewUuid)[0];

        // Identify sibling items based on adjacent HTML elements
        const siblings = [];
        for ( let el of dropTarget.parentElement.children ) {
            const siblingId = el.dataset.crewUuid;
            if ( siblingId && (siblingId !== source.uuid) ) siblings.push(crewMembers.filter(c=>c.uuid===el.dataset.crewUuid)[0]);
        }

        const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});

        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update.uuid = u.target.uuid;
            return update;
        });

        for (let i= 0; i < updateData.length; i++) {
            for (let j = 0; j < crewMembers.length; j++) {
                if (updateData[i].uuid === crewMembers[j].uuid) {
                    crewMembers[j].sort = (+updateData[i].sort)
                }
            }
        }

        crewMembers.sort((a,b) => {
            if(a.sort < b.sort) {
                return -1;
            }
            if(a.sort > b.sort) {
                return 1;
            }
            return 0;
        })

        const updateObject = {
            system: {
                crewmembers: crewMembers
            }
        }

        await this.actor.update(updateObject);
    }S

    async _onSortContainerItem(event, itemData) {
        // Get the drag source and its siblings
        const source = this.actor.items.get(itemData._id);
        const siblings = this.actor.items.filter(i => {
            return (i.type === source.type) && (i._id !== source._id);
        });

        // Get the drop target
        const dropTarget = event.target.closest("[data-item-id]");
        const targetId = dropTarget ? dropTarget.dataset.itemId : null;
        const target = siblings.find(s => s._id === targetId);

        // Ensure we are only sorting like-types
        if (target && (source.type !== target.type)) return;

        // Perform the sort
        const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings});
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target._id;
            return update;
        });

        // Perform the update
        await this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    /**
     * check if an item type can be equipped
     * @param itemType
     * @returns {boolean}
     * @private
     */
    _isEquippable(itemType) {
        return OD6S.equippable.includes(itemType);
    }

    /**
     * Creates an action
     * @param data
     * @returns {Promise<Object>}
     * @private
     */
    async _createAction(data) {
        // Localize system actions
        if (data.name.startsWith('OD6S.')) {
            data.name = game.i18n.localize(data.name);
        }

        // Only one dodge/parry/block needed per turn
        if (data.subtype === 'dodge' || data.subtype === 'parry' || data.subtype === 'block' || data.subtype === 'vehicledodge') {
            if (this.actor.itemTypes.action.find(i => i.system.subtype === data.subtype)) {
                ui.notifications.warn(game.i18n.localize('OD6S.ACTION_ONLY_ONE'));
                return;
            }
        }

        const action = {
            name: data.name,
            type: 'action',
            system: {
                type: data.type,
                subtype: data.subtype,
                rollable: data.rollable,
                itemId: data.itemId, // Used for item rolls
            }
        }
        return await this.actor.createEmbeddedDocuments('Item', [action]);
    }

    async _onClearSpeciesTemplate() {
        // Find the template
        let update = {};
        update.system = {};

        const item = this.actor.items.find(E => E.type === 'species-template');
        if (item) {
            const itemData = item.system;

            // Set attribute min/max to default
            for (const attribute in this.actor.system.attributes) {
                if (attribute !== 'met') {
                    update[`system.attributes.${attribute}`] = {};
                    update[`system.attributes.${attribute}`].min = OD6S.pipsPerDice * OD6S.speciesMinDice;
                    update[`system.attributes.${attribute}`].max = OD6S.pipsPerDice * OD6S.speciesMaxDice;
                }
            }

            // Clear the species name from the template; check if a character template is applied and replace it from there
            const characterTemplate = this.actor.items.find(E => E.type === 'character-template');
            if (characterTemplate) {
                update[`system.species.content`] = characterTemplate.system.species;
            } else {
                update[`system.species.content`] = '';
            }

            // Remove items
            if (itemData.items !== null && typeof(itemData.items !== 'undefined')) {
                for (let templateItem of itemData.items) {
                    let actorItem = this.actor.items.find(I => I.name === templateItem.name);
                    if (typeof (actorItem) !== 'undefined') {
                        await this.actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
                    }
                }
            }

            await this.actor.update(update, {diff: true});

            await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
            this.render();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Clear the template of an actor
     * @returns {Promise<boolean>}
     * @private
     */
    async _onClearCharacterTemplate() {
        // Find the template
        const item = this.actor.items.find(E => E.type === 'character-template');
        if (item) {
            const itemData = item.system;
            const update = {};
            update.system = {};

            // Clear template stuff from the actor
            for (const attribute in itemData.attributes) {
                update.system[`attributes.${attribute}.base`] = 0;
            }

            update.system['chartype.content'] = "";
            const speciesTemplate = this.actor.items.find(E => E.type === 'species-template');
            if (!speciesTemplate) update.system['species.content'] = "";
            update.system['fatepoints.value'] = 0;
            update.system['characterpoints.value'] = 0;
            update.system['credits.value'] = 0;
            update.system['funds.score'] = 0;
            update.system['background.content'] = "";
            update.system['metaphysicsextranormal.value'] = false;
            update.system['move.value'] = 10;
            update.id = this.actor.id;
            await this.actor.update(update, {diff: true});

            if (itemData.items !== null && typeof(itemData.items !== 'undefined')) {
                for (let templateItem of itemData.items) {
                    let actorItem = this.actor.items.find(I => I.name === templateItem.name);
                    if (typeof (actorItem) !== 'undefined') {
                        await this.actor.deleteEmbeddedDocuments('Item', [actorItem.id]);
                    }
                }
            }
            if(this.actor.items.get(item.id)) {
                await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
            }
            this.render();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Enrich draggable available combat actions
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _dragAvailableCombatAction(event) {
        const data = event.target.children[0].dataset;
        const transferData = {
            name: data.name,
            type: "availableaction",
            subtype: typeof (data.subtype) !== 'undefined' ? data.subtype : data.type,
            itemId: data.id,
            rollable: data.rollable
        }
        return event.dataTransfer.setData("text/plain", JSON.stringify(transferData));
    }

    /**
     * Enrich draggable combat actions
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _dragAssignedCombatAction(event) {
        const data = event.target.children[0].dataset;
        const transferData = {
            name: data.name,
            type: "assignedaction",
            subtype: typeof (data.subtype) !== 'undefined' ? data.subtype : data.type,
            itemId: data.itemId,
            rollable: data.rollable,
            id: data.id
        }
        return event.dataTransfer.setData("text/plain", JSON.stringify(transferData));
    }

    /**
     * Enrich draggable crew
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _dragCrewMember(event) {
        const data = event.target.dataset;
        const transferData = {
            crewUuid: data.crewUuid,
            type: "crewmember"
        }
        return event.dataTransfer.setData("text/plain", JSON.stringify(transferData));
    }

    /**
     * Roll an available vehicle action
     * @param ev
     * @returns {Promise<void>}
     * @private
     */
    async _rollAvailableVehicleAction(ev) {
        let rollData = {};
        rollData.score = 0;
        rollData.scale = 0;
        const data = ev.currentTarget.dataset;
        const actorData = this.actor.system;

        if (data.rollable !== "true") return;

        if (data.type === 'vehicleramattack' || data.type === 'vehiclemaneuver' || data.type === 'vehicledodge') {
            rollData.score = od6sutilities.getScoreFromSkill(this.actor,
                    actorData.vehicle.specialization.value,
                    actorData.vehicle.skill.value, OD6S.vehicle_actions[data.id].base) +
                actorData.vehicle.maneuverability.score;
        } else if (data.type === 'vehiclesensors') {
            rollData.score = +(od6sutilities.getScoreFromSkill(this.actor, '',
                actorData.vehicle.sensors.skill, OD6S.vehicle_actions[data.id].base)) + (+data.score);
        } else if (data.type === 'vehicleshields') {
            rollData.score = od6sutilities.getScoreFromSkill(this.actor, '',
                actorData.vehicle.shields.skill.value, OD6S.vehicle_actions[data.id].base)
        } else {
            // Item
            const item = actorData.vehicle.vehicle_weapons.find(i => i.id === data.id);
            if (item !== null && typeof (item) !== 'undefined') {
                rollData.score = od6sutilities.getScoreFromSkill(this.actor, item.system.specialization.value,
                    game.i18n.localize(item.system.skill.value), item.system.attribute.value);
                rollData.score += item.system.fire_control.score;
                rollData.scale = item.system.scale.score;
                rollData.damage = item.system.damage.score;
                rollData.damage_type = item.system.damage.type;
            }
        }

        if (!rollData.scale) rollData.scale = actorData.vehicle.scale.score;
        rollData.name = game.i18n.localize(data.name);
        rollData.type = 'action';
        rollData.actor = this.actor;
        rollData.subtype = data.type;
        await od6sroll._onRollDialog(rollData);
    }

    /**
     * Roll an available action
     * @param ev
     * @returns {Promise<*>}
     * @private
     */
    async _rollAvailableAction(ev) {
        let rollData = {};
        const data = ev.currentTarget.dataset;
        let name = game.i18n.localize(data.name);
        let flatPips = 0;

        rollData.token = this.token;

        if (data.rollable !== "true") return;
        if (data.id !== '') {
            // Item, find the item and hand the roll off
            const item = this.actor.items.find(i => i.id === data.id);
            if (item !== null && typeof (item) !== 'undefined') {
                return await item.roll(data.type === 'parry');
            }
        }

        if (data.type === 'dodge' || data.type === 'parry' || data.type === 'block') {
            // Get the appropriate skill or attribute
            switch (data.type) {
                case 'dodge':
                    name = OD6S.actions.dodge.skill;
                    break;
                case 'parry':
                    name = OD6S.actions.parry.skill;
                    break;
                case 'block':
                    name = OD6S.actions.block.skill;
                    break;
            }
            name = game.i18n.localize(name);
        }

        // Create roll data
        if (data.type === 'attribute') {
            name = data.name;
            rollData.attribute = data.id;
        } else {
            let skill = this.actor.items.find(i => i.type === 'skill' && i.name === name);
            if (skill !== null && typeof (skill) !== 'undefined') {
                if (OD6S.flatSkills) {
                    rollData.score = (+this.actor.system.attributes[skill.system.attribute.toLowerCase()].score);
                    flatPips = (+skill.system.score);
                } else {
                    rollData.score = (+skill.system.score) +
                        (+this.actor.system.attributes[skill.system.attribute.toLowerCase()].score);
                }
            } else {
                // Search compendia for the skill and use the attribute
                skill = await od6sutilities._getItemFromWorld(name);
                if (skill !== null && typeof (skill) !== 'undefined') {
                    rollData.score = (+this.actor.system.attributes[skill.system.attribute.toLowerCase()].score);
                } else {
                    skill = await od6sutilities._getItemFromCompendium(name);
                    if (skill !== null && typeof (skill) !== 'undefined') {
                        rollData.score = (+this.actor.system.attributes[skill.system.attribute.toLowerCase()].score);
                    } else {
                        // Cannot find, use defaults for the type
                        for (let a in OD6S.actions) {
                            if (OD6S.actions[a].type === ev.currentTarget.dataset.type) {
                                rollData.score = (+this.actor.system.attributes[OD6S.actions[a].base].score);
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (flatPips > 0) {
            rollData.flatpips = flatPips;
        }

        rollData.name = name;
        rollData.type = 'action';
        rollData.actor = this.actor;
        rollData.subtype = data.type;

        await od6sroll._onRollDialog(rollData);
    }

    async _editEffect(ev) {
        //const effect = this.document.getEmbeddedDocument("ActiveEffect", ev.currentTarget.dataset.effectId);
        const effect = this.actor.effects.find(e => e.id === ev.currentTarget.dataset.effectId);
        const sheet = new ActiveEffectConfig(effect);
        sheet.render(true);
    }

    /**
     * Override
     * @param event
     * @param data
     * @returns {Promise<boolean>}
     * @private
     */
    async _onDropActor(event, data) {

        if (!this.actor.isOwner) return false;

        if (this.actor.type === "vehicle" || this.actor.type === "starship") {
            if(this.actor.system.embedded_pilot.value) {
                let pilotActor = {};
                if(data.uuid.startsWith('Compendium')) {
                    pilotActor = await fromUuid(data.uuid);
                } else {
                    pilotActor = await od6sutilities.getActorFromUuid(data.uuid);
                }
                if(typeof(pilotActor) === 'undefined') {
                    ui.notifications.warn(game.i18n.localize('OD6S.ACTOR_NOT_FOUND'));
                    return false;
                }

                await this.actor.addEmbeddedPilot(pilotActor);
            } else {
                await this.linkCrew(data.uuid);
            }
        }
    }

    /**
     * Links an actor to a vehicle
     * @param uuid
     * @returns {Promise<void>}
     */
    async linkCrew(uuid) {
        if (this.actor.system.crewmembers.includes(uuid)) return;

        const actor = await od6sutilities.getActorFromUuid(uuid);
        let result;
        if (game.user.isGM) {
            result = await actor.addToCrew(this.actor.uuid);
        } else {
            result = await OD6S.socket.executeAsGM('addToVehicle', this.actor.uuid, uuid);
        }

        if (result) {

            const crew = {};
            crew.uuid = actor.uuid;
            crew.name = actor.name;
            crew.sort = 0;

            const update = {};
            update.id = this.actor.id;
            update.system = {};
            update.system.crewmembers = this.actor.system.crewmembers;
            update.system.crewmembers.push(crew);

            await this.actor.update(update);
        }
    }

    /**
     * Unlinks an actor from a vehicle
     * @param crewID
     * @returns {Promise<void>}
     */
    async unlinkCrew(crewID) {
        let crewMembers = this.actor.system.crewmembers.filter(e => e.uuid !== crewID);

        if (await fromUuid(crewID)) {
            if (game.user.isGM) {
                const actor = await od6sutilities.getActorFromUuid(crewID);
                await actor.removeFromCrew(this.actor.uuid);
            } else {
                const socketData = {};
                socketData.actorId = crewID;
                socketData.vehicleId = this.actor.uuid;
                game.socket.emit('system.od6s', {
                    operation: 'removeFromVehicle',
                    message: socketData
                });
            }
        }

        const update = {};
        update.id = this.actor.id;
        update.system = {};
        update.system.crewmembers = crewMembers;

        await this.actor.update(update);
    }

    /**
     * Sort cargo list items, need to filter the sort by all items, not just
     * @param event
     * @param itemData
     * @returns {Promise<*>}
     * @private
     */
    async _onSortCargoItem(event, itemData) {

        // Get the drag source and its siblings
        const source = this.actor.items.get(itemData._id);
        const siblings = this.actor.items.filter(i => {
            return (i._id !== source._id);
        });

        // Get the drop target
        const dropTarget = event.target.closest("[data-item-id]");
        const targetId = dropTarget ? dropTarget.dataset.itemId : null;
        const target = siblings.find(s => s._id === targetId);

        // Perform the sort
        const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings});
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target._id;
            return update;
        });

        // Perform the update
        return await this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    async _rollBodyPoints() {
        const strDice = od6sutilities.getDiceFromScore(this.actor.system.attributes.str.score +
            this.actor.system.attributes.str.mod)
        let rollString;
        if (game.settings.get('od6s', 'use_wild_die')) {
            if (strDice.dice < 2) {
                rollString = "1dw";
            } else {
                rollString = (+strDice.dice - 1) + "d6+1dw";
            }
        } else {
            rollString = strDice.dice + "d6";
        }
        rollString += "+" + (+strDice.pips + 20);

        const label = game.i18n.localize('OD6S.ROLLING') + " " + game.i18n.localize(OD6S.bodyPointsName);

        let rollMode = 0;
        if (game.user.isGM && game.settings.get('od6s', 'hide-gm-rolls')) rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
        let roll = await new Roll(rollString).evaluate();
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: label,
            rollMode: rollMode, create: true
        });

        const update = {};
        update[`system.wounds.body_points.max`] = roll.total;
        await this.actor.update(update);
    }

    async rollPurchase(ev, buyerId) {
        const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
        if (typeof (item) === 'undefined') return ui.notifications.warn(game.i18n.localize('OD6S.ITEM_NOT_FOUND'));
        const data = {};
        data.name = game.i18n.localize('OD6S.PURCHASE') + " " + item.name;
        data.itemId = item.id;
        data.actor = game.actors.get(buyerId);
        data.seller = this.actor.id;
        data.type = 'purchase';
        data.difficultyLevel = OD6S.difficultyShort[item.system.price];
        data.score = data.actor.system.funds.score;
        await od6sroll._onRollDialog(data);
    }

    /**
     * Perform a purchase from a merchant either through a click or a drag
     * @param itemId
     * @param buyerId
     * @returns {Promise<void>}
     */
    async _onPurchase(itemId, buyerId) {
        const seller = this.actor;
        const buyer = game.actors.get(buyerId);
        const item = seller.items.get(itemId);

        if (OD6S.cost === '1') {
            // Currency
            if ((+buyer.system.credits.value) < (+item.system.cost)) {
                ui.notifications.warn(game.i18n.localize('OD6S.WARN_NOT_ENOUGH_CURRENCY'));
                return;
            }
            const update = {};
            update[`system.credits.value`] = (+buyer.system.credits.value) - (+item.system.cost);
            await buyer.update(update);
        }

        // Copy item to buyer
        const boughtItem = JSON.parse(JSON.stringify(item));
        boughtItem.system.quantity = 1;
        if (item.type === 'gear') {
            // See if the buyer already has an item of the same name, and just bump the quantity.  If not, copy.
            const hasItem = buyer.items.filter(i => i.name === item.name);
            if (hasItem.length > 0) {
                const update = {};
                update[`system.quantity`] = (+hasItem[0].system.quantity) + 1;
                await hasItem[0].update(update);
            } else {
                await buyer.createEmbeddedDocuments('Item', [boughtItem]);
            }
        } else {
            await buyer.createEmbeddedDocuments('Item', [boughtItem]);
        }

        // Reduce quantity by 1 on seller
        const sellerUpdate = {}
        if (item.system.quantity > 0) sellerUpdate['system.quantity'] = (+item.system.quantity) - 1;
        await item.update(sellerUpdate);
    }

    async _onTransfer(itemId, senderId, recId) {
        const sender = game.actors.get(senderId);
        const receiver = game.actors.get(recId);
        const item = sender.items.get(itemId);

        // Copy item to receiver
        const recItem = JSON.parse(JSON.stringify(item));
        recItem.quantity = 1;
        if (item.type === 'gear') {
            // See if the receiver already has an item of the same name, and just bump the quantity.  If not, copy.
            const hasItem = receiver.items.filter(i => i.name === item.name);
            if (hasItem.length > 0) {
                const update = {};
                update[`system.quantity`] = (+hasItem[0].system.quantity) + 1;
                await hasItem[0].update(update);
            } else {
                await receiver.createEmbeddedDocuments('Item', [recItem]);
            }

            // Reduce quantity by 1 on sender
            const senderUpdate = {}
            if (item.system.quantity > 0) senderUpdate['system.quantity'] = (+item.system.quantity) - 1;
            await item.update(senderUpdate);

            if (sender.type === 'character' || sender.type === 'container') {
                // If the sender is a character and the quantity is now 0, remove from the actor
                if (item.system.quantity === 0) {
                    await sender.deleteEmbeddedDocuments('Item', [item.id])
                }
            }
        } else {
            await receiver.createEmbeddedDocuments('Item', [recItem]);
            await sender.deleteEmbeddedDocuments('Item', [item.id])
        }

        this.render();
    }


    _onDragStart(event) {
        const li = event.currentTarget;
        if ( "link" in event.target.dataset ) return;

        // Create drag data
        let dragData;

        // Owned Items
        if ( li.dataset.itemId ) {
            const item = this.actor.items.get(li.dataset.itemId);
            dragData = item.toDragData();
        }

        // Active Effect
        if ( li.dataset.effectId ) {
            const effect = this.actor.effects.get(li.dataset.effectId);
            dragData = effect.toDragData();
        }

        // Vehicle Crew
        if (li.dataset.crewUuid) {
            dragData = li.dataset.crewUuid;
        }

        if ( !dragData ) return;

        // Set data transfer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}

export default OD6SActorSheet;
