import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "vehicle" item type (vehicle as an owned item).
 * Composes: base + equipment.
 */
export class VehicleItemData extends EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.label = new fields.StringField({initial: "OD6S.CHAR_VEHICLES"});

        return schema;
    }
}
