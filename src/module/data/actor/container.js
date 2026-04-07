const fields = foundry.data.fields;

/**
 * DataModel for the "container" actor type.
 * Standalone — does not use any shared template mixins.
 */
export class ContainerData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        schema.itemtypes = new fields.SchemaField({
            armor: new fields.BooleanField({initial: true}),
            weapon: new fields.BooleanField({initial: true}),
            gear: new fields.BooleanField({initial: true}),
            cybernetics: new fields.BooleanField({initial: false}),
            vehicle_weapons: new fields.BooleanField({initial: false}),
            vehicle_gear: new fields.BooleanField({initial: false}),
            starship_weapons: new fields.BooleanField({initial: false}),
            starship_gear: new fields.BooleanField({initial: false}),
        });

        schema.merchant = new fields.BooleanField({initial: true});
        schema.visible = new fields.BooleanField({initial: false});
        schema.locked = new fields.BooleanField({initial: false});

        schema.capacity = new fields.NumberField({initial: 0, integer: true});

        return schema;
    }
}
