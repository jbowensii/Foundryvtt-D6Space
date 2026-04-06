export class OD6SChatLog extends ChatLog {
    notify(message) {
        this._lastMessageTime = Date.now();
        if ( !this.rendered ) return;

        // Display the chat notification icon and remove it 3 seconds later unless message is hidden
        if(message.isContentVisible) {
            let icon = $('#chat-notification');
            if (icon.is(":hidden")) icon.fadeIn(100);
            setTimeout(() => {
                if ((Date.now() - this._lastMessageTime > 3000) && icon.is(":visible")) icon.fadeOut(100);
            }, 3001);
        }

        // Play a notification sound effect
        if ( message.sound ) AudioHelper.play({src: message.sound});
    }
}