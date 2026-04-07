const fields = foundry.data.fields;

/**
 * Mixin that adds the "attributes" template fields to an actor DataModel.
 * Mirrors the "attributes" template block from template.json.
 */
export function AttributesMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = {};

            const attributeSchema = (label, shortLabel, defaults = {}) => new fields.SchemaField({
                label: new fields.StringField({initial: label}),
                short_label: new fields.StringField({initial: shortLabel}),
                base: new fields.NumberField({initial: 0, integer: true}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
                max: new fields.NumberField({initial: defaults.max ?? 15, integer: true}),
                min: new fields.NumberField({initial: defaults.min ?? 3, integer: true}),
                type: new fields.StringField({initial: "Number"}),
            });

            schema.attributes = new fields.SchemaField({
                agi: attributeSchema("OD6S.CHAR_AGILITY", "OD6S.CHAR_AGILITY_SHORT"),
                str: attributeSchema("OD6S.CHAR_STRENGTH", "OD6S.CHAR_STRENGTH_SHORT"),
                mec: attributeSchema("OD6S.CHAR_MECHANICAL", "OD6S.CHAR_MECHANICAL_SHORT"),
                kno: attributeSchema("OD6S.CHAR_KNOWLEDGE", "OD6S.CHAR_KNOWLEDGE_SHORT"),
                per: attributeSchema("OD6S.CHAR_PERCEPTION", "OD6S.CHAR_PERCEPTION_SHORT"),
                tec: attributeSchema("OD6S.CHAR_TECHNICAL", "OD6S.CHAR_TECHNICAL_SHORT"),
                met: attributeSchema("OD6S.CHAR_METAPHYSICS", "OD6S.CHAR_METAPHYSICS_SHORT", {max: undefined, min: undefined}),
                ca1: attributeSchema("OD6S.CHAR_CUSTOM_ATTRIBUTE_01", "OD6S.CHAR_CUSTOM_ATTRIBUTE_01_SHORT", {max: undefined, min: undefined}),
                ca2: attributeSchema("OD6S.CHAR_CUSTOM_ATTRIBUTE_02", "OD6S.CHAR_CUSTOM_ATTRIBUTE_02_SHORT", {max: undefined, min: undefined}),
                ca3: attributeSchema("OD6S.CHAR_CUSTOM_ATTRIBUTE_03", "OD6S.CHAR_CUSTOM_ATTRIBUTE_03_SHORT", {max: undefined, min: undefined}),
                ca4: attributeSchema("OD6S.CHAR_CUSTOM_ATTRIBUTE_04", "OD6S.CHAR_CUSTOM_ATTRIBUTE_04_SHORT", {max: undefined, min: undefined}),
            });

            return schema;
        }
    };
}
