import {od6sutilities} from "../system/utilities.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class OD6SAddCrew extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "add-crew",
        classes: ["od6s"],
        tag: "form",
        position: { width: 300, height: 200 },
        window: { title: "OD6S.ADD_CREW" },
        form: { handler: OD6SAddCrew.#onSubmit, closeOnSubmit: true }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/actor/common/add-crew.html" }
    };

    constructor(options = {}) {
        super(options);
        this.crewData = options.crewData;
    }

    async _prepareContext(options) {
        return { object: this.crewData };
    }

    static async #onSubmit(event, form, formData) {
        const fd = formData.object;
        if (event.submitter.value === 'cancel') {
            return;
        }
        const actor = await od6sutilities.getActorFromUuid(fd.actor);
        await actor.sheet.linkCrew(fd.addcrew);
    }
}

export default OD6SAddCrew;
