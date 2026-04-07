import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "manifestation" item type.
 * Composes: base + manifestation-specific fields.
 */
export class ManifestationData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.label = new fields.StringField({initial: "OD6S.CHAR_MANIFESTATIONS"});
        schema.attack = new fields.BooleanField({initial: false});
        schema.activate = new fields.BooleanField({initial: false});
        schema.active = new fields.BooleanField({initial: false});
        schema.roll = new fields.BooleanField({initial: false});

        const skillEntry = () => new fields.SchemaField({
            value: new fields.BooleanField({initial: false}),
            difficulty: new fields.StringField({initial: "E"}),
            rolled: new fields.BooleanField({initial: false}),
        });

        schema.skills = new fields.SchemaField({
            channel: skillEntry(),
            sense: skillEntry(),
            transform: skillEntry(),
        });

        return schema;
    }
}
