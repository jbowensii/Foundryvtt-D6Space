import { OD6SChat, OD6SEditDifficulty, OD6SEditDamage, OD6SChooseTarget, OD6SHandleWildDieForm } from "../../module/apps/chat.js";
import { OD6SRoll, OD6SInitRoll, RollDialog, InitRollDialog } from "../../module/apps/OD6SRoll.js";
import OD6SItemInfo from "../../module/apps/item-info.js";

export const od6sChatAppTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6S Chat and Roll Application Tests", () => {
    
    describe("OD6SChat", () => {
      it("should have chatContextMenu static method", () => {
        assert.equal(typeof OD6SChat.chatContextMenu, 'function');
      });
    });

    describe("OD6S Dialog Classes", () => {
      const dialogs = [
        { name: "Edit Difficulty", class: OD6SEditDifficulty },
        { name: "Edit Damage", class: OD6SEditDamage },
        { name: "Choose Target", class: OD6SChooseTarget },
        { name: "Handle Wild Die", class: OD6SHandleWildDieForm }
      ];

      dialogs.forEach(d => {
        it(`${d.name} should have show static method`, () => {
          assert.equal(typeof d.class.show, 'function');
        });
      });
    });

    describe("OD6SRoll Classes", () => {
      it("OD6SRoll should be defined", () => {
        assert.ok(OD6SRoll);
      });
      it("OD6SInitRoll should be defined", () => {
        assert.ok(OD6SInitRoll);
      });
      it("RollDialog should have DEFAULT_OPTIONS", () => {
        assert.ok(RollDialog.DEFAULT_OPTIONS);
      });
      it("InitRollDialog should have DEFAULT_OPTIONS", () => {
        assert.ok(InitRollDialog.DEFAULT_OPTIONS);
      });
    });

    describe("OD6SItemInfo", () => {
      it("should have a TEMPLATE defined", () => {
        assert.ok(OD6SItemInfo.TEMPLATE);
      });

      it("can be instantiated (with mocks)", () => {
        const mockItem = { name: "Test Item", toObject: () => ({ name: "Test Item" }) };
        const instance = new OD6SItemInfo(mockItem);
        assert.ok(instance);
        assert.equal(instance._source.name, "Test Item");
      });

      it("getData returns object data", () => {
        const mockItem = { name: "Test Item", toObject: () => ({ name: "Test Item" }) };
        const instance = new OD6SItemInfo(mockItem);
        const data = instance.getData();
        assert.ok(data.object);
        assert.equal(data.object.name, "Test Item");
      });
    });
  });
};
