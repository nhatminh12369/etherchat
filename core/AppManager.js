import AccountManager from './AccountManager'
import LocalStorageManager from './LocalStorageManager'
import ContractManager from './ContractManager'
import EventHandler from './EventHandler'

class AppManager {
    constructor() {
        //this.account = {};
    }

    initialize() {
        this.storageManager = new LocalStorageManager();
        this.storageManager.initialize();

        this.contractManager = new ContractManager(this.storageManager);
        this.account = new AccountManager(this.storageManager);
        //this.startEventHandler();
    }

    // Start to listen to EtherChat's events
    startEventHandler = async () => {
        var address = this.account.getAddress();
        if (address) {
            this.eventHandler = new EventHandler(address, this.contract, this.storageManager);
            this.eventHandler.start();
            await this.contractManager.getProfile();
        }
    }

    getTransactionDispatcher() {
        if (this.contractManager) {
            return this.contractManager.transactionManager.dispatcher;
        }
    }

    // Initiate a request to send a transaction to EtherChat contract to join
    joinContract = (callback) => {
        var publicKey = this.account.getPublicKeyBuffer();
        this.contractManager.joinContract(publicKey, callback);
    }

    addContact = (address, callback) => {
        this.contractManager.addContact(address, callback);
    }

    acceptContactRequest = (address, callback) => {
        this.contractManager.addContact(address, callback);
    }

    updateProfile = (name, avatarUrl, callback) => {
        this.contractManager.updateProfile(name, avatarUrl, callback);
    }

    sendMessage = async (toAddress, message) => {
        var publicKey = this.storageManager.contacts[toAddress].publicKey;
        this.contractManager(toAddress, publicKey, message);
    }
}

export default AppManager;