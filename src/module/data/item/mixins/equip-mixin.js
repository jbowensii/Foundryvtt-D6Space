const fields = foundry.data.fields;

/**
 * Mixin that adds the "equip" template fields to an item DataModel.
 * Mirrors the "equip" template block from template.json.
 */
export function EquipMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.equipped = new fields.SchemaField({
                value: new fields.BooleanField({initial: false}),
                type: new fields.StringField({initial: "Boolean"}),
                label: new fields.StringField({initial: "OD6S.EQUIPPED"}),
                consumable: new fields.BooleanField({initial: false}),
            });

            return schema;
        }
    };
}
