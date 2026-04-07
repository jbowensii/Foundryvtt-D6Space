import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "armor" item type.
 * Composes: base + equipment + equip + armor-specific fields.
 */
export class ArmorData extends EquipMixin(EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.pr = new fields.NumberField({initial: 0, integer: true});
        schema.er = new fields.NumberField({initial: 0, integer: true});
        schema.protection = new fields.NumberField({initial: 0, integer: true});
        schema.label = new fields.StringField({initial: "OD6S.CHAR_ARMOR"});

        return schema;
    }
}
