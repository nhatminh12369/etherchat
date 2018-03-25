import web3 from '../ethereum/web3';
import appDispatcher from '../components/AppDispatcher';
import Constant from '../components/Constant';

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

        console.log(window.localStorage);
        
        // setTimeout(this.pullEvents, 10000);
    }

    start = () => {
        this.pullEvents();
    }

    getBlockNumber = async () => {
        var blockNumber = await web3.eth.getBlockNumber();
        // console.log('Block number: ' + blockNumber);
        // setTimeout(this.getBlockNumber, 5000);
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