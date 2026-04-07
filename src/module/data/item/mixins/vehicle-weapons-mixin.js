const fields = foundry.data.fields;

/**
 * Mixin that adds the "vehicle-weapons" template fields to an item DataModel.
 * Mirrors the "vehicle-weapons" template block from template.json.
 */
export function VehicleWeaponsMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.scale = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.damaged = new fields.NumberField({initial: 0, integer: true});

            schema.ammo = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                value: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.arc = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                value: new fields.StringField({initial: ""}),
            });

            schema.fire_arc = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                value: new fields.StringField({initial: ""}),
            });

            schema.crew = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                value: new fields.NumberField({initial: 1, integer: true}),
            });

            schema.attribute = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                value: new fields.StringField({initial: "mec"}),
            });

            schema.skill = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                value: new fields.StringField({initial: ""}),
            });

            schema.specialization = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                value: new fields.StringField({initial: ""}),
            });

            schema.fire_control = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.range = new fields.SchemaField({
                short: new fields.NumberField({initial: 0}),
                medium: new fields.NumberField({initial: 0}),
                long: new fields.NumberField({initial: 0}),
            });

            schema.damage = new fields.SchemaField({
                type: new fields.StringField({initial: ""}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.linked = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                value: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.difficulty = new fields.NumberField({initial: 0});

            schema.mods = new fields.SchemaField({
                difficulty: new fields.NumberField({initial: 0}),
                attack: new fields.NumberField({initial: 0}),
                damage: new fields.NumberField({initial: 0}),
            });

            return schema;
        }
    };
}
