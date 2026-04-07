import {BaseMixin} from "./mixins/base-mixin.js";
import {AdvantageMixin} from "./mixins/advantage-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "cybernetic" item type.
 * Composes: base + advantage + equipment + equip + cybernetic-specific fields.
 */
export class CyberneticData extends EquipMixin(EquipmentMixin(AdvantageMixin(BaseMixin(foundry.abstract.TypeDataModel)))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.location = new fields.StringField({initial: ""});
        schema.slots = new fields.NumberField({initial: 0, integer: true});
        schema.label = new fields.StringField({initial: "OD6S.CHAR_CYBERNETICS"});

        return schema;
    }
}
