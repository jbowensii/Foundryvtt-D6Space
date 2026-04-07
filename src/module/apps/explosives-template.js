// OD6S Explosive region placement — interactive canvas placement using v14 Scene Regions API
// with post-placement wall collision validation.

export default class ExplosivesTemplate {

    /**
     * Explosive data passed from the dialog (actor, item, type, etc.).
     * @type {object}
     */
    exData;

    /**
     * The actor sheet that originated the placement, used to minimize/maximize during placement.
     * @type {ActorSheet}
     */
    actorSheet;

    /**
     * Origin coordinates (token center) for range measurement and wall collision checks.
     * @type {{x: number, y: number}}
     */
    origin;

    /**
     * The blast radius in grid units.
     * @type {number}
     */
    radius;

    /* -------------------------------------------- */

    /**
     * Set explosive data and origin coordinates for placement.
     * @param {object} data - Explosive data from the dialog (actor, item, type, etc.)
     * @param {number} x - Origin X coordinate (token center)
     * @param {number} y - Origin Y coordinate (token center)
     */
    async setExplosiveData(data, x, y) {
        this.exData = data;
        this.actorSheet = this.exData.actor.sheet;
        this.originX = x;
        this.originY = y;
        this.origin = {x: x, y: y};
        this.radius = this._getBlastRadius(data);
    }

    /* -------------------------------------------- */

    /**
     * Determine the blast radius based on the explosive zones setting.
     * @param {object} data - Explosive data containing the item
     * @returns {number} The blast radius in grid units
     * @private
     */
    _getBlastRadius(data) {
        if (game.settings.get('od6s', 'explosive_zones')) {
            return data.item.system.blast_radius['4'].range;
        }
        return data.item.system.blast_radius['3'].range;
    }

    /* -------------------------------------------- */

    /**
     * Create a preview of the explosive placement using the Scene Regions API.
     * Uses canvas.regions.placeRegion() for interactive placement, then validates
     * the placement against wall collisions. If blocked, deletes the region and returns null.
     *
     * @returns {Promise<RegionDocument[]|null>} An array containing the placed RegionDocument,
     *          or null if cancelled or blocked by walls.
     *          The returned array format maintains compatibility with handleResult() in ExplosiveDialog.
     */
    async drawPreview() {
        // Hide the sheet that originated the preview
        this.actorSheet?.minimize();

        const radiusPixels = this.radius * canvas.grid.size;
        const hidden = game.settings.get('od6s', 'hide_explosive_templates');

        let regionDoc;
        try {
            regionDoc = await canvas.regions.placeRegion({
                name: game.i18n.localize("OD6S.EXPLOSIVE"),
                color: "#FFFF00",
                shapes: [{type: "ellipse", x: 0, y: 0, radiusX: radiusPixels, radiusY: radiusPixels}],
                visibility: hidden ? CONST.REGION_VISIBILITY.LAYER : CONST.REGION_VISIBILITY.ALWAYS,
                flags: {
                    od6s: {
                        explosive: true,
                        originalOwner: game.user.id
                    }
                }
            });
        } catch {
            // Player cancelled placement (e.g. right-click or Escape)
            await this.actorSheet?.maximize();
            return null;
        }

        if (!regionDoc) {
            // User cancelled — no region created
            await this.actorSheet?.maximize();
            return null;
        }

        // Determine the placed center position
        const center = this._getRegionCenter(regionDoc);

        // Validate wall collision — check both movement and sight walls
        const hasCollision =
            CONFIG.Canvas.polygonBackends.move.testCollision(
                this.origin, center,
                {type: "move", mode: "any"}
            ) ||
            CONFIG.Canvas.polygonBackends.sight.testCollision(
                this.origin, center,
                {type: "sight", mode: "any"}
            );

        if (hasCollision) {
            ui.notifications.warn(game.i18n.localize("OD6S.WARN_EXPLOSIVE_NOT_CONFIGURED_FOR_ZONES"));
            await regionDoc.delete();
            await this.actorSheet?.maximize();
            return null;
        }

        await this.actorSheet?.maximize();

        // Return in array format for compatibility with ExplosiveDialog.handleResult()
        // handleResult() accesses template[0].id, template[0].x, template[0].y
        return [regionDoc];
    }

    /* -------------------------------------------- */

    /**
     * Get the center coordinates of a placed region from its first shape.
     * @param {RegionDocument} regionDoc - The placed region document
     * @returns {{x: number, y: number}} The center coordinates in canvas space
     * @private
     */
    _getRegionCenter(regionDoc) {
        // The region's shapes store coordinates relative to the region.
        // The region itself has an x/y offset (its position on the canvas).
        // For placeRegion(), the shape center is placed at the clicked location.
        const shape = regionDoc.shapes[0];
        if (shape) {
            return {x: shape.x, y: shape.y};
        }
        // Fallback: use the region object's center if available
        if (regionDoc.object?.center) {
            return regionDoc.object.center;
        }
        return {x: 0, y: 0};
    }
}
