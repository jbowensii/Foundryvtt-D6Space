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
                    const templateData = {
                        t: "circle",
                        user: game.user.id,
                        fillColor: "#FFFF00",
                        borderColor: "#000000",
                        distance: radius,
                        x: this.token.center.x,
                        y: this.token.center.y,
                        hidden: true
                    }

                    const explosiveTemplateDoc = new MeasuredTemplateDocument(templateData, {parent: canvas.scene});
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

    createTemplate(explosiveTemplate) {
        const result = explosiveTemplate.drawPreview();
        Promise.resolve(result).then((template) => {
            this.handleResult(template).then();
        }).catch(e => {
            // Player has likely right-clicked to cancel
        });
    }

    async addTargets() {

    }

    async handleResult(template) {
        this.data.stage += 1;

        if (this.data.stage === 1 && this.data.type === 'OD6S.EXPLOSIVE_THROWN') {
            // Calculate Range
            const range = "";
            const distance = Math.floor(canvas.grid.measureDistance({x: this.token.center.x, y: this.token.center.y},
                {x: template[0].x, y: template[0].y}, {gridSpaces: false}))

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
