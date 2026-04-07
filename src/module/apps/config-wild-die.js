const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class od6sWildDieConfiguration extends HandlebarsApplicationMixin(ApplicationV2) {

    requiresWorldReload = false;
    show = undefined;

    static DEFAULT_OPTIONS = {
        id: "wild_die",
        classes: ["od6s", "settings"],
        tag: "form",
        position: { width: 600, height: "auto" },
        window: {
            title: "OD6S.CONFIG_WILD_DIE_MENU",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        form: {
            handler: od6sWildDieConfiguration.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            submit: od6sWildDieConfiguration.#onClose
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/settings/wild-die.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = {};
        context.settings = Array.from(game.settings.settings).filter(s => s[1].od6sWildDie).map(i => i[1]);
        context.settings.forEach(s => s.inputType = s.type === Boolean ? "checkbox" : "text");
        context.settings.forEach(s => s.choice = typeof(s.choices) === 'undefined' ? false : true);
        context.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        if (typeof(this.show) === 'undefined') {
            this.show = context.settings.find(s => s.key === 'use_wild_die').value;
        }
        context.show = this.show;
        context.buttons = [{ type: "submit", icon: "fa-solid fa-save", label: "Submit" }];
        return context;
    }

    _onRender(context, options) {
        const wildDieCheckbox = this.element.querySelector('.use_wild_die input[type="checkbox"]');
        if (wildDieCheckbox) {
            wildDieCheckbox.addEventListener('change', () => {
                this.show = !this.show;
                this.render();
            });
        }
    }

    static async #onSubmit(event, form, formData) {
        for (const setting in formData.object) {
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
