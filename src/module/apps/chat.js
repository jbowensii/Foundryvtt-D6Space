import {od6sutilities} from "../system/utilities.js";
import OD6S from "../config/config-od6s.js";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class OD6SChat {

    static chatContextMenu(html, options) {
        let canApplyCharacterPoint = function (li) {
            let result = false;
            let actor;
            const messageId = li instanceof HTMLElement ? li.dataset.messageId : li.attr("data-message-id");
            const hasDiceRoll = li instanceof HTMLElement ? li.querySelector(".dice-roll") : li.find(".dice-roll").length;
            if (hasDiceRoll) {
                let message = game.messages.get(messageId);
                if (message.speaker.actor) {
                    if (message.speaker.token) {
                        actor = game.scenes.viewed.tokens.filter(t => t.id === message.speaker.token)[0]?.actor;
                    } else {
                        actor = game.actors.get(message.speaker.actor);
                    }

                    if (message.getFlag('od6s', 'canUseCp') &&
                        (game.user.isGM || actor?.isOwner) &&
                        (actor?.type === "character" || actor?.type === "npc") &&
                        actor?.system.characterpoints.value > 0) {
                        return true;
                    }
                }
            }
            return result;
        };

        options.push(
            {
                name: game.i18n.localize("OD6S.USE_A_CHARACTER_POINT"),
                icon: '<i class="fas fa-user-plus"></i>',
                condition: canApplyCharacterPoint,
                callback: li => {
                    const messageId = li instanceof HTMLElement ? li.dataset.messageId : li.attr("data-message-id");
                    let message = game.messages.get(messageId);
                    let actor;
                    if (message.speaker.token) {
                        actor = game.scenes.viewed.tokens.filter(t => t.id === message.speaker.token)[0]?.actor;
                    } else {
                        actor = game.actors.get(message.speaker.actor);
                    }
                    return actor.useCharacterPointOnRoll(message, message.getRollData());
                }
            }
        )
    }
}

export default class OD6SEditDifficulty extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "edit-difficulty",
        classes: ["od6s"],
        tag: "form",
        position: { width: 100, height: "auto" },
        window: {
            title: "OD6S.EDIT_DIFFICULTY",
            contentClasses: ["standard-form"]
        },
        form: {
            handler: OD6SEditDifficulty.#onSubmit,
            closeOnSubmit: true,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/chat/edit-difficulty.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = this.options;
        context.buttons = [
            { type: "submit", icon: "fa-solid fa-check", label: "Submit" },
        ];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        const data = formData.object;
        const message = game.messages.get(data.messageId);

        const diff = (+data.baseDifficulty) - (+message.getFlag('od6s', 'baseDifficulty'));
        const newDifficulty = (+message.getFlag('od6s', 'difficulty')) + (+diff);
        const success = message.rolls[0].total >= newDifficulty;

        await message.update({
            id: message.id,
            flags: {
                od6s: {
                    baseDifficulty: data.baseDifficulty,
                    difficulty: newDifficulty,
                    success: success
                }
            }
        });
    }
}

export class OD6SEditDamage extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "edit-damage",
        classes: ["od6s"],
        tag: "form",
        position: { width: 100, height: "auto" },
        window: {
            title: "OD6S.EDIT_DAMAGE",
            contentClasses: ["standard-form"]
        },
        form: {
            handler: OD6SEditDamage.#onSubmit,
            closeOnSubmit: true,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/chat/edit-damage.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = this.options;
        context.buttons = [
            { type: "submit", icon: "fa-solid fa-check", label: "Submit" },
        ];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        const data = formData.object;
        const message = game.messages.get(data.messageId);
        const damageScore = od6sutilities.getScoreFromDice(data.damageDice, data.damagePips);
        const damageDice = {
            dice: data.damageDice,
            pips: data.damagePips
        };
        await message.setFlag('od6s', 'damageScore', damageScore);
        await message.setFlag('od6s', 'damageDice', damageDice);
    }
}

export class OD6SChooseTarget extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "choose-target",
        classes: ["od6s"],
        tag: "form",
        position: { width: 100, height: "auto" },
        window: {
            title: "OD6S.CHOOSE_TARGET",
            contentClasses: ["standard-form"]
        },
        form: {
            handler: OD6SChooseTarget.#onSubmit,
            closeOnSubmit: true,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/chat/choose-target.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = this.options;
        context.buttons = [
            { type: "submit", icon: "fa-solid fa-check", label: "Submit" },
        ];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        const data = formData.object;
        const message = game.messages.get(data.messageId);
        if (message.getFlag('od6s', 'isExplosive')) {
            const targets = [];
            const currentTargets = message.getFlag('od6s', 'targets');
            const selectedIds = Array.isArray(data.choosetarget) ? data.choosetarget : [data.choosetarget];
            const formTargets = this.options.targets.filter(t => selectedIds.includes(t.id));
            for (const t in formTargets) {
                const target = {};
                const i = currentTargets?.findIndex(e => e.id === formTargets[t]);
                if (i > -1) {
                    target.id = currentTargets[i].id;
                    target.name = currentTargets[i].name;
                    target.range = currentTargets[i].range;
                    target.zone = currentTargets[i].zone;
                    targets.push(target);
                } else {
                    target.id = formTargets[t].id;
                    target.name = formTargets[t].name;
                    target.range = 0;
                    target.zone = 1;
                    targets.push(target);
                }
            }
            await message.unsetFlag('od6s', 'targets', targets);
            await message.setFlag('od6s', 'targets', targets);
        } else {
            await message.setFlag('od6s', 'targetId', data.choosetarget);
            await message.setFlag('od6s', 'targetName', game.scenes.active.tokens.find(t => t.id === data.choosetarget).name);
        }
    }
}

export class OD6SHandleWildDieForm extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "wilddie",
        classes: ["od6s"],
        tag: "form",
        position: { width: 100, height: "auto" },
        window: {
            title: "OD6S.WILD_DIE",
            contentClasses: ["standard-form"]
        },
        form: {
            handler: OD6SHandleWildDieForm.#onSubmit,
            closeOnSubmit: true,
        }
    };

    static PARTS = {
        form: { template: "systems/od6s/templates/chat/wild-die.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    async _prepareContext(options) {
        const context = this.options;
        context.buttons = [
            { type: "submit", icon: "fa-solid fa-check", label: "Submit" },
        ];
        return context;
    }

    static async #onSubmit(event, form, formData) {
        const data = formData.object;
        const message = game.messages.get(data.messageId);
        switch (data.wilddie) {
            case '0':
                await message.setFlag('od6s', 'wild', false);
                break;
            case '1':
                await message.setFlag('od6s', 'wildResult', 'OD6S.REMOVE_HIGHEST_DIE');
                let replacementRoll = JSON.parse(JSON.stringify(message.rolls[0]));
                let highest = 0;
                for (let i = 0; i < replacementRoll.terms[0].results.length; i++) {
                    replacementRoll.terms[0].results[i].result >
                    replacementRoll.terms[0].results[highest].result ?
                        highest = i : {}
                }
                replacementRoll.terms[0].results[highest].discarded = true;
                replacementRoll.terms[0].results[highest].active = false;
                replacementRoll.total -= (+replacementRoll.terms[0].results[highest].result);
                const messageUpdate = {};
                messageUpdate.system = {};
                messageUpdate.content = replacementRoll.total;
                messageUpdate.id = message.id;
                messageUpdate._id = message.id;
                messageUpdate.rolls = [];
                messageUpdate.rolls[0] = replacementRoll;

                if (message.getFlag('od6s', 'difficulty') && message.getFlag('od6s', 'success')) {
                    if (replacementRoll.total < message.getFlag('od6s', 'difficulty')) {
                        await message.setFlag('od6s', 'success', false);
                    }
                }
                await message.update(messageUpdate, {"diff": true});
                break;
            case '2':
                await message.setFlag('od6s', 'wildResult', 'OD6S.COMPLICATION');
                break;
        }
        await message.setFlag('od6s', 'wildHandled', true);
        if (message.getFlag('od6s', 'isOpposable') && OD6S.autoOpposed
            && (message.getFlag('od6s', 'type') === 'damage') || message.getFlag('od6s', 'type') === 'resistance') {
            await od6sutilities.autoOpposeRoll(message);
        }

        if (message.getFlag('od6s', 'subtype') === 'purchase' && message.getFlag('od6s', 'success')) {
            const seller = game.actors.get(message.getFlag('od6s', 'seller'));
            await seller.sheet._onPurchase(message.getFlag('od6s', 'purchasedItem'), message.speaker.actor);
        }
    }
}
