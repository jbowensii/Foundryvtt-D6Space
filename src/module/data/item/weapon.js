import {BaseMixin} from "./mixins/base-mixin.js";
import {EquipmentMixin} from "./mixins/equipment-mixin.js";
import {EquipMixin} from "./mixins/equip-mixin.js";

const fields = foundry.data.fields;

/**
 * DataModel for the "weapon" item type.
 * Composes: base + equipment + equip + weapon-specific fields.
 */
export class WeaponData extends EquipMixin(EquipmentMixin(BaseMixin(foundry.abstract.TypeDataModel))) {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.scale = new fields.SchemaField({
            score: new fields.NumberField({initial: 0, integer: true}),
            type: new fields.StringField({initial: "Number"}),
            label: new fields.StringField({initial: "OD6S.SCALE"}),
        });

        schema.subtype = new fields.StringField({initial: "OD6S.RANGED"});

        schema.stats = new fields.SchemaField({
            attribute: new fields.StringField({initial: "AGI"}),
            skill: new fields.StringField({initial: ""}),
            specialization: new fields.StringField({initial: ""}),
            parry_skill: new fields.StringField({initial: ""}),
            parry_specialization: new fields.StringField({initial: ""}),
        });

        schema.range = new fields.SchemaField({
            short: new fields.NumberField({initial: 0}),
            medium: new fields.NumberField({initial: 0}),
            long: new fields.NumberField({initial: 0}),
        });

        schema.damage = new fields.SchemaField({
            type: new fields.StringField({initial: ""}),
            score: new fields.NumberField({initial: 0, integer: true}),
            muscle: new fields.BooleanField({initial: false}),
            str: new fields.BooleanField({initial: true}),
        });

        const blastEntry = () => new fields.SchemaField({
            range: new fields.NumberField({initial: 0}),
            damage: new fields.NumberField({initial: 0}),
            stun_range: new fields.NumberField({initial: 0}),
            stun_damage: new fields.NumberField({initial: 0}),
        });

        schema.blast_radius = new fields.SchemaField({
            1: blastEntry(),
            2: blastEntry(),
            3: blastEntry(),
            4: blastEntry(),
        });

        schema.damaged = new fields.NumberField({initial: 0, integer: true});
        schema.ammo = new fields.NumberField({initial: 0, integer: true});
        schema.ammo_price = new fields.StringField({initial: ""});
        schema.ammo_cost = new fields.NumberField({initial: 0});
        schema.rof = new fields.NumberField({initial: 0, integer: true});

        schema.stun = new fields.SchemaField({
            stun_only: new fields.BooleanField({initial: false}),
            score: new fields.NumberField({initial: 0, integer: true}),
            type: new fields.StringField({initial: "e"}),
        });

        schema.difficulty = new fields.StringField({initial: "OD6S.DIFFICULTY_EASY"});

        schema.mods = new fields.SchemaField({
            difficulty: new fields.NumberField({initial: 0}),
            attack: new fields.NumberField({initial: 0}),
            damage: new fields.NumberField({initial: 0}),
        });

        schema.label = new fields.StringField({initial: "OD6S.CHAR_WEAPONS"});

        return schema;
    }
}
