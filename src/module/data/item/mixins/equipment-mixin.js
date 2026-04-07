const fields = foundry.data.fields;

/**
 * Mixin that adds the "equipment" template fields to an item DataModel.
 * Mirrors the "equipment" template block from template.json.
 */
export function EquipmentMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.cost = new fields.NumberField({initial: 0});
            schema.price = new fields.StringField({initial: ""});
            schema.availability = new fields.StringField({initial: ""});
            schema.quantity = new fields.NumberField({initial: 1, integer: true});

            return schema;
        }
    };
}
