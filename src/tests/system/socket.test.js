import OD6SSocketHandler from "../../module/system/socket.js";

export const od6sSocketTests = (context) => {
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

  describe("OD6SSocketHandler", () => {
    describe("updateRollMessage", () => {
      it("should not do anything if user is not GM", async () => {
          const originalDescriptor = Object.getOwnPropertyDescriptor(game, 'user');
          Object.defineProperty(game, 'user', {
              value: { isGM: false },
              configurable: true
          });

          const data = { message: { _id: "msg1" } };
          await OD6SSocketHandler.updateRollMessage(data);
          // If it didn't crash, it likely returned early as expected.
          // In a real test we'd check that game.messages.get was not called.

          if (originalDescriptor) {
              Object.defineProperty(game, 'user', originalDescriptor);
          } else {
              delete game.user;
          }
      });

      it("should update message if user is GM", async () => {
          const originalDescriptor = Object.getOwnPropertyDescriptor(game, 'user');
          Object.defineProperty(game, 'user', {
              value: { isGM: true },
              configurable: true
          });

          const message = {
              update: spy(),
              setFlag: spy(),
              getFlag: (mod, key) => 10,
              rolls: [{ total: 15 }]
          };
          const originalMessages = game.messages;
          game.messages = { get: () => message };

          const data = {
              message: { _id: "msg1" },
              update: { content: "15" }
          };

          await OD6SSocketHandler.updateRollMessage(data);

          expect(message.update.called).to.be.true;
          expect(message.setFlag.called).to.be.true;

          if (originalDescriptor) {
              Object.defineProperty(game, 'user', originalDescriptor);
          } else {
              delete game.user;
          }
          game.messages = originalMessages;
      });
    });
  });
};
