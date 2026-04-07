import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "starship-gear" item type.
 * Composes: base + equipment + equip + starship-gear-specific fields.
 */
export class StarshipGearData extends EquipMixin(EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.quantity = new fields.NumberField({initial: 1, integer: true});
        schema.consumable = new fields.BooleanField({initial: false});
        schema.label = new fields.StringField({initial: "OD6S.STARSHIP_GEAR"});

        return schema;
    }
}
