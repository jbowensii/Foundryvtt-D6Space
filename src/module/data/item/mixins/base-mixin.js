const fields = foundry.data.fields;

/**
 * Mixin that adds the "base" template fields to an item DataModel.
 * Mirrors the "base" template block from template.json.
 */
export function BaseMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = {};

            schema.description = new fields.HTMLField({initial: ""});
            schema.labels = new fields.ObjectField();
            schema.tags = new fields.ArrayField(new fields.StringField());

            return schema;
        }
    };
}
