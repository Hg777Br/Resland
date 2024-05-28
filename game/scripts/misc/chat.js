export class ChatServer {
    constructor(){
        this.messages = []
    }
    send(msg=""){
        if(this.messages.length>250) this.messages.shift()
        this.messages.push(msg)
    }
}

export class ChatClient {
    constructor(player){
        this.player = player
        this.focus = false
        this.messages = [];
        this.chat = document.getElementById("messages");
        this.chatInput = document.getElementById("msg");
        this.chatInput.onkeydown = (e) => {
            if(e.key === "Enter"){
                this.chatInput.blur();
                this.send(this.chatInput.value)
                this.chatInput.value=""
            }
        }
        setInterval(() => this.update(), 360)
    }
    focus(){

    }
    send(msg=""){
        this.player.data.messagesQueue.push(`<div><p class="player">(${this.player.name}):</p><p class="msg"> ${msg}</p></div>`);
    }
    update(){
        let iHTML = "";
        for(let msg of this.messages) iHTML += msg;
        this.chat.innerHTML = iHTML;
    }
}