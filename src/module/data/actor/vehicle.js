import {AttributesMixin} from "./mixins/attributes-mixin.js";
import {VehicleCommonMixin} from "./mixins/vehicle-common-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "vehicle" actor type.
 * Composes: attributes + vehicle_common + vehicle-specific fields.
 */
export class VehicleData extends VehicleCommonMixin(AttributesMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.cover = new fields.SchemaField({
            value: new fields.StringField({initial: ""}),
            type: new fields.StringField({initial: "String"}),
            label: new fields.StringField({initial: "OD6S.COVER"}),
        });

        schema.altitude = new fields.SchemaField({
            value: new fields.NumberField({initial: 0, integer: true}),
            type: new fields.StringField({initial: "Number"}),
            label: new fields.StringField({initial: "OD6S.ALTITUDE"}),
        });

        return schema;
    }
}
