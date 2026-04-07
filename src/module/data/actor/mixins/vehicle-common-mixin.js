const fields = foundry.data.fields;

/**
 * Helper to create the sensor types sub-schema used by vehicles and starships.
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
 * Mixin that adds the "vehicle_common" template fields to an actor DataModel.
 * Mirrors the "vehicle_common" template block from template.json.
 */
export function VehicleCommonMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.vehicle_type = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.VEHICLE_TYPE"}),
            });

            schema.initiative = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.INITIATIVE"}),
                formula: new fields.StringField({initial: ""}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.damage = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.DAMAGE"}),
            });

            schema.scale = new fields.SchemaField({
                score: new fields.NumberField({initial: 3, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.SCALE"}),
            });

            schema.maneuverability = new fields.SchemaField({
                score: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.MANEUVERABILITY"}),
            });

            schema.toughness = new fields.SchemaField({
                score: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.TOUGHNESS"}),
            });

            schema.armor = new fields.SchemaField({
                score: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.ARMOR"}),
            });

            schema.move = new fields.SchemaField({
                value: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.MOVE"}),
            });

            schema.cargo_capacity = new fields.SchemaField({
                value: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CARGO_CAPACITY"}),
            });

            schema.cost = new fields.SchemaField({
                value: new fields.NumberField({initial: 0}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.COST"}),
            });

            schema.price = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.PRICE"}),
            });

            schema.crew = new fields.SchemaField({
                value: new fields.NumberField({initial: 1, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CREW"}),
            });

            schema.crewmembers = new fields.ArrayField(new fields.ObjectField());

            schema.passengers = new fields.SchemaField({
                value: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.PASSENGERS"}),
            });

            schema.skill = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.SKILL"}),
            });

            schema.specialization = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.SPECIALIZATION"}),
            });

            schema.attribute = new fields.SchemaField({
                value: new fields.StringField({initial: "mec"}),
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.ATTRIBUTE"}),
            });

            schema.dodge = new fields.SchemaField({
                score: new fields.NumberField({initial: 0, integer: true}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.DODGE"}),
            });

            schema.sensors = new fields.SchemaField({
                value: new fields.BooleanField({initial: false}),
                type: new fields.StringField({initial: "Boolean"}),
                label: new fields.StringField({initial: "OD6S.SENSORS"}),
                skill: new fields.StringField({initial: "Sensors"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                types: sensorTypesSchema(),
            });

            schema.shields = new fields.SchemaField({
                value: new fields.NumberField({initial: 0, integer: true}),
                allocated: new fields.NumberField({initial: 0, integer: true}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.SHIELDS"}),
                skill: new fields.StringField({initial: "OD6S.SHIELDS"}),
                arcs: new fields.SchemaField({
                    front: new fields.SchemaField({
                        label: new fields.StringField({initial: "OD6S.FRONT"}),
                        value: new fields.NumberField({initial: 0, integer: true}),
                        type: new fields.StringField({initial: "Number"}),
                    }),
                    rear: new fields.SchemaField({
                        label: new fields.StringField({initial: "OD6S.REAR"}),
                        value: new fields.NumberField({initial: 0, integer: true}),
                        type: new fields.StringField({initial: "Number"}),
                    }),
                    left: new fields.SchemaField({
                        label: new fields.StringField({initial: "OD6S.LEFT"}),
                        value: new fields.NumberField({initial: 0, integer: true}),
                        type: new fields.StringField({initial: "Number"}),
                    }),
                    right: new fields.SchemaField({
                        label: new fields.StringField({initial: "OD6S.RIGHT"}),
                        value: new fields.NumberField({initial: 0, integer: true}),
                        type: new fields.StringField({initial: "Number"}),
                    }),
                }),
            });

            schema.ranged = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.RANGED_ATTACK_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.RANGED_ATTACK_MOD_SHORT"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.ranged_damage = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.RANGED_DAMAGE_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.RANGED_DAMAGE_MOD_SHORT"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.ram = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.RAM_ATTACK_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.RAM_ATTACK_MOD_SHORT"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.ram_damage = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.RAM_DAMAGE_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.RAM_DAMAGE_MOD_SHORT"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.length = new fields.SchemaField({
                value: new fields.NumberField({initial: 0}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.LENGTH"}),
            });

            schema.tonnage = new fields.SchemaField({
                value: new fields.NumberField({initial: 0}),
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.TONNAGE"}),
            });

            schema.embedded_pilot = new fields.SchemaField({
                value: new fields.BooleanField({initial: false}),
                type: new fields.StringField({initial: "Boolean"}),
                label: new fields.StringField({initial: "OD6S.EMBEDDED_PILOT"}),
                actor: new fields.ObjectField(),
            });

            schema.sheetmode = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.SHEET_MODE"}),
                short_label: new fields.StringField({initial: "OD6S.SHEET_MODE_SHORT"}),
                value: new fields.StringField({initial: "normal"}),
            });

            schema.roll_mod = new fields.NumberField({initial: 0, integer: true});

            return schema;
        }
    };
}
