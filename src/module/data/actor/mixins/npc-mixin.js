const fields = foundry.data.fields;

/**
 * Mixin that adds the "npc" template fields to an actor DataModel.
 * Mirrors the "npc" template block from template.json.
 */
export function NpcMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.npc_type = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.CHAR_TYPE"}),
                content: new fields.StringField({initial: ""}),
            });

            schema.description = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.DESCRIPTION"}),
                content: new fields.HTMLField({initial: ""}),
            });

            schema.fatepoints = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_FATE_POINTS"}),
                short_label: new fields.StringField({initial: "OD6S.CHAR_FATE_POINTS_SHORT"}),
                value: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.characterpoints = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_CHAR_POINTS"}),
                short_label: new fields.StringField({initial: "OD6S.CHAR_CHAR_POINTS_SHORT"}),
                value: new fields.NumberField({initial: 0, integer: true}),
            });

            return schema;
        }
    };
}
