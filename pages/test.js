import {Component} from 'react';
import LocalStorageManager from '../lib/LocalStorageManager';

class Test extends Component {
    componentDidMount() {
        this.contacts = ["0x1297F794032bD97a16474B202d0a69758f8bE707", 
                "0x85C9e47DB467DaB4DA7C312B73C2e131802d626A", 
                "0x091544b3d3dbF9E81C575C810f446df4D41321F8"];
        this.storageManager = new LocalStorageManager();
        this.storageManager.clearMessages(["0x1297F794032bD97a16474B202d0a69758f8bE707","0x85C9e47DB467DaB4DA7C312B73C2e131802d626A", "0x091544b3d3dbF9E81C575C810f446df4D41321F8"]);
        this.storageManager.initialize();

        // this.generateMyRequestEvents();
        // this.generateInvitationEvents();

        // this.generateMessagesEvent();
        // this.generateMyMessages();
        // this.generateMyMessageEvent();

        console.log(window.localStorage);
    }

    generateMyRequestEvents() {
        var event1 = {};
        event1.returnValues = {
            to: this.contacts[0],
        }
        var event2 = {};
        event2.returnValues = {
            to: this.contacts[1],
        }
        var event3 = {};
        event3.returnValues = {
            to: this.contacts[2],
        }

        var events = [event1, event2, event3];

        this.storageManager.addRequestEvents(events);

        console.log(window.localStorage);
    }

    generateInvitationEvents() {
        var event1 = {};
        event1.returnValues = {
            from: this.contacts[0],
        }
        var event2 = {};
        event2.returnValues = {
            from: this.contacts[1],
        }
        var event3 = {};
        event3.returnValues = {
            from: this.contacts[2],
        }

        var events = [event1, event2, event3];

        this.storageManager.addInvitationEvents(events);

        console.log(window.localStorage);
    }

    generateMessagesEvent() {
        var message = {};
        message.blockNumber = 14;
        message.transactionHash = '0xhashof10';
        message.returnValues = {
            from: this.contacts[0],
            message: "hello 444",
            encryption: "no"
        }
        this.storageManager.addMessageFromFriendEvent(message);

        message = {};
        message.blockNumber = 15;
        message.transactionHash = '0xhashof10';
        message.returnValues = {
            from: this.contacts[0],
            message: "hello 555",
            encryption: "no"
        }

        this.storageManager.addMessageFromFriendEvent(message);

        message = {};
        message.blockNumber = 15;
        message.transactionHash = '0xhashof10';
        message.returnValues = {
            from: this.contacts[1],
            message: "hello 666",
            encryption: "no"
        }

        this.storageManager.addMessageFromFriendEvent(message);

        console.log(window.localStorage);
    }

    generateMyMessages() {
        this.storageManager.addMyLocalMessage("test my message 1", this.contacts[0], "no", "0xmy1");
        this.storageManager.addMyLocalMessage("test my message 2", this.contacts[0], "no", "0xmy2");
        this.storageManager.addMyLocalMessage("test my message 3", this.contacts[0], "no", "0xmy3");
        this.storageManager.addMyLocalMessage("test my message 1", this.contacts[2], "no", "0xmy4");

        console.log(window.localStorage);
    }

    generateMyMessageEvent() {
        var message = {};
        message.blockNumber = 15;
        message.transactionHash = '0xmy1';
        message.returnValues = {
            to: this.contacts[0],
            message: "test my message 1 updated",
            encryption: "no"
        }

        this.storageManager.addMyMessageEvent(message);

        console.log(window.localStorage);
    }

    render() {
        return (
            <div>
                <h1>Test page</h1>
            </div>
        )
    }
}

export default Test;