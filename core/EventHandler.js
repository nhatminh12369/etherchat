// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import web3 from '../ethereum/web3';
import appDispatcher from '../core/AppDispatcher';
import Constant from '../support/Constant';
import utils from '../support/Utils';

// EventHandler object currently make requests to the smart contract periodically 
//    to get events initiated by the contract.

class EventHandler {
    constructor(myAddress, contractManager, storageManager) {
        this.myAddress = myAddress;
        this.contractManager = contractManager;
        this.storageManager = storageManager;
    }

    pullContactEvents = async (blockNumber, currentDataBlock) => {

        // Get list of invitation requests that the current user sent
        var myRequestEvents = await this.contractManager.getPastEvents('addContactEvent', {
            filter: {from: this.myAddress},
            fromBlock: currentDataBlock+1,
            toBlock: blockNumber
        });
        this.storageManager.addRequestEvents(myRequestEvents);

        // Get list of invitation requests from other users send to the current user
        var invitationEvents = await this.contractManager.getPastEvents('addContactEvent', {
            filter: {to: this.myAddress},
            fromBlock: currentDataBlock+1,
            toBlock: blockNumber
        });
        this.storageManager.addInvitationEvents(invitationEvents);

        for (var i=0;i<myRequestEvents.length;i++) {
            await this.contractManager.getMemberInfo(myRequestEvents[i].returnValues.to, Constant.Relationship.Requested);
        }
        for (var i=0;i<invitationEvents.length;i++) {
            await this.contractManager.getMemberInfo(invitationEvents[i].returnValues.from, Constant.Relationship.NoRelation);
        }

        var myAcceptContactEvents = await this.contractManager.getPastEvents('acceptContactEvent', {
            filter: {from: this.myAddress},
            fromBlock: currentDataBlock+1,
            toBlock: blockNumber
        });
        this.storageManager.addMyAcceptContactEvents(myAcceptContactEvents);

        var acceptContactEvents = await this.contractManager.getPastEvents('acceptContactEvent', {
            filter: {to: this.myAddress},
            fromBlock: currentDataBlock+1,
            toBlock: blockNumber
        });
        this.storageManager.addAcceptContactEvents(acceptContactEvents);

        // If the one who accept our contact doesn't have publicKey yet 
        // we need to get it from the smart contract
        for (var i=0;i<acceptContactEvents.length;i++) {
            var fromAddress = acceptContactEvents[i].returnValues.from;
            if (!this.storageManager.contacts[fromAddress].publicKey) {
                await this.contractManager.getMemberInfo(fromAddress, Constant.Relationship.Connected);
            }
        }

        // Get profile update event to check if anyone in the current user contact list has updated their profile
        var profileUpdateEvents = await this.contractManager.getPastEvents('profileUpdateEvent', {
            filter: {from: this.storageManager.contactAddresses},
            fromBlock: currentDataBlock + 1,
            toBlock: blockNumber
        });
        
        for (var i=0;i<profileUpdateEvents.length;i++) {
            var eventData = profileUpdateEvents[i].returnValues;
            this.storageManager.updateContact(eventData.from, "", 
                utils.hexStringToAsciiString(eventData.name), 
                utils.hexStringToAsciiString(eventData.avatarUrl), 0);
        }

        if (myRequestEvents.length > 0 || invitationEvents.length > 0 || 
            profileUpdateEvents.length > 0 || myAcceptContactEvents.length > 0 || 
            acceptContactEvents.length > 0) {

            appDispatcher.dispatch({
                action: Constant.EVENT.CONTACT_LIST_UPDATED
            })
        }
    }

    pullMessageEvents = async (blockNumber, currentDataBlock) => {
        var messagesSent = await this.contractManager.getPastEvents('messageSentEvent', {
            filter: {from: this.myAddress},
            fromBlock: currentDataBlock + 1,
            toBlock: blockNumber
        });
        var messagesReceived = await this.contractManager.getPastEvents('messageSentEvent', {
            filter: {to: this.myAddress},
            fromBlock: currentDataBlock + 1,
            toBlock: blockNumber
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
                if (messagesSent[iSent].blockNumber < messagesReceived[iReceived].blockNumber) {
                    this.storageManager.addMyMessageEvent(messagesSent[iSent]);
                    iSent++;
                } else {
                    this.storageManager.addMessageFromFriendEvent(messagesReceived[iReceived]);
                    iReceived++;
                }
            }
        }

        if (messagesReceived.length > 0 || messagesSent.length > 0) {
            appDispatcher.dispatch({
                action: Constant.EVENT.MESSAGES_UPDATED,
            })
        }
    }

    pullEvents = async () => {
        try {
            // Get the last updated block number
            var currentDataBlock = this.storageManager.getCurrentDataBlock();

            var blockNumber = await web3.eth.getBlockNumber();

            if (blockNumber > currentDataBlock) {
                await this.pullContactEvents(blockNumber, currentDataBlock);
                await this.pullMessageEvents(blockNumber, currentDataBlock);
                this.storageManager.setCurrentDataBlock(blockNumber);
            
            }
        } catch (err) {
            console.log(err.message);
        }

        setTimeout(this.pullEvents, 5000);
    }

    start = () => {
        this.pullEvents();
    }
}

export default EventHandler;