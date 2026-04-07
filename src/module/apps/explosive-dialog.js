// OD6S Explosive dialog — handles explosive type selection, template placement, and detonation workflow.
import ExplosivesTemplate from "./explosives-template.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export  default class ExplosiveDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        classes: ["od6s", "dialog"],
        tag: "form",
        position: { width: 300, height: "auto" },
        window: { title: "OD6S.SET_EXPLOSIVE" },
        actions: {}
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/apps/explosive.html" }
    };

    constructor(options = {}) {
        super(options);
        this.data = options.explosiveData;
        this.data.timer = 0;
        this.data.stage = 0;
    }

    async _prepareContext(options) {
        return this.data;
    }

    _onRender(context, options) {
        this.element.querySelectorAll('.explosive-type').forEach(el => {
            el.addEventListener('change', async (ev) => {
                ev.preventDefault();
                this.data.type = ev.target.value;
                this.render();
            });
        });

        this.element.querySelectorAll('.submit').forEach(el => {
            el.addEventListener('click', async (ev) => {
                ev.preventDefault();

                if(game.settings.get('od6s','auto_explosive')) {

                    let radius;
                    if (game.settings.get('od6s','explosive_zones')) {
                        radius = this.data.item.system.blast_radius['4'].range;
                        if(radius < 1) {
                            ui.notifications.warn(game.i18n.localize('OD6S.WARN_EXPLOSIVE_NOT_CONFIGURED_FOR_ZONES'));
                            return false;
                        }
                    } else {
                        radius = this.data.item.system.blast_radius['3'].range;
                    }

                    this.token = canvas.tokens.controlled[0];
                    const explosiveTemplateDoc = new RegionDocument({
                        t: "circle",
                        user: game.user.id,
                        fillColor: "#FFFF00",
                        borderColor: "#000000",
                        distance: radius,
                        x: this.token.center.x,
                        y: this.token.center.y,
                        hidden: true
                    }, {parent: canvas.scene});
                    const explosiveTemplate = new ExplosivesTemplate(explosiveTemplateDoc);
                    await explosiveTemplate.setExplosiveData(this.data, this.token.center.x, this.token.center.y);
                    //const result = await explosiveTemplate.drawPreview();
                    this.createTemplate(explosiveTemplate);
                    await this.close();
                } else {
                    this.data.stage += 1;
                    if(this.data.type === "OD6S.EXPLOSIVE_THROWN") {
                        await this.data.item.setFlag('od6s','explosiveSet', true);
                        await this.data.item.roll(false);
                    }
                    await this.close();
                }
            });
        });
    }

    async _updateObject() {
        await this.placeTemplate();
    }

    async placeTemplate() {
    }

    // Start interactive region placement; null result means the player cancelled or placement was blocked
    createTemplate(explosiveTemplate) {
        explosiveTemplate.drawPreview().then((template) => {
            if (template) {
                this.handleResult(template);
            }
            // null means cancelled or blocked by walls — nothing to do
        }).catch(e => {
            // Unexpected error during placement
            console.error("OD6S | Explosive placement failed:", e);
        });
    }

    async addTargets() {

    }

    // After template placement: measure range, store flags linking region to weapon, and trigger hit roll
    async handleResult(template) {
        this.data.stage += 1;

        if (this.data.stage === 1 && this.data.type === 'OD6S.EXPLOSIVE_THROWN') {
            const regionDoc = template[0];
            const regionCenter = regionDoc.object?.center
                ?? {x: regionDoc.shapes[0]?.x ?? 0, y: regionDoc.shapes[0]?.y ?? 0};
            const distance = Math.floor(canvas.grid.measureDistance(
                {x: this.token.center.x, y: this.token.center.y},
                regionCenter, {gridSpaces: false}))

            // Set flags
            const itemFlagData = {
                flags: {
                    od6s: {
                        explosiveSet: true,
                        explosiveTemplate: template[0].id,
                        explosiveRange: distance,
                        explosiveOrigin: {x: this.token.center.x, y: this.token.center.y}
                    }
                }
            }
            await this.data.item.update(itemFlagData);
            const templateFlagData = {
                flags: {
                    od6s: {
                        explosive: true,
                        actor: this.data.actor.uuid,
                        item: this.data.item.id
                    }
                }
            }
            await template[0].update(templateFlagData);
            // Trigger a hit roll
            this.data.item.roll(false);
        } else if (this.data.stage === 1) {
            // Show next dialog
            this.render({ force: true });
        }
    }

}
