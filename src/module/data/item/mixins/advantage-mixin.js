const fields = foundry.data.fields;

/**
 * Mixin that adds the "advantage" template fields to an item DataModel.
 * Mirrors the "advantage" template block from template.json.
 */
export function AdvantageMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.attribute = new fields.StringField({initial: ""});
            schema.skill = new fields.StringField({initial: ""});
            schema.value = new fields.StringField({initial: ""});

            return schema;
        }
    };
}
