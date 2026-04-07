import { ExplosiveDialog } from "../../module/apps/explosive-dialog.js";

export const od6sExplosiveAppTests = (context) => {
  const { describe, it, assert, before, after } = context;

  describe("OD6S Explosive Application Tests", () => {
    let ExplosivesTemplate;

    describe("ExplosiveDialog", () => {
      it("should have DEFAULT_OPTIONS", () => {
        assert.ok(ExplosiveDialog.DEFAULT_OPTIONS);
        assert.ok(ExplosiveDialog.DEFAULT_OPTIONS.classes.includes("explosive-dialog"));
      });

      it("should have show static method", () => {
        assert.equal(typeof ExplosiveDialog.show, 'function');
      });

      it("can be instantiated (with mocks)", () => {
        const mockData = { type: "grenade", timer: 0, contact: false };
        const instance = new ExplosiveDialog(mockData, {
          window: { title: "Test Dialog" },
          buttons: [{ action: "test", label: "Test Button" }]
        });
        assert.ok(instance);
        assert.equal(instance.explosiveData, mockData);
      });
    });

    describe("ExplosivesTemplate", () => {

      before(async () => {
        // ExplosivesTemplate is now a plain class — no base class mocking needed
        const module = await import("../../module/apps/explosives-template.js");
        ExplosivesTemplate = module.default;
      });

      it("ExplosivesTemplate should be defined", () => {
        assert.ok(ExplosivesTemplate);
      });

      it("should have setExplosiveData method", () => {
        const instance = new ExplosivesTemplate();
        assert.equal(typeof instance.setExplosiveData, 'function');
      });

      it("setExplosiveData sets properties", async () => {
        const instance = new ExplosivesTemplate();
        const mockData = {
          actor: { sheet: { minimize: () => {}, maximize: () => {} } },
          item: {
            system: {
              blast_radius: {
                '3': { range: 10 },
                '4': { range: 15 }
              }
            }
          }
        };

        // Mock the game.settings.get call
        const originalGet = game.settings.get;
        game.settings.get = (namespace, key) => {
          if (key === 'explosive_zones') return false;
          return originalGet.call(game.settings, namespace, key);
        };

        await instance.setExplosiveData(mockData, 100, 200);

        assert.equal(instance.exData, mockData);
        assert.equal(instance.originX, 100);
        assert.equal(instance.originY, 200);
        assert.equal(instance.origin.x, 100);
        assert.equal(instance.origin.y, 200);
        assert.equal(instance.radius, 10);

        game.settings.get = originalGet;
      });

      it("should have drawPreview method", () => {
        const instance = new ExplosivesTemplate();
        assert.equal(typeof instance.drawPreview, 'function');
      });

      it("should have _getBlastRadius method", () => {
        const instance = new ExplosivesTemplate();
        assert.equal(typeof instance._getBlastRadius, 'function');
      });

      it("should have _getRegionCenter method", () => {
        const instance = new ExplosivesTemplate();
        assert.equal(typeof instance._getRegionCenter, 'function');
      });
    });
  });
};
