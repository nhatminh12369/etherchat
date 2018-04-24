import web3 from '../ethereum/web3';
import compiledContract from '../ethereum/build/EtherChat.json';
import TransactionsManager from './TransactionManager';
import appDispatcher from './AppDispatcher';
import Config from '../support/Config';

/**
 * Responsible for interacting with the Ethereum smart contract
 */

class ContractManager {
    constructor(localStorage) {
        this.getContract();
        this.transactionManager = new TransactionsManager(localStorage);
    }
    // Create a web3 contract object that represent the ethereum smart contract
    getContract = async () => {
        this.contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface), 
                Config.ENV.ContractAddress);
    }

    // getProfile = async (address) => {
    //     return await this.contract.methods.members(address).call();
    // }

    // Get current account profile from EtherChat contract's storage
    getProfile = async () => {
        var result = await this.contract.methods.members(this.getAddress()).call();
        if (result.isMember == 1) {
            // this.isJoined = true;
            // this.avatarUrl = utils.hexStringToAsciiString(result.avatarUrl);
            // this.name = utils.hexStringToAsciiString(result.name);
            this.storageManager.setJoinedStatus(true);
            this.storageManager.setName(this.name);
            this.storageManager.setAvatarUrl(this.avatarUrl);
            
            appDispatcher.dispatch({
                action: Constant.EVENT.ACCOUNT_INFO_UPDATED
            })
        }
    }

    joinContract = async(publicKeyBuffer, callback) => {
        var publicKeyLeft = '0x' + publicKeyBuffer.toString('hex', 0, 32);
        var publicKeyRight = '0x' + publicKeyBuffer.toString('hex', 32, 64);

        this.transactionManager.executeMethod(this.contract.methods.join(publicKeyLeft, publicKeyRight))
            .on(Constant.EVENT.ON_APPROVED, (txHash) => {
                if (callback) callback(Constant.EVENT.ON_APPROVED);
            })
            .on(Constant.EVENT.ON_REJECTED, (txHash) => {
                if (callback) callback(Constant.EVENT.ON_REJECTED);
            })
            .on(Constant.EVENT.ON_RECEIPT, (receipt) => {
                if (callback) callback(Constant.EVENT.ON_RECEIPT);
            })
            .on(Constant.EVENT.ON_ERROR, (error, txHash) => {
                appDispatcher.dispatch({
                    action: Constant.EVENT.ENCOUNTERED_ERROR,
                    message: error.message,
                    title: "Error"
                });
                if (callback) callback(Constant.EVENT.ON_ERROR);
            });
    }

    addContact = async (address, callback) => {
        var method = this.contract.methods.addContact(address);
        this.transactionManager.executeMethod(method)
            .on(Constant.EVENT.ON_APPROVED, (txHash) => {
                if (callback) callback(Constant.EVENT.ON_APPROVED);
            })
            .on(Constant.EVENT.ON_RECEIPT, (receipt) => {
                if (callback) callback(Constant.EVENT.ON_RECEIPT);
            })
            .on(Constant.EVENT.ON_ERROR, (error, txHash) => {
                appDispatcher.dispatch({
                    action: Constant.EVENT.ENCOUNTERED_ERROR,
                    message: error.message,
                    title: "Error"
                });
                if (callback) callback(Constant.EVENT.ON_ERROR);
            });
    }

    acceptContactRequest = async (address, callback) => {
        var method = this.contract.methods.acceptContactRequest(address);
        this.transactionManager.executeMethod(method)
            .on(Constant.EVENT.ON_APPROVED, (txHash) => {
                if (callback) callback(Constant.EVENT.ON_APPROVED);
            })
            .on(Constant.EVENT.ON_RECEIPT, (receipt) => {
                if (callback) callback(Constant.EVENT.ON_RECEIPT);
            })
            .on(Constant.EVENT.ON_ERROR, (error, txHash) => {
                appDispatcher.dispatch({
                    action: Constant.EVENT.ENCOUNTERED_ERROR,
                    message: error.message,
                    title: "Error"
                });
                if (callback) callback(Constant.EVENT.ON_ERROR);
            });
    }

    updateProfile = async (name, avatarUrl, callback) => {
        var nameHex = '0x' + Buffer.from(name, 'ascii').toString('hex');
        var avatarUrlHex = '0x' + Buffer.from(avatarUrl, 'ascii').toString('hex');
        var method = this.contract.methods.updateProfile(nameHex, avatarUrlHex);
        this.transactionManager.executeMethod(method)
            .on(Constant.EVENT.ON_APPROVED, (txHash) => {
                if (callback) callback(Constant.EVENT.ON_APPROVED);
            })
            .on(Constant.EVENT.ON_RECEIPT, (receipt) => {
                if (callback) callback(Constant.EVENT.ON_RECEIPT);
            })
            .on(Constant.EVENT.ON_ERROR, (error, txHash) => {
                appDispatcher.dispatch({
                    action: Constant.EVENT.ENCOUNTERED_ERROR,
                    message: error.message,
                    title: "Error"
                });
                if (callback) callback(Constant.EVENT.ON_ERROR);
            });
    }

    sendMessage = async (toAddress, publicKeyBuffer, message) => {
        var encryptedRaw = utils.encrypt(message, this.computeSecret(publicKeyBuffer));
        var encryptedMessage = '0x' + encryptedRaw.toString('hex');
        var method = this.contract.methods.sendMessage(toAddress, encryptedMessage, utils.getEncryptAlgorithmInHex());

        this.transactionManager.executeMethod(method)
            .on(Constant.EVENT.ON_APPROVED, (txHash) => {
                this.storageManager.addMyLocalMessage(encryptedMessage, toAddress, utils.getEncryptAlgorithm(), txHash);
                appDispatcher.dispatch({
                    action: Constant.EVENT.MESSAGES_UPDATED,
                    data: toAddress
                });
            })
            .on(Constant.EVENT.ON_REJECTED, (data) => {
                // do nothing
            })
            .on(Constant.EVENT.ON_RECEIPT, (receipt, ) => {
                this.storageManager.updateLocalMessage(toAddress, receipt.transactionHash, Constant.SENT_STATUS.SUCCESS);
                appDispatcher.dispatch({
                    action: Constant.EVENT.MESSAGES_UPDATED,
                    data: toAddress
                });
            })
            .on(Constant.EVENT.ON_ERROR, (error, txHash) => {
                this.storageManager.updateLocalMessage(toAddress, txHash, Constant.SENT_STATUS.FAILED);
                appDispatcher.dispatch({
                    action: Constant.EVENT.MESSAGES_UPDATED,
                    data: toAddress
                });
            });
    }
}

export default ContractManager;