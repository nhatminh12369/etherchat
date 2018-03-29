module.exports.ACTION = {
    ADD_CONTACT: 'ADD_CONTACT_ACTION',
    SELECT_CONTACT: 'SELECT_CONTACT_ACTION',
    OPEN_UPDATE_PROFILE: 'OPEN_UPDATE_PROFILE',
    OPEN_PRIVATE_KEY_MODAL: 'OPEN_PRIVATE_KEY_MODAL',
    OPEN_SETTINGS_MODAL: 'OPEN_SETTINGS_MODAL'
}

module.exports.EVENT = {
    CONTACT_LIST_UPDATED: 'CONTACT_LIST_UPDATED',
    MESSAGES_UPDATED: 'MESSAGES_UPDATED',
    ACCOUNT_BALANCE_UPDATED: 'ACCOUNT_BALANCE_UPDATED',
    ACCOUNT_INFO_UPDATED: 'ACCOUNT_INFO_UPDATED',
    PENDING_TRANSACTION_UPDATED: 'PENDING_TRANSACTION_UPDATED',
    ENCOUNTERED_ERROR: 'ENCOUNTERED_ERROR'
}

module.exports.NETWORK_LIST = [
    {
        id: 1,
        name: 'Main Network',
        contractAddress: '0x3e01d88fd2c2feedf3ff761225628c92182345bc',
        explorerUrl: 'https://etherscan.io/',
        providerUrl: 'https://mainnet.infura.io/Q2aBIgYNhIB60VsqyrN1'
    },
    {
        id: 4,
        name: 'Rinkeby Test Net',
        contractAddress: '0x8291b4E82F967A855455b7773Ce99165CeE8bb55',
        explorerUrl: 'https://rinkeby.etherscan.io/',
        providerUrl: 'https://rinkeby.infura.io/Q2aBIgYNhIB60VsqyrN1'
    }
]

module.exports.ENV = {
    get ContractAddress() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.ethNetwork != undefined) {
            var network = parseInt(window.localStorage.ethNetwork);
            for (var i=0;i<module.exports.NETWORK_LIST.length;i++) {
                if (network == module.exports.NETWORK_LIST[i].id) {
                    return module.exports.NETWORK_LIST[i].contractAddress;
                }
            }
        } else {
            return "";
        }
    },

    get NetworkName() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.ethNetwork != undefined) {
            var network = parseInt(window.localStorage.ethNetwork);
            for (var i=0;i<module.exports.NETWORK_LIST.length;i++) {
                if (network == module.exports.NETWORK_LIST[i].id) {
                    return module.exports.NETWORK_LIST[i].name;
                }
            }
        } else {
            return "";
        }
    },

    get ProviderUrl() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.ethNetwork != undefined) {
            var network = parseInt(window.localStorage.ethNetwork);
            for (var i=0;i<module.exports.NETWORK_LIST.length;i++) {
                if (network == module.exports.NETWORK_LIST[i].id) {
                    return module.exports.NETWORK_LIST[i].providerUrl;
                }
            }
        } else {
            return module.exports.NETWORK_LIST[0].providerUrl;
        }
    },

    get ExplorerUrl() {
        if (typeof(Storage) !== 'undefined' && window.localStorage.ethNetwork != undefined) {
            var network = parseInt(window.localStorage.ethNetwork);
            for (var i=0;i<module.exports.NETWORK_LIST.length;i++) {
                if (network == module.exports.NETWORK_LIST[i].id) {
                    return module.exports.NETWORK_LIST[i].explorerUrl;
                }
            }
        } else {
            return module.exports.NETWORK_LIST[0].explorerUrl;
        }
    },

    set EthNetworkId(networkId) {
        if (typeof(Storage) != 'undefined') {
            window.localStorage.setItem('ethNetwork', networkId);
        }
    },

    get EthNetworkId() {
        if (typeof(Storage) !== 'undefined' || window.localStorage.ethNetwork == undefined) {
            return parseInt(window.localStorage.ethNetwork);
        } else {
            return 0;
        }
    }
}