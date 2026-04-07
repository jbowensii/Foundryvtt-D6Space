import { OD6SInitiative } from "../../module/system/initiative.js";

export const od6sInitiativeTests = (context) => {
  const { describe, it, expect } = context;

  const spy = () => {
    const fn = function(...args) {
      fn.called = true;
      fn.calledWith = args;
      fn.callCount++;
      return fn.returnValue;
    };
    fn.called = false;
    fn.callCount = 0;
    fn.returnValue = undefined;
    return fn;
  };

  describe("OD6SInitiative", () => {
    describe("_onPreUpdateCombat", () => {
      it("should not do anything if reroll_initiative setting is false", async () => {
        const originalGet = game.settings.get;
        game.settings.get = (mod, key) => {
            if (key === 'reroll_initiative') return false;
            return false;
        };
        const combat = { resetAll: spy() };
        await OD6SInitiative._onPreUpdateCombat(combat, { round: 2 }, {}, "user");
        expect(combat.resetAll.called).to.be.false;
        game.settings.get = originalGet;
      });

      it("should call resetAll when a new round starts (round >= 2)", async () => {
          const originalGet = game.settings.get;
          game.settings.get = (mod, key) => {
              if (key === 'reroll_initiative') return true;
              return false;
          };
          const originalUsers = game.users;
          game.users = { contents: [{ isGM: true, id: 'gm' }] };

          const originalDescriptor = Object.getOwnPropertyDescriptor(game, 'user');
          Object.defineProperty(game, 'user', {
              value: { isGM: true, id: 'gm' },
              configurable: true
          });

          const combat = {
              resetAll: spy(),
              update: spy(),
              previous: { round: 1 }
          };
          await OD6SInitiative._onPreUpdateCombat(combat, { round: 2 }, {}, "user");
          expect(combat.resetAll.called).to.be.true;

          game.settings.get = originalGet;
          game.users = originalUsers;
          if (originalDescriptor) {
              Object.defineProperty(game, 'user', originalDescriptor);
          } else {
              delete game.user;
          }
      });
    });
  });
};
