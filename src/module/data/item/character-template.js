import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "character-template" item type.
 * Composes: base + character-template-specific fields.
 */
export class CharacterTemplateData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.species = new fields.StringField({initial: ""});

        schema.attributes = new fields.SchemaField({
            agi: new fields.NumberField({initial: 0, integer: true}),
            str: new fields.NumberField({initial: 0, integer: true}),
            kno: new fields.NumberField({initial: 0, integer: true}),
            mec: new fields.NumberField({initial: 0, integer: true}),
            per: new fields.NumberField({initial: 0, integer: true}),
            tec: new fields.NumberField({initial: 0, integer: true}),
            met: new fields.NumberField({initial: 0, integer: true}),
        });

        schema.fp = new fields.NumberField({initial: 0, integer: true});
        schema.cp = new fields.NumberField({initial: 0, integer: true});
        schema.funds = new fields.NumberField({initial: 0});
        schema.credits = new fields.NumberField({initial: 0});
        schema.move = new fields.NumberField({initial: 10, integer: true});
        schema.me = new fields.BooleanField({initial: false});
        schema.items = new fields.ArrayField(new fields.ObjectField());
        schema.label = new fields.StringField({initial: "OD6S.CHARACTER_TEMPLATES"});

        return schema;
    }
}
