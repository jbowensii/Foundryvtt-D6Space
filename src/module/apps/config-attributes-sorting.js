import OD6S from "../config/config-od6s.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class od6sAttributesSortingConfiguration extends HandlebarsApplicationMixin(ApplicationV2) {

    requiresWorldReload = true;
    attributes = [];
    dragStart = null;

    static DEFAULT_OPTIONS = {
        id: "custom_attributes_sorting",
        classes: ["od6s", "settings"],
        tag: "form",
        position: { width: 600, height: "auto" },
        window: {
            title: "OD6S.CONFIG_ATTRIBUTES_SORTING",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        form: {
            handler: od6sAttributesSortingConfiguration.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            submit: od6sAttributesSortingConfiguration.#onClose
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/settings/attributes-sorting.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    constructor(options = {}) {
        super(options);
        const attributes = [];
        for (const i in OD6S.attributes) {
            const entry = {};
            entry.id = i;
            entry.name = OD6S.attributes[i].name;
            entry.sort = OD6S.attributes[i].sort;
            entry.active = OD6S.attributes[i].active;
            attributes.push(entry);
        }
        this.attributes = attributes.sort((a, b) => (a.sort) - (b.sort));
    }

    async _prepareContext(options) {
        const context = {};
        context.attributes = this.attributes;
        context.buttons = [{ type: "submit", icon: "fa-solid fa-save", label: "Submit" }];
        return context;
    }

    _onRender(context, options) {
        const items = this.element.querySelectorAll('li.attributes-sort-list');
        items.forEach(li => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", (ev) => this._onDragStart(ev), false);
        });

        this.element.addEventListener("dragover", (ev) => ev.preventDefault());
        this.element.addEventListener("drop", (ev) => this._onDrop(ev));
    }

    _onDragStart(ev) {
        this.dragStart = ev.target.dataset.attributeId;
    }

    _onDrop(ev) {
        const source = this.attributes.find(a => a.id === this.dragStart);
        this.dragStart = null;
        const dropTarget = ev.target.closest("li[data-attribute-id]");
        if (!dropTarget) return;
        const target = this.attributes.find(a => a.id === dropTarget.dataset.attributeId);
        if (source === target) return;

        const attributes = [];
        if (source.sort < target.sort) {
            for (let i = 0; i < this.attributes.length; i++) {
                if (i <= target.sort && i > source.sort) {
                    attributes.push({
                        id: this.attributes[i].id,
                        name: this.attributes[i].name,
                        sort: this.attributes[i].sort - 1,
                        active: this.attributes[i].active
                    });
                } else if (i === source.sort) {
                    attributes.push({
                        id: source.id,
                        name: source.name,
                        sort: target.sort,
                        active: source.active
                    });
                } else {
                    attributes.push(this.attributes[i]);
                }
            }
        } else {
            for (let i = 0; i < this.attributes.length; i++) {
                if (i >= target.sort && i < source.sort) {
                    attributes.push({
                        id: this.attributes[i].id,
                        name: this.attributes[i].name,
                        sort: this.attributes[i].sort + 1,
                        active: this.attributes[i].active
                    });
                } else if (i === source.sort) {
                    attributes.push({
                        id: source.id,
                        name: source.name,
                        sort: target.sort,
                        active: source.active
                    });
                } else {
                    attributes.push(this.attributes[i]);
                }
            }
        }
        this.attributes = attributes.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        this.render();
    }

    static async #onSubmit(event, form, formData) {
        // No-op for submit-on-change — actual save happens on close
    }

    static async #onClose() {
        const attrSort = {};
        for (const i in this.attributes) {
            const key = this.attributes[i].id;
            attrSort[key] = {};
            attrSort[key].sort = this.attributes[i].sort;
        }
        await game.settings.set('od6s', 'attributes_sorting', attrSort);
        if (this.requiresWorldReload) await SettingsConfig.reloadConfirm({ world: this.requiresWorldReload });
        await this.close();
    }
}
