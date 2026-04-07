/**
 * Unit tests for Actor DataModels in src/module/data/actor
 */
import { CharacterData } from "../../module/data/actor/character.js";
import { NpcData } from "../../module/data/actor/npc.js";
import { CreatureData } from "../../module/data/actor/creature.js";
import { VehicleData } from "../../module/data/actor/vehicle.js";
import { StarshipData } from "../../module/data/actor/starship.js";
import { ContainerData } from "../../module/data/actor/container.js";

export const od6sActorDataTests = (context) => {
  const { describe, it, assert } = context;
  describe("OD6S Actor DataModel Tests", () => {
    it("CharacterData Schema", () => {
      const schema = CharacterData.defineSchema();
      assert.ok(schema.background, "CharacterData should have background field");
      assert.ok(schema.fatepoints, "CharacterData should have fatepoints field");
      assert.ok(schema.characterpoints, "CharacterData should have characterpoints field");
      assert.ok(schema.attributes, "CharacterData should have attributes (from AttributesMixin)");
      assert.ok(schema.move, "CharacterData should have move (from CommonMixin)");
    });

    it("NpcData Schema", () => {
      const schema = NpcData.defineSchema();
      assert.ok(schema.attributes, "NpcData should have attributes");
      assert.ok(schema.npc_type, "NpcData should have npc_type (from NpcMixin)");
    });

    it("CreatureData Schema", () => {
      const schema = CreatureData.defineSchema();
      assert.ok(schema.attributes, "CreatureData should have attributes");
    });

    it("VehicleData Schema", () => {
      const schema = VehicleData.defineSchema();
      assert.ok(schema.crew, "VehicleData should have crew");
      assert.ok(schema.passengers, "VehicleData should have passengers");
      assert.ok(schema.maneuverability, "VehicleData should have maneuverability (from VehicleCommonMixin)");
    });

    it("StarshipData Schema", () => {
      const schema = StarshipData.defineSchema();
      assert.ok(schema.hyperdrive, "StarshipData should have hyperdrive");
      assert.ok(schema.shields, "StarshipData should have shields (from VehicleCommonMixin)");
    });

    it("ContainerData Schema", () => {
      const schema = ContainerData.defineSchema();
      assert.ok(schema.capacity, "ContainerData should have capacity");
    });
  });
};
