import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "specialability" item type.
 * Composes: base only.
 */
export class SpecialAbilityData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.label = new fields.StringField({initial: "OD6S.CHAR_SPECIAL_ABILITIES"});
        return schema;
    }
}
