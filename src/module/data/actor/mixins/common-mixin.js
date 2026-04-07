const fields = foundry.data.fields;

/**
 * Mixin that adds the "common" template fields to an actor DataModel.
 * Mirrors the "common" template block from template.json.
 */
export function CommonMixin(Base) {
    return class extends Base {
        static defineSchema() {
            const schema = super.defineSchema();

            schema.move = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_MOVE"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                value: new fields.NumberField({initial: 10, integer: true}),
            });

            schema.chartype = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.CHAR_TYPE"}),
                content: new fields.StringField({initial: ""}),
            });

            schema.species = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.CHAR_SPECIES"}),
                content: new fields.StringField({initial: ""}),
            });

            schema.wounds = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.CHAR_HEALTH"}),
                short_label: new fields.StringField({initial: "OD6S.CHAR_HEALTH"}),
                value: new fields.NumberField({initial: 0, integer: true}),
                body_points: new fields.SchemaField({
                    max: new fields.NumberField({initial: 0, integer: true}),
                    current: new fields.NumberField({initial: 0, integer: true}),
                }),
            });

            schema.stuns = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_STUNS"}),
                value: new fields.NumberField({initial: 0, integer: true}),
                current: new fields.NumberField({initial: 0, integer: true}),
                rounds: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.strengthdamage = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.STRENGTH_DAMAGE"}),
                short_label: new fields.StringField({initial: "OD6S.STRENGTH_DAMAGE_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.ranged = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.RANGED_ATTACK_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.RANGED_ATTACK_MOD_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.melee = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.MELEE_ATTACK_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.MELEE_ATTACK_MOD_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.brawl = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.BRAWL_ATTACK_MOD"}),
                short_label: new fields.StringField({initial: "OD6S.BRAWL_ATTACK_MOD_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.sheetmode = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.SHEET_MODE"}),
                short_label: new fields.StringField({initial: "OD6S.SHEET_MODE_SHORT"}),
                value: new fields.StringField({initial: "normal"}),
            });

            schema.dodge = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.DODGE"}),
                short_label: new fields.StringField({initial: "OD6S.DODGE_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.parry = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.PARRY"}),
                short_label: new fields.StringField({initial: "OD6S.PARRY_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.block = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.BLOCK"}),
                short_label: new fields.StringField({initial: "OD6S.BLOCK_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.pr = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.PHYSICAL_RESISTANCE"}),
                short_label: new fields.StringField({initial: "OD6S.PHYSICAL_RESISTANCE_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.er = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.ENERGY_RESISTANCE"}),
                short_label: new fields.StringField({initial: "OD6S.ENERGY_RESISTANCE_SHORT"}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.credits = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_CREDITS"}),
                value: new fields.NumberField({initial: 0}),
            });

            schema.funds = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.CHAR_FUNDS"}),
                score: new fields.NumberField({initial: 0}),
            });

            schema.initiative = new fields.SchemaField({
                type: new fields.StringField({initial: "String"}),
                label: new fields.StringField({initial: "OD6S.INITIATIVE"}),
                formula: new fields.StringField({initial: ""}),
                mod: new fields.NumberField({initial: 0, integer: true}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.scale = new fields.SchemaField({
                type: new fields.StringField({initial: "Number"}),
                label: new fields.StringField({initial: "OD6S.SCALE"}),
                score: new fields.NumberField({initial: 0, integer: true}),
            });

            schema.customeffects = new fields.SchemaField({
                skills: new fields.ObjectField(),
                specializations: new fields.ObjectField(),
            });

            schema.custom1 = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
            });

            schema.custom2 = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
            });

            schema.custom3 = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
            });

            schema.custom4 = new fields.SchemaField({
                value: new fields.StringField({initial: ""}),
            });

            schema.labels = new fields.ObjectField();
            schema.tags = new fields.ArrayField(new fields.StringField());
            schema.use_wild_die = new fields.BooleanField({initial: true});
            schema.roll_mod = new fields.NumberField({initial: 0, integer: true});

            return schema;
        }
    };
}
