import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "species-template" item type.
 * Composes: base + species-template-specific fields.
 */
export class SpeciesTemplateData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();

        const attrRange = () => new fields.SchemaField({
            min: new fields.NumberField({initial: 3, integer: true}),
            max: new fields.NumberField({initial: 15, integer: true}),
        });

        schema.attributes = new fields.SchemaField({
            agi: attrRange(),
            str: attrRange(),
            kno: attrRange(),
            mec: attrRange(),
            per: attrRange(),
            tec: attrRange(),
            met: attrRange(),
        });

        schema.items = new fields.ArrayField(new fields.ObjectField());
        schema.label = new fields.StringField({initial: "OD6S.SPECIES_TEMPLATE"});

        return schema;
    }
}
