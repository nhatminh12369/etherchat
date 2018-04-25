import AccountManager from './AccountManager'
import LocalStorageManager from './LocalStorageManager'
import ContractManager from './ContractManager'
import EventHandler from './EventHandler'
import appDispatcher from './AppDispatcher';
import Constant from '../support/Constant';

/**
 * Manage all core components of this web app includes:
 *  - contractManager: to interactive with EtherChat smart contract
 *  - storageManager: store/retrive data from window.localStorage
 *  - account: manage the local ethereum account
 * 
 * Only one instance of the App manager will be created.
 */

class AppManager {
    initialize() {
        this.storageManager = new LocalStorageManager();
        this.storageManager.initialize();

        this.account = new AccountManager(this.storageManager);
        this.contractManager = new ContractManager(this.account, this.storageManager);

        // Need to wait until the smart contract instance in this.contractManager is ready for using
        // because it will take sometime to create the web3 contract instance.
        appDispatcher.register((payload) => {
            if (payload.action == Constant.EVENT.CONTRACT_READY) {
                var accountAddress = this.account.getAddress();
                if (accountAddress) {
                    this.startEventHandler();
                    this.getProfileFromContract();
                }
            }
        });
    }

    getProfileFromContract = async () => {
        var profile = await this.contractManager.getProfile();
        this.account.setProfile(profile.name, profile.avatarUrl, profile.isJoined);
    }

    // Start to listen to EtherChat's events
    startEventHandler = (accountAddress) => {
        this.eventHandler = new EventHandler(accountAddress, this.contractManager, this.storageManager);
        this.eventHandler.start();
    }

    getTransactionDispatcher() {
        if (this.contractManager) {
            return this.contractManager.transactionManager.dispatcher;
        }
    }
}

export default AppManager;