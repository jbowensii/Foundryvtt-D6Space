// OD6S Character creation wizard — multi-step template selection, attribute assignment, and skill allocation.
import {od6sutilities} from "../system/utilities.js";
import OD6S from "../config/config-od6s.js";


const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class OD6SCreateCharacter extends HandlebarsApplicationMixin(ApplicationV2) {

    actor = null;
    characterTemplates = [];
    selectedTemplate = "";
    templateData = {};
    skillScore = 0;
    specScore = 0;
    custom = {};
    done = false;
    step = 1;

    static DEFAULT_OPTIONS = {
        id: "create-character",
        classes: ["od6s"],
        tag: "form",
        position: { width: 800, height: "auto" },
        window: {
            title: "OD6S.CREATE_CHARACTER",
            resizable: true,
        },
        form: {
            handler: OD6SCreateCharacter.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: false,
        },
        actions: {
            skillAdd: OD6SCreateCharacter.#onSkillAdd,
            skillDelete: OD6SCreateCharacter.#onSkillDelete,
            specDelete: OD6SCreateCharacter.#onSpecDelete,
            increase: OD6SCreateCharacter.#onIncrease,
            increaseSpec: OD6SCreateCharacter.#onIncreaseSpec,
            decrease: OD6SCreateCharacter.#onDecrease,
            decreaseSpec: OD6SCreateCharacter.#onDecreaseSpec,
            specialize: OD6SCreateCharacter.#onSpecialize,
            navigate: OD6SCreateCharacter.#onNavigate,
            addSpecDice: OD6SCreateCharacter.#onAddSpecDice,
            removeSpecDice: OD6SCreateCharacter.#onRemoveSpecDice,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/actor/character/create-character.html" }
    };

    constructor(options = {}) {
        super(options);
        this.actor = options.actor;
        this.characterTemplates = options.templates;
        this.skillScore = OD6S.initialSkills;
        this.custom.templateName = game.i18n.localize('OD6S.CREATE_CUSTOM_TEMPLATE');
        this.custom.attributeScore = OD6S.initialAttributes;
        this.custom.characterPoints = OD6S.initialCharacterPoints;
        this.custom.fatePoints = OD6S.initialFatePoints;
        this.custom.move = OD6S.initialMove;
        this.custom.attributeDice = OD6S.initialAttributes;
        this.custom.attributes = {};
        for (const a in OD6S.attributes) {
            this.custom.attributes[a] = 0;
        }
        this.custom.me = false;
    }

    async _prepareContext(options) {
        const context = {};

        if (this.actor.system.chartype.content !== "") {
            const idx = this.characterTemplates.findIndex(t => t.name === this.actor.system.chartype.content);
            if (idx >= 0) {
                this.selectedTemplate = this.characterTemplates[idx]._id;
                this.templateData =
                    await od6sutilities.getItemByName(
                        this.characterTemplates.find(i => i._id === this.selectedTemplate).name);
                if (typeof (this.templateData) === 'undefined' || this.templateData === null || this.templateData === '') {
                    ui.notifications.error(game.i18n.localize("OD6S.ERROR_TEMPLATE_NOT_FOUND"));
                    return context;
                }
            }
        }

        const attrs = [];
        if (Object.keys(this.templateData).length !== 0) {
            for (const attribute in this.templateData.system.attributes) {
                const attr = {};
                attr.id = attribute;
                attr.score = this.templateData.system.attributes[attribute];
                attr.sort = OD6S.attributes[attribute].sort;
                attr.active = OD6S.attributes[attribute].active;
                attrs.push(attr);
            }
            context.attrs = attrs.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        } else {
            context.attrs = [];
        }

        // Wizard is considered complete when all skill and spec pips have been spent
        this.done = (this.skillScore === 0 && this.specScore === 0);

        context.done = this.done;
        context.characterTemplates = this.characterTemplates;
        context.selectedTemplate = this.selectedTemplate;
        context.templateData = this.templateData;
        context.step = this.step;
        context.actor = this.actor;
        context.skillScore = this.skillScore;
        context.specScore = this.specScore;
        context.custom = this.custom;
        if (typeof (this.templateData.system) !== 'undefined' && typeof (this.templateData.system.items) !== 'undefined') {
            context.skills = await od6sutilities.getSkillsFromTemplate(this.templateData.system.items.filter(i => i.type === 'skill'));
        }
        return context;
    }

    _onRender(context, options) {
        // Template dropdown change listener
        const dropdown = this.element.querySelector('.template-dropdown');
        if (dropdown) {
            dropdown.addEventListener('change', async (ev) => {
                ev.preventDefault();
                if (ev.target.value === "custom") {
                    this.selectedTemplate = ev.target.value;
                    this.templateData = {};
                } else {
                    this.selectedTemplate = ev.target.value;
                    this.templateData =
                        await od6sutilities.getItemByName(
                            this.characterTemplates.find(i => i._id === this.selectedTemplate).name);
                }
                await this.actor.sheet._onClearCharacterTemplate();
                this.render();
            });
        }

        // Custom template field change listeners
        const fields = {
            '.create-custom-template-name': (v) => { this.custom.templateName = v; },
            '.fate-points': (v) => { this.custom.fatePoints = v; },
            '.character-points': (v) => { this.custom.characterPoints = v; },
            '.move': (v) => { this.custom.move = v; },
        };
        for (const [selector, handler] of Object.entries(fields)) {
            const el = this.element.querySelector(selector);
            if (el) {
                el.addEventListener('change', (ev) => {
                    ev.preventDefault();
                    handler(ev.target.value);
                    this.render();
                });
            }
        }

        const meCheckbox = this.element.querySelector('.me');
        if (meCheckbox) {
            meCheckbox.addEventListener('change', (ev) => {
                ev.preventDefault();
                this.custom.me = !this.custom.me;
                this.render();
            });
        }
    }

    // --- Action Handlers ---

    static async #onSkillAdd(event, target) {
        event.preventDefault();
        await this.actor.sheet.addItem(event, this);
    }

    static async #onSkillDelete(event, target) {
        event.preventDefault();
        const skill = this.actor.items.find(s => s._id === target.dataset.itemId);
        this.skillScore = this.skillScore + skill.system.base;
        await this.actor.sheet.deleteItem(event);
        await this.actor.sheet.getData();
        this.render();
    }

    static async #onSpecDelete(event, target) {
        event.preventDefault();
        // Refund the spec pips above the parent skill base; if all spec pips returned, convert back to skill dice
        const spec = this.actor.items.find(s => s._id === target.dataset.itemId);
        const skill = this.actor.items.find(s => s.name === spec.system.skill);
        this.specScore = this.specScore + spec.system.base - skill.system.base;
        if (OD6S.specializationDice) {
            if (this.specScore === OD6S.pipsPerDice * OD6S.specStartingPipsPerDie) {
                this.specScore = 0;
                this.skillScore = this.skillScore + OD6S.pipsPerDice;
            }
        }
        await this.actor.sheet.deleteItem(event);
        await this.actor.sheet.getData();
        this.render();
    }

    static async #onIncrease(event, target) {
        event.preventDefault();
        if (this.skillScore < 1) {
            ui.notifications.warn(game.i18n.localize('OD6S.NOT_ENOUGH_SKILL_DICE'));
            return;
        }
        const skill = this.actor.items.find(i => i._id === target.dataset.itemId);
        if (skill) {
            const updates = [];
            updates.push({ _id: skill._id, [`system.base`]: (+target.dataset.base) + 1 });
            const specs = this.actor.items.filter(i => i.type === 'specialization' && i.system.skill === skill.name);
            for (const spec of specs) {
                updates.push({ _id: spec.id, [`system.base`]: spec.system.base + 1 });
            }
            await this.actor.updateEmbeddedDocuments('Item', updates);
            await this.actor.sheet.getData();
            this.skillScore = this.skillScore - 1;
        }
        this.render();
    }

    static async #onIncreaseSpec(event, target) {
        event.preventDefault();
        if (this.specScore < 1) return;
        const spec = this.actor.items.find(i => i._id === target.dataset.itemId);
        if (spec) {
            await spec.update({ [`system.base`]: (+target.dataset.base) + 1 });
            await this.actor.sheet.getData();
            this.specScore = this.specScore - 1;
        }
        this.render();
    }

    static async #onDecrease(event, target) {
        event.preventDefault();
        if (this.skillScore >= OD6S.initialSkills) return;
        if (target.dataset.base < 1) return;
        const skill = this.actor.items.find(i => i._id === target.dataset.itemId);
        if (skill) {
            const updates = [];
            updates.push({ _id: skill._id, [`system.base`]: (+target.dataset.base) - 1 });
            const specs = this.actor.items.filter(i => i.type === 'specialization' && i.system.skill === skill.name);
            for (const spec of specs) {
                updates.push({ _id: spec.id, [`system.base`]: spec.system.base - 1 });
            }
            await this.actor.updateEmbeddedDocuments('Item', updates);
            await this.actor.sheet.getData();
            this.skillScore = this.skillScore + 1;
        }
        this.render();
    }

    static async #onDecreaseSpec(event, target) {
        event.preventDefault();
        if (target.dataset.base <= 1) return;
        const spec = this.actor.items.find(i => i._id === target.dataset.itemId);
        if (spec) {
            await spec.update({ [`system.base`]: (+target.dataset.base) - 1 });
            await this.actor.sheet.getData();
            this.specScore = this.specScore + 1;
        }
        this.render();
    }

    static async #onSpecialize(event, target) {
        event.preventDefault();
        if (this.specScore === 0) {
            if (this.skillScore < OD6S.pipsPerDice) {
                ui.notifications.warning('OD6S.NOT_ENOUGH_SKILL_DICE');
                return;
            }
        }
        const specData = target.dataset;
        const specTemplate = "systems/od6s/templates/apps/character-creation/specialize.html";
        const html = await renderTemplate(specTemplate, specData);
        await foundry.applications.api.DialogV2.prompt({
            window: { title: game.i18n.localize("OD6S.CREATE_SPECIALIZATION") },
            content: html,
            ok: {
                label: game.i18n.localize("OD6S.CREATE_SPECIALIZATION"),
                callback: async (event2, button, dialog) => {
                    await this.addSpec((button.form ?? dialog.element).querySelector("#specname").value, specData);
                }
            }
        });
    }

    static async #onNavigate(event, target) {
        event.preventDefault();
        const action = target.value || target.dataset.action;

        if (action === "next") {
            if (this.step === 1) {
                await this.actor.sheet._onClearCharacterTemplate();
                await this.actor.deleteEmbeddedDocuments("Item", this.actor.items.map(i => i.id));
                const template = await od6sutilities.getItemByName(
                    this.characterTemplates.find(i => i._id === this.selectedTemplate).name);
                await this.actor.sheet._addCharacterTemplate(template);
                await this.actor.sheet.getData();
            }
            this.step = this.step + 1;
        } else if (action === "back") {
            if (this.step === 2) {
                await this.actor.sheet._onClearCharacterTemplate();
                await this.actor.deleteEmbeddedDocuments("Item", this.actor.items.map(i => i.id));
            }
            this.skillScore = OD6S.initialSkills;
            this.specScore = 0;
            this.step = this.step - 1;
        } else if (action === "cancel") {
            return this.close();
        } else if (action === "finish") {
            const update = {};
            if ((this.actor.img === '' || this.actor.img === "icons/svg/mystery-man.svg")
                && typeof (this.templateData.img) !== 'undefined' && this.templateData.img !== '') {
                update.img = this.templateData.img;
            }
            update[`system.created.value`] = true;
            await this.actor.update(update);
            return this.close();
        }
        this.render();
    }

    // Convert 1 skill die into specialization pips (1 die = pipsPerDice * 3 spec pips)
    static #onAddSpecDice(event, target) {
        event.preventDefault();
        if (this.skillScore < OD6S.pipsPerDice) {
            ui.notifications.warn('OD6S.NOT_ENOUGH_SKILL_DICE');
        } else {
            this.skillScore = this.skillScore - OD6S.pipsPerDice;
            this.specScore = this.specScore + (OD6S.pipsPerDice * 3);
        }
        this.render();
    }

    static #onRemoveSpecDice(event, target) {
        event.preventDefault();
        if (this.specScore < (OD6S.pipsPerDice * 3)) {
            ui.notifications.warn('OD6S.NOT_ENOUGH_SPECIALIZATION_DICE');
        } else {
            this.skillScore = this.skillScore + OD6S.pipsPerDice;
            this.specScore = this.specScore - (OD6S.pipsPerDice * 3);
        }
        this.render();
    }

    // --- Specialization Creation ---

    async addSpec(name, data) {
        if (typeof (name) === 'undefined' || name === '') {
            ui.notifications.warn(game.i18n.localize("OD6S.ERR_SPECIALIZATION_NAME"));
            return;
        }

        if (this.actor.specializations.find(s => s.name === name)) {
            ui.notifications.warn(game.i18n.localize("OD6S.ERR_SPECIALIZATION_EXISTS"));
            return;
        }

        const skill = this.actor.getEmbeddedDocument("Item", data.itemId, true);

        let base = skill.system.base;
        let add = 0;
        if (OD6S.specializationDice) {
            add = OD6S.pipsPerDice;
            base = base + add;
        } else {
            add = 1;
            base = base + add;
        }

        const newItemData = {
            name: name,
            type: "specialization",
            system: {
                attribute: skill.system.attribute,
                description: data.specname,
                base: base,
                time: skill.time,
                skill: skill.name
            }
        };
        await this.actor.createEmbeddedDocuments('Item', [newItemData]);
        this.actor.sheet.getData();

        if (this.specScore === 0) {
            this.specScore = (OD6S.pipsPerDice * OD6S.specStartingPipsPerDie) - add;
            this.skillScore = this.skillScore - OD6S.pipsPerDice;
        } else {
            this.specScore = this.specScore - add;
        }

        this.render();
    }

    // On close: if wizard was completed, render the sheet; otherwise revert all changes
    async close(options = {}) {
        await super.close(options);
        if (this.done) {
            this.actor.sheet.render(true);
        } else {
            await this.actor.sheet._onClearCharacterTemplate();
            await this.actor.deleteEmbeddedDocuments("Item", this.actor.items.map(i => i.id));
        }
    }

    static async #onSubmit(event, form, formData) {
        // No-op — form submission not used for character creation
    }
}
