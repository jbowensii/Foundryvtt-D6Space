import {AttributesMixin} from "./mixins/attributes-mixin.js";
import {VehicleCommonMixin} from "./mixins/vehicle-common-mixin.js";

const fields = foundry.data.fields;

/**
 * Helper to create the sensor types sub-schema for starships.
 */
function sensorTypesSchema() {
    const sensorEntry = (label) => new fields.SchemaField({
        score: new fields.NumberField({initial: 0, integer: true}),
        range: new fields.NumberField({initial: 0, integer: true}),
        label: new fields.StringField({initial: label}),
        type: new fields.StringField({initial: "Number"}),
    });
    return new fields.SchemaField({
        passive: sensorEntry("OD6S.SENSORS_PASSIVE"),
        scan: sensorEntry("OD6S.SENSORS_SCAN"),
        search: sensorEntry("OD6S.SENSORS_SEARCH"),
        focus: sensorEntry("OD6S.SENSORS_FOCUS"),
    });
}

/**
 * DataModel for the "starship" actor type.
 * Composes: attributes + vehicle_common + starship-specific fields.
 * Note: starship overrides sensors from vehicle_common with sensors.value=true.
 */
export class StarshipData extends VehicleCommonMixin(AttributesMixin(foundry.abstract.TypeDataModel)) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.interstellar_drive = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            value: new fields.NumberField({initial: 0, integer: true}),
            label: new fields.StringField({initial: "OD6S.INTERSTELLAR_DRIVE"}),
        });

        schema.hyperdrive = new fields.SchemaField({
            type: new fields.StringField({initial: "Number"}),
            value: new fields.NumberField({initial: 0, integer: true}),
            label: new fields.StringField({initial: "OD6S.INTERSTELLAR_DRIVE"}),
        });

        schema.atmospheric = new fields.SchemaField({
            value: new fields.StringField({initial: "true"}),
            type: new fields.StringField({initial: "Boolean"}),
            label: new fields.StringField({initial: "OD6S.ATMOSPHERIC"}),
            move: new fields.SchemaField({
                label: new fields.StringField({initial: "OD6S.ATMOSPHERIC_MOVE"}),
                value: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
            }),
            kph: new fields.SchemaField({
                label: new fields.StringField({initial: "OD6S.ATMOSPHERIC_KPH"}),
                value: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
            }),
        });

        // Starship overrides sensors with value=true by default
        schema.sensors = new fields.SchemaField({
            value: new fields.BooleanField({initial: true}),
            type: new fields.StringField({initial: "Boolean"}),
            label: new fields.StringField({initial: "OD6S.SENSORS"}),
            types: sensorTypesSchema(),
        });

        return schema;
    }
}
