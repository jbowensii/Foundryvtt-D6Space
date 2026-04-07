import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "action" item type.
 * Composes: base + action-specific fields.
 */
export class ActionData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.rollable = new fields.BooleanField({initial: false});
        schema.type = new fields.StringField({initial: ""});
        schema.subtype = new fields.StringField({initial: ""});
        schema.itemId = new fields.StringField({initial: ""});

        return schema;
    }
}
