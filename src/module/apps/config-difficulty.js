const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class od6sDifficultyConfiguration extends HandlebarsApplicationMixin(ApplicationV2) {

    requiresWorldReload = false;

    static DEFAULT_OPTIONS = {
        id: "custom_labels",
        classes: ["od6s", "settings"],
        tag: "form",
        position: { width: 600, height: "auto" },
        window: {
            title: "OD6S.CONFIG_DIFFICULTY_MENU",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        form: {
            handler: od6sDifficultyConfiguration.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            submit: od6sDifficultyConfiguration.#onClose
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/settings/settings.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = {};
        context.settings = Array.from(game.settings.settings).filter(s => s[1].od6sDifficulty).map(i => i[1]);
        context.settings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");
        context.settings.forEach(s => s.choice = typeof(s.choices) === 'undefined' ? false : true);
        context.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        context.buttons = [{ type: "submit", icon: "fa-solid fa-save", label: "Submit" }];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        for (let setting in formData.object) {
            await game.settings.set("od6s", setting, formData.object[setting]);
            const s = game.settings.settings.get('od6s.' + setting);
            this.requiresWorldReload ||= s?.requiresReload;
        }
    }

    static async #onClose() {
        if (this.requiresWorldReload) await SettingsConfig.reloadConfirm({ world: this.requiresWorldReload });
        await this.close();
    }
}
