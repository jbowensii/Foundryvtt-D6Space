const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class OD6SItemInfo extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "item-info",
        classes: ["od6s", "bordered", "boxed", "item-info-ok-button", "align-form-header", "align-center-header"],
        position: { width: 320, height: "auto" },
        window: {
            title: "OD6S.ITEM_INFO",
            resizable: true,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/item/item-info.html" }
    };

    constructor(itemData, options = {}) {
        super(options);
        this._itemData = itemData;
    }

    async _prepareContext(options) {
        return { object: this._itemData };
    }
}
