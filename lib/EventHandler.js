import web3 from '../ethereum/web3';
import appDispatcher from '../components/AppDispatcher';
import Constant from '../components/Constant';
import { Relationship } from './Relationship';

class EventHandler {
    constructor(myAddress, contract, storageManager) {
        this.myAddress = myAddress;
        this.contract = contract;
        this.storageManager = storageManager;
    }

    pullEvents = async () => {
        var currentDataBlock = parseInt(window.localStorage.currentDataBlock);
        var currentBlockNumber = await web3.eth.getBlockNumber();

        if (currentBlockNumber > currentDataBlock) {
            var myRequestEvents = await this.contract.getPastEvents('addContactEvent', {
                filter: {from: this.myAddress},
                fromBlock: currentDataBlock+1,
                toBlock: currentBlockNumber
            });
            this.storageManager.addRequestEvents(myRequestEvents);

            var invitationEvents = await this.contract.getPastEvents('addContactEvent', {
                filter: {to: this.myAddress},
                fromBlock: currentDataBlock+1,
                toBlock: currentBlockNumber
            });
            this.storageManager.addInvitationEvents(invitationEvents);

            if (myRequestEvents.length > 0 || invitationEvents.length > 0) {
                appDispatcher.dispatch({
                    action: Constant.EVENT.CONTACT_LIST_UPDATED
                })
            }

            var myAcceptContactEvents = await this.contract.getPastEvents('acceptContactEvent', {
                filter: {from: this.myAddress},
                fromBlock: currentDataBlock+1,
                toBlock: currentBlockNumber
            });
            this.storageManager.addMyAcceptContactEvents(myAcceptContactEvents);

            var acceptContactEvents = await this.contract.getPastEvents('acceptContactEvent', {
                filter: {to: this.myAddress},
                fromBlock: currentDataBlock+1,
                toBlock: currentBlockNumber
            });
            this.storageManager.addAcceptContactEvents(acceptContactEvents);

            for (var i=0;i<myAcceptContactEvents.length;i++) {
                await this.getMemberInfo(myAcceptContactEvents[i].returnValues.to, Relationship.Connected);
            }
            for (var i=0;i<acceptContactEvents.length;i++) {
                await this.getMemberInfo(acceptContactEvents[i].returnValues.from, Relationship.Connected);
            }

            if (myRequestEvents.length > 0 || invitationEvents.length > 0 ||
                myAcceptContactEvents.length > 0 || acceptContactEvents.length > 0) {
                appDispatcher.dispatch({
                    action: Constant.EVENT.CONTACT_LIST_UPDATED
                })
            }

            var messagesSent = await this.contract.getPastEvents('messageSentEvent', {
                filter: {from: this.myAddress},
                fromBlock: currentDataBlock + 1,
                toBlock: currentBlockNumber
            });
            var messagesReceived = await this.contract.getPastEvents('messageSentEvent', {
                filter: {to: this.myAddress},
                fromBlock: currentDataBlock + 1,
                toBlock: currentBlockNumber
            });

            var iSent=0;
            var iReceived=0;
            while (iSent < messagesSent.length || iReceived < messagesReceived.length) {
                if (iSent >= messagesSent.length) {
                    this.storageManager.addMessageFromFriendEvent(messagesReceived[iReceived]);
                    iReceived++;
                } else if (iReceived >= messagesReceived.length) {
                    this.storageManager.addMyMessageEvent(messagesSent[iSent]);
                    iSent++;
                } else {
                    if (this.messagesSent[iSent].blockNumber < this.messagesReceived[iReceived].blockNumber) {
                        this.storageManager.addMyMessageEvent(messagesSent[iSent]);
                        iSent++;
                    } else {
                        this.storageManager.addMessageFromFriendEvent(messagesReceived[iReceived]);
                        iReceived++;
                    }
                }
            }

            window.localStorage.setItem('currentDataBlock', currentBlockNumber);
        }

        setTimeout(this.pullEvents, 10000);
    }

    start = () => {
        this.pullEvents();
    }

    getBlockNumber = async () => {
        var blockNumber = await web3.eth.getBlockNumber();
    }

    getMemberInfo = async (address, relationship) => {
        var memberInfo = await this.contract.methods.members(address).call();
        console.log(memberInfo);
        if (memberInfo.isMember) {
            var publicKey = '04' + memberInfo.publicKeyLeft.substr(2) + memberInfo.publicKeyRight.substr(2);
            var name = web3.utils.hexToAscii(memberInfo.name).replace(/\0/g, '');
            var avatarUrl = web3.utils.hexToAscii(memberInfo.avatarUrl).replace(/\0/g, '');
            this.storageManager.addContact(address, publicKey, name, avatarUrl, relationship);
        }
    }

    testStorage = () => {
        var data = [];
        for (var i=0;i<10000;i++) {
            var item = {}
            item.name = "long long name";
            item.publicKey = "adsfkjalsdjfladsjf alksdfjalsdjflajsdfldajsf alsdfj aldsf";
            item.number = 10000000000000000;
            data.push(item);
        }
        window.localStorage.setItem("testData", JSON.stringify(data));
    }
}

export default EventHandler;