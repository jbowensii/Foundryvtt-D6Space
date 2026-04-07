// OD6S Socket handler — GM-only message handlers for roll updates, initiative, and vehicle crew management.
import {od6sutilities} from "./utilities.js";

export default class OD6SSocketHandler {

    // Players send roll updates via socket; only the GM can modify chat messages
    static async updateRollMessage(data) {
        if (game.user.isGM) {
            const message = game.messages.get(data.message._id);
            await message.update(data.update, {"diff": true});
            await message.setFlag('od6s', 'total', data.update.content);
            await message.setFlag('od6s', 'originalroll', message.rolls[0])
            if ((+data.update.content) >= (message.getFlag('od6s', 'difficulty'))) {
                await message.setFlag('od6s', 'success', true);
            }
            if ((+data.update.content) < (message.getFlag('od6s', 'difficulty'))) {
                await message.setFlag('od6s', 'success', false);
            }
        }
    }

    static async updateInitRoll(data) {
        if (game.user.isGM) {
            const actor = data.message.speaker.actor;
            const combatant = game.combat.system.combatants.find(c => c.actor.id === actor);
            const update = {
                id: combatant.id,
                initiative: data.update.content
            }
            await combatant.update(update);
        }
    }

    static async addToVehicle(data) {
        if (game.user.isGM) {
            const actor = await od6sutilities.getActorFromUuid(data.message.actorId);
            return await actor.addToCrew(data.message.vehicleId);
        }
    }

    static async removeFromVehicle(data) {
        if (game.user.isGM) {
            const actor = await od6sutilities.getActorFromUuid(data.message.actorId);
            return actor.removeFromCrew(data.message.vehicleId);
        }
    }

    static async sendVehicleStats(data) {
        if (game.user.isGM) {
            data.message.actors.forEach(function (actorId) {
                game.actors.get(actorId).getVehicleStats(data);
            });
        }
    }
}

