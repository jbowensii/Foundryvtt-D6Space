const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class od6sInitiativeConfiguration extends HandlebarsApplicationMixin(ApplicationV2) {

    requiresWorldReload = false;

    static DEFAULT_OPTIONS = {
        id: "od6s-config-initiative",
        classes: ["od6s", "settings"],
        tag: "form",
        position: { width: 600, height: "auto" },
        window: {
            title: "OD6S.CONFIG_INITIATIVE_MENU",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        form: {
            handler: od6sInitiativeConfiguration.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            submit: od6sInitiativeConfiguration.#onClose
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/settings/initiative-settings.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = {};
        context.settings = Array.from(game.settings.settings).filter(s => s[1].od6sInitiative).map(i => i[1]);
        context.settings.forEach(s => s.inputType = s.type === Boolean ? "checkbox" : "text");
        context.settings.forEach(s => s.choice = typeof(s.choices) === 'undefined' ? false : true);
        context.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));

        const rerollSetting = context.settings.find(s => s.key === 'reroll_initiative');
        if (rerollSetting && !rerollSetting.value) {
            const autoChar = context.settings.find(s => s.key === 'auto_reroll_character');
            const autoNpc = context.settings.find(s => s.key === 'auto_reroll_npc');
            if (autoChar) { autoChar.value = false; }
            if (autoNpc) { autoNpc.value = false; }
        }

        context.buttons = [{ type: "submit", icon: "fa-solid fa-save", label: "Submit" }];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        for (const setting in formData.object) {
            await game.settings.set("od6s", setting, formData.object[setting]);
            const s = game.settings.settings.get('od6s.' + setting);
            this.requiresWorldReload ||= s?.requiresReload;
        }

        if (formData.object.reroll_initiative === false) {
            await game.settings.set("od6s", 'auto_reroll_character', false);
            await game.settings.set("od6s", 'auto_reroll_npc', false);
        }
        this.render();
    }

    static async #onClose() {
        if (this.requiresWorldReload) await SettingsConfig.reloadConfirm({ world: this.requiresWorldReload });
        await this.close();
    }
}
