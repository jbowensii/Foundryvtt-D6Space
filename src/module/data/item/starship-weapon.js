import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";
import {VehicleWeaponsMixin} from "./mixins/vehicle-weapons-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "starship-weapon" item type.
 * Composes: base + equipment + equip + vehicle-weapons + starship-weapon-specific fields.
 */
export class StarshipWeaponData extends VehicleWeaponsMixin(EquipMixin(EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel)))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema["area-units"] = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            value: new fields.NumberField({initial: 0}),
            label: new fields.StringField({initial: "OD6S.AREA_UNITS"}),
        });

        schema.mass = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            value: new fields.NumberField({initial: 0}),
            label: new fields.StringField({initial: "OD6S.MASS"}),
        });

        schema.energy = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            value: new fields.NumberField({initial: 0}),
            label: new fields.StringField({initial: "OD6S.ENERGY"}),
        });

        schema.label = new fields.StringField({initial: "OD6S.STARSHIP_WEAPON"});

        return schema;
    }
}
