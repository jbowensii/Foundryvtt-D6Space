import {BaseMixin} from "./mixins/base-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "item-group" item type.
 * Composes: base + item-group-specific fields.
 */
export class ItemGroupData extends BaseMixin(foundry.abstract.TypeDataModel) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.actor_types = new fields.ArrayField(
            new fields.StringField(),
            {initial: ["character"]}
        );
        schema.items = new fields.ArrayField(new fields.ObjectField());
        schema.label = new fields.StringField({initial: "OD6S.ITEM_GROUP"});

        return schema;
    }
}
