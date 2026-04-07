import OD6SCreateCharacter from "../../module/apps/character-creation.js";
import OD6S from "../../module/config/config-od6s.js";

export const od6sCreationAppTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6S Character Creation Application Tests", () => {

    // ── Shared helpers ──────────────────────────────────────────────────

    /**
     * Create a minimal mock instance with controllable pools.
     * Optionally accepts an items array for the mock actor.
     */
    function makeMockInstance(skillScore, specScore, items) {
      const itemsMap = new Map();
      const itemsArray = items ?? [];
      for (const item of itemsArray) {
        itemsMap.set(item._id, {
          id: item._id,
          name: item.name,
          type: item.type,
          system: { ...item.system },
        });
      }
      // Make the map iterable and support .filter / .get / .map
      itemsMap.filter = (fn) => itemsArray.map((i) => itemsMap.get(i._id)).filter(fn);
      itemsMap.map = (fn) => itemsArray.map((i) => fn(itemsMap.get(i._id)));

      const mockActor = {
        toObject: () => ({ system: {}, flags: {}, items: [] }),
        items: itemsMap,
        system: { chartype: { content: "" } },
      };
      const instance = new OD6SCreateCharacter(mockActor, []);
      instance.skillScore = skillScore;
      instance.specScore = specScore;
      return instance;
    }

    /**
     * Replicate the createItem hook arithmetic for specialization creation.
     */
    function simulateSpecCreation(instance) {
      const oneDie = OD6S.pipsPerDice ?? 3;

      if (instance.specScore >= oneDie) {
        instance.specScore -= oneDie;
        return { deductedFrom: "spec", reverted: false };
      } else if (instance.skillScore >= oneDie) {
        instance.skillScore -= oneDie;
        instance.specScore += oneDie * 2;
        return { deductedFrom: "skill", reverted: false };
      } else {
        return { deductedFrom: null, reverted: true };
      }
    }

    /**
     * Replicate _increaseSkill logic (without async/render).
     */
    function simulateIncreaseSkill(instance, itemId) {
      if (instance.skillScore <= 0) return false;
      const item = instance.actor.items.get(itemId);
      if (!item) return false;
      const currentBase = Number(item.system?.base ?? 0);
      item.system.base = Math.max(0, currentBase + 1);
      item.system.score = item.system.base;
      instance.skillScore = Math.max(0, instance.skillScore - 1);
      return true;
    }

    /**
     * Replicate _decreaseSkill logic (without async/render).
     */
    function simulateDecreaseSkill(instance, itemId) {
      const item = instance.actor.items.get(itemId);
      if (!item) return false;
      const currentBase = Number(item.system?.base ?? 0);
      if (currentBase <= 0) return false;
      item.system.base = Math.max(0, currentBase - 1);
      item.system.score = item.system.base;
      instance.skillScore = instance.skillScore + 1;
      return true;
    }

    /**
     * Replicate skill deletion with refund logic.
     */
    function simulateDeleteSkill(instance, itemId) {
      const item = instance.actor.items.get(itemId);
      if (!item) return false;
      const base = Number(item.system?.base ?? 0);
      if (item.type === "skill") {
        instance.skillScore = (instance.skillScore ?? 0) + Math.max(0, base);
        // Refund specs tied to this skill
        const specs = instance.actor.items.filter(
          (i) => i.type === "specialization" && i.system?.skill === item.name
        );
        const specRefund = specs.reduce((sum, s) => sum + Math.max(0, Number(s.system?.base ?? 0)), 0);
        instance.specScore = (instance.specScore ?? 0) + specRefund;
        return true;
      }
      return false;
    }

    /**
     * Replicate specialization deletion with refund logic.
     */
    function simulateDeleteSpec(instance, itemId) {
      const item = instance.actor.items.get(itemId);
      if (!item) return false;
      if (item.type === "specialization") {
        const base = Number(item.system?.base ?? 0);
        instance.specScore = (instance.specScore ?? 0) + Math.max(0, base);
        return true;
      }
      return false;
    }

    // ── Basic instantiation tests ───────────────────────────────────────

    it("OD6SCreateCharacter should have DEFAULT_OPTIONS", () => {
      assert.ok(OD6SCreateCharacter.DEFAULT_OPTIONS);
      assert.ok(OD6SCreateCharacter.DEFAULT_OPTIONS.classes.includes("create-character"));
    });

    it("OD6SCreateCharacter should have PARTS", () => {
      assert.ok(OD6SCreateCharacter.PARTS);
      assert.ok(OD6SCreateCharacter.PARTS.content);
    });

    it("can be instantiated (with mocks)", () => {
      const instance = makeMockInstance(18, 0);
      assert.ok(instance);
      assert.equal(instance.step, 1);
      assert.equal(instance.done, false);
    });

    it("_resetAppStateForStep1 resets state", () => {
      const instance = makeMockInstance(5, 2);
      instance.step = 2;
      instance.done = true;

      instance._resetAppStateForStep1();

      assert.equal(instance.step, 1);
      assert.equal(instance.done, false);
      assert.equal(instance.specScore, 0);
    });

    // ── Add Specialization dice pool tests ──────────────────────────────

    it("spec creation deducts one die from spec pool when spec pool has enough dice", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(18, 6);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "spec");
      assert.equal(result.reverted, false);
      assert.equal(instance.specScore, 6 - oneDie, "specScore should decrease by one die");
      assert.equal(instance.skillScore, 18, "skillScore should be unchanged");
    });

    it("spec creation converts one skill die into spec dice when spec pool is empty", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(18, 0);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "skill");
      assert.equal(instance.skillScore, 18 - oneDie);
      assert.equal(instance.specScore, oneDie * 2);
    });

    it("spec creation converts one skill die when spec pool is insufficient (not zero)", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(18, 1);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "skill");
      assert.equal(instance.skillScore, 18 - oneDie);
      assert.equal(instance.specScore, 1 + oneDie * 2);
    });

    it("spec creation reverts when neither pool has enough dice", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(oneDie - 1, oneDie - 1);
      const result = simulateSpecCreation(instance);

      assert.equal(result.reverted, true);
      assert.equal(instance.skillScore, oneDie - 1);
      assert.equal(instance.specScore, oneDie - 1);
    });

    it("spec creation reverts when both pools are zero", () => {
      const instance = makeMockInstance(0, 0);
      const result = simulateSpecCreation(instance);

      assert.equal(result.reverted, true);
      assert.equal(instance.skillScore, 0);
      assert.equal(instance.specScore, 0);
    });

    it("spec creation prefers spec pool over skill pool when both have enough", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(18, 9);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "spec");
      assert.equal(instance.specScore, 9 - oneDie);
      assert.equal(instance.skillScore, 18);
    });

    it("spec creation handles exactly one die remaining in spec pool", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(18, oneDie);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "spec");
      assert.equal(instance.specScore, 0);
      assert.equal(instance.skillScore, 18);
    });

    it("spec creation handles exactly one die remaining in skill pool (spec empty)", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      const instance = makeMockInstance(oneDie, 0);
      const result = simulateSpecCreation(instance);

      assert.equal(result.deductedFrom, "skill");
      assert.equal(instance.skillScore, 0);
      assert.equal(instance.specScore, oneDie * 2);
    });

    it("new specialization base equals one die (pipsPerDice)", () => {
      const oneDie = OD6S.pipsPerDice ?? 3;
      assert.ok(oneDie > 0, "pipsPerDice should be positive");
      assert.equal(oneDie, OD6S.pipsPerDice);
    });

    // ── Increase skill tests ────────────────────────────────────────────

    it("increase skill adds 1 pip to skill base and deducts 1 pip from skill pool", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(18, 0, items);

      const ok = simulateIncreaseSkill(instance, "sk1");

      assert.equal(ok, true);
      assert.equal(instance.actor.items.get("sk1").system.base, 1);
      assert.equal(instance.skillScore, 17);
    });

    it("increase skill multiple times accumulates correctly", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(18, 0, items);

      simulateIncreaseSkill(instance, "sk1");
      simulateIncreaseSkill(instance, "sk1");
      simulateIncreaseSkill(instance, "sk1");

      assert.equal(instance.actor.items.get("sk1").system.base, 3, "base should be 3 (1D)");
      assert.equal(instance.skillScore, 15, "pool should have lost 3 pips");
    });

    it("increase skill is blocked when skill pool is zero", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(0, 0, items);

      const ok = simulateIncreaseSkill(instance, "sk1");

      assert.equal(ok, false);
      assert.equal(instance.actor.items.get("sk1").system.base, 0);
      assert.equal(instance.skillScore, 0);
    });

    it("increase skill does nothing for non-existent item", () => {
      const instance = makeMockInstance(18, 0);
      const ok = simulateIncreaseSkill(instance, "nonexistent");

      assert.equal(ok, false);
      assert.equal(instance.skillScore, 18);
    });

    it("increasing multiple different skills deducts from the same shared pool", () => {
      const items = [
        { _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } },
        { _id: "sk2", name: "Dodge", type: "skill", system: { base: 0, score: 0 } },
        { _id: "sk3", name: "Brawling", type: "skill", system: { base: 0, score: 0 } },
      ];
      const instance = makeMockInstance(18, 0, items);

      simulateIncreaseSkill(instance, "sk1");
      simulateIncreaseSkill(instance, "sk1");
      simulateIncreaseSkill(instance, "sk2");
      simulateIncreaseSkill(instance, "sk3");
      simulateIncreaseSkill(instance, "sk3");
      simulateIncreaseSkill(instance, "sk3");

      assert.equal(instance.actor.items.get("sk1").system.base, 2, "Blasters base should be 2");
      assert.equal(instance.actor.items.get("sk2").system.base, 1, "Dodge base should be 1");
      assert.equal(instance.actor.items.get("sk3").system.base, 3, "Brawling base should be 3 (1D)");
      assert.equal(instance.skillScore, 12, "pool should have lost 6 pips total (2+1+3)");
    });

    // ── Decrease skill tests ────────────────────────────────────────────

    it("decrease skill removes 1 pip from skill base and refunds 1 pip to skill pool", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 3, score: 3 } }];
      const instance = makeMockInstance(15, 0, items);

      const ok = simulateDecreaseSkill(instance, "sk1");

      assert.equal(ok, true);
      assert.equal(instance.actor.items.get("sk1").system.base, 2);
      assert.equal(instance.skillScore, 16);
    });

    it("decrease skill is blocked when skill base is zero", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(18, 0, items);

      const ok = simulateDecreaseSkill(instance, "sk1");

      assert.equal(ok, false);
      assert.equal(instance.skillScore, 18);
    });

    it("decrease skill does nothing for non-existent item", () => {
      const instance = makeMockInstance(15, 0);
      const ok = simulateDecreaseSkill(instance, "nonexistent");

      assert.equal(ok, false);
      assert.equal(instance.skillScore, 15);
    });

    it("increase then decrease skill returns to original state", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(18, 0, items);

      simulateIncreaseSkill(instance, "sk1");
      simulateDecreaseSkill(instance, "sk1");

      assert.equal(instance.actor.items.get("sk1").system.base, 0);
      assert.equal(instance.skillScore, 18);
    });

    // ── Skill value adjustments across dice boundaries ──────────────────

    it("increasing skill across a full die boundary works correctly", () => {
      const pips = OD6S.pipsPerDice ?? 3;
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(pips * 3, 0, items); // 3D pool

      // Increase by exactly one full die worth of pips
      for (let i = 0; i < pips; i++) {
        simulateIncreaseSkill(instance, "sk1");
      }

      assert.equal(instance.actor.items.get("sk1").system.base, pips, "skill base should equal one die");
      assert.equal(instance.skillScore, pips * 2, "pool should have lost one die");
    });

    it("decreasing skill across a full die boundary works correctly", () => {
      const pips = OD6S.pipsPerDice ?? 3;
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: pips, score: pips } }];
      const instance = makeMockInstance(pips * 2, 0, items); // 2D remaining

      for (let i = 0; i < pips; i++) {
        simulateDecreaseSkill(instance, "sk1");
      }

      assert.equal(instance.actor.items.get("sk1").system.base, 0);
      assert.equal(instance.skillScore, pips * 3, "pool should have regained one die");
    });

    // ── Delete skill tests (with refund) ────────────────────────────────

    it("deleting a skill refunds its base to the skill pool", () => {
      const items = [{ _id: "sk1", name: "Blasters", type: "skill", system: { base: 6, score: 6 } }];
      const instance = makeMockInstance(12, 0, items);

      const ok = simulateDeleteSkill(instance, "sk1");

      assert.equal(ok, true);
      assert.equal(instance.skillScore, 18, "skill pool should be fully refunded");
    });

    it("deleting a skill also refunds its child specializations to spec pool", () => {
      const items = [
        { _id: "sk1", name: "Blasters", type: "skill", system: { base: 3, score: 3 } },
        { _id: "sp1", name: "Heavy Blasters", type: "specialization", system: { base: 4, score: 4, skill: "Blasters" } },
        { _id: "sp2", name: "Light Blasters", type: "specialization", system: { base: 3, score: 3, skill: "Blasters" } },
      ];
      const instance = makeMockInstance(12, 2, items);

      simulateDeleteSkill(instance, "sk1");

      assert.equal(instance.skillScore, 15, "skill pool refunded by skill base (3)");
      assert.equal(instance.specScore, 9, "spec pool refunded by sum of spec bases (4+3)");
    });

    it("deleting a skill with zero base still succeeds (no-op refund)", () => {
      const items = [{ _id: "sk1", name: "Dodge", type: "skill", system: { base: 0, score: 0 } }];
      const instance = makeMockInstance(18, 0, items);

      const ok = simulateDeleteSkill(instance, "sk1");

      assert.equal(ok, true);
      assert.equal(instance.skillScore, 18);
    });

    // ── Delete specialization tests (with refund) ───────────────────────

    it("deleting a specialization refunds its base to the spec pool", () => {
      const items = [
        { _id: "sp1", name: "Heavy Blasters", type: "specialization", system: { base: 5, score: 5, skill: "Blasters" } },
      ];
      const instance = makeMockInstance(15, 1, items);

      const ok = simulateDeleteSpec(instance, "sp1");

      assert.equal(ok, true);
      assert.equal(instance.specScore, 6, "spec pool should gain the spec's base");
    });

    it("deleting a specialization with zero base still succeeds", () => {
      const items = [
        { _id: "sp1", name: "Heavy Blasters", type: "specialization", system: { base: 0, score: 0, skill: "Blasters" } },
      ];
      const instance = makeMockInstance(18, 3, items);

      const ok = simulateDeleteSpec(instance, "sp1");

      assert.equal(ok, true);
      assert.equal(instance.specScore, 3);
    });
  });
};
