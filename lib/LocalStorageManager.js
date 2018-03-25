
var Relationship = require('./Relationship');

class LocalStorageManager {

    initialize() {
        // this.clearMessages([]);
        this.contacts = {};
        this.loadLocalContactAddresses();
        this.loadContactMessages();
    }

    loadLocalContactAddresses = () => {
        var rawContactAddresses = window.localStorage.contactAddresses;
        if (rawContactAddresses != undefined) {
            this.contactAddresses = JSON.parse(rawContactAddresses);
        } else {
            this.contactAddresses = [];
        }
    }

    loadContactMessages = () => {
        for (var i=0;i<this.contactAddresses.length;i++) {
            var address = this.contactAddresses[i];
            var localMessages = window.localStorage[address];
            this.contacts[address] = JSON.parse(localMessages);
        }
    }

    addContact = (address, publicKey, name, avatarUrl, relationship) => {
        var data = this.contacts[address];
        if (data == undefined) {
            var member = {};
            // member.currentBlock = 0;
            member.messages = [];
            member.relationship = relationship;
            window.localStorage.setItem(address, JSON.stringify(member));

            this.contactAddresses.push(address);
            window.localStorage.setItem('contactAddresses', JSON.stringify(this.contactAddresses));
        } else if (relationship == Relationship.Blocked || relationship == Relationship.Connected) {
            data.relationship = relationship;
            data.publickKey = publicKey;
            data.name = name;
            data.avatarUrl = avatarUrl;
            window.localStorage.setItem(address, JSON.stringify(data));
        }
    }

    addInvitationEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["from"], "", "", "", Relationship.Invited);
        }
    }

    addRequestEvents = (events) => {
        for (var i=0;i<events.length;i++) {
            this.addContact(events[i].returnValues["to"], "", "", "", Relationship.Requested);
        }
    }

    addMessageFromFriendEvent = (event) => {
        var data = event.returnValues;
        var fromAddress = data.from;
        var message = {};
        message.isMine = false;
        message.message = data.message;
        message.encryption = data.encryption;
        message.txHash = event.transactionHash;

        this.contacts[fromAddress].messages.push(message);
        // this.contacts[fromAddress].currentBlock = event.blockNumber;

        window.localStorage.setItem(fromAddress, JSON.stringify(this.contacts[fromAddress]));
    }

    addMyMessageEvent = (event) => {
        var data = event.returnValues;
        var localMessages = this.contacts[data.to];
        console.log(localMessages);
        for (var i=localMessages.messages.length-1; i>=0;i--) {
            if (event.transactionHash == localMessages.messages[i].txHash) {
                localMessages.messages[i].isPending = false;
                // this.contacts[data.to].currentBlock = event.blockNumber;
                window.localStorage.setItem(data.to, JSON.stringify(this.contacts[data.to]));
            }
        }
    }

    addMyLocalMessage = (message, to, encryption, txHash) => {
        var message = {message, encryption, txHash};
        message.isPending = true;
        message.isMine = true;
        this.contacts[to].messages.push(message);
        window.localStorage.setItem(to, JSON.stringify(this.contacts[to]));
    }

    clearMessages = (contacts) => {
        window.localStorage.removeItem('contactAddresses');
        for (var i=0;i<contacts.length;i++) {
            window.localStorage.removeItem(contacts[i]);
        }
    }
}

export default LocalStorageManager;