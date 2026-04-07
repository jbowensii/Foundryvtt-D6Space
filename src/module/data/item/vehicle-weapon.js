import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";
import {VehicleWeaponsMixin} from "./mixins/vehicle-weapons-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "vehicle-weapon" item type.
 * Composes: base + equipment + equip + vehicle-weapons.
 */
export class VehicleWeaponData extends VehicleWeaponsMixin(EquipMixin(EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel)))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.label = new fields.StringField({initial: "OD6S.VEHICLE_WEAPON"});

        return schema;
    }
}
