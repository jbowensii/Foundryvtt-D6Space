import {BaseMixin} from "./mixins/base-mixin.js";
import {AdvantageMixin} from "./mixins/advantage-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "advantage" item type.
 * Composes: base + advantage.
 */
export class AdvantageData extends AdvantageMixin(BaseMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.label = new fields.StringField({initial: "OD6S.CHAR_ADVANTAGES"});
        return schema;
    }
}
