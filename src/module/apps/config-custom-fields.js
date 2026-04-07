import OD6S from "../config/config-od6s.js"

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class od6sCustomFieldsConfiguration extends HandlebarsApplicationMixin(ApplicationV2) {

    requiresWorldReload = false;

    static DEFAULT_OPTIONS = {
        id: "custom_labels",
        classes: ["od6s", "settings"],
        tag: "form",
        position: { width: 600, height: "auto" },
        window: {
            title: "OD6S.CONFIG_CUSTOM_FIELDS",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        form: {
            handler: od6sCustomFieldsConfiguration.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            submit: od6sCustomFieldsConfiguration.#onClose
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/settings/custom-fields.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = {};
        context.settings = Array.from(game.settings.settings).filter(s => s[1].od6sCustomField).map(i => i[1]);
        context.settings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");
        context.settings.forEach(s => s.choice = typeof(s.choices) === 'undefined' ? false : true);
        context.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        context.buttons = [{ type: "submit", icon: "fa-solid fa-save", label: "Submit" }];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        for (const setting in formData.object) {
            if (setting.includes("actor_types")) {
                let value = formData.object[setting][0];
                for (const type in OD6S.actorMasks) {
                    value = formData.object[setting].includes(type) ?
                        od6sCustomFieldsConfiguration.#updateActorTypes(value, type, true) :
                        od6sCustomFieldsConfiguration.#updateActorTypes(value, type, false);
                }
                await game.settings.set("od6s", setting, value);
            } else {
                await game.settings.set("od6s", setting, formData.object[setting]);
            }
            const s = game.settings.settings.get('od6s.' + setting);
            this.requiresWorldReload ||= s?.requiresReload;
        }
    }

    static #updateActorTypes(value, type, op) {
        if (op) {
            value |= (1 << OD6S.actorMasks[type]);
        } else {
            value &= ~(1 << OD6S.actorMasks[type]);
        }
        return value;
    }

    static async #onClose() {
        if (this.requiresWorldReload) await SettingsConfig.reloadConfirm({ world: this.requiresWorldReload });
        await this.close();
    }
}
