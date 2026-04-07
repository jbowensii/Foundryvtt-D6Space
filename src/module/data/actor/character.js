import {AttributesMixin} from "./mixins/attributes-mixin.js";
import {CommonMixin} from "./mixins/common-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "character" actor type.
 * Composes: attributes + common + character-specific fields.
 */
export class CharacterData extends CommonMixin(AttributesMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.background = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_BACKGROUND"}),
            content: new fields.HTMLField({initial: ""}),
        });

        schema.created = new fields.SchemaField({
            type: new fields.StringField({initial: "Boolean"}),
            label: new fields.StringField({initial: "OD6S.CREATED"}),
            value: new fields.BooleanField({initial: true}),
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

        schema.gender = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_GENDER"}),
            content: new fields.StringField({initial: ""}),
        });

        schema.age = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            label: new fields.StringField({initial: "OD6S.CHAR_AGE"}),
            content: new fields.StringField({initial: ""}),
        });

        schema.height = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_HEIGHT"}),
            content: new fields.StringField({initial: ""}),
        });

        schema.weight = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_WEIGHT"}),
            content: new fields.StringField({initial: ""}),
        });

        schema.description = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_PHYSICAL_DESCRIPTION"}),
            content: new fields.HTMLField({initial: ""}),
        });

        schema.personality = new fields.SchemaField({
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.CHAR_PERSONALITY"}),
            content: new fields.HTMLField({initial: ""}),
        });

        schema.metaphysicsextranormal = new fields.SchemaField({
            type: new fields.StringField({initial: "Boolean"}),
            label: new fields.StringField({initial: "OD6S.METAPHYSICS_EXTRANORMAL"}),
            value: new fields.BooleanField({initial: false}),
        });

        schema.vehicle = new fields.ObjectField();

        return schema;
    }
}
