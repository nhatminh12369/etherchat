// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const wallet = require('ethereumjs-wallet');
const {testAccounts} = require('./testAccounts');
const utils = require('../support/Utils');
const web3 = new Web3(ganache.provider({accounts: testAccounts}));

const compiledContract = require('../ethereum/build/EtherChat.json');

let accounts;
let contract;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
        .deploy({data: compiledContract.bytecode})
        .send({from: accounts[0], gas: '3000000'});
});

describe('Joining and adding contacts', () => {
    it('deploy a contract', () => {
        assert.ok(contract.options.address);
    });

    it('join success', async () => {
        var member = await contract.methods.members(accounts[0]).call();
        assert(!member.isMember);

        await accountJoin(0);
        
        member = await contract.methods.members(accounts[0]).call();
        assert(member.isMember);
        var returnedPublicKeyStr = member.publicKeyLeft.substr(2) + member.publicKeyRight.substr(2);

        var publicKey = utils.privateToPublic(testAccounts[0].secretKey);
        assert.equal(publicKey.toString('hex'), returnedPublicKeyStr);
    });

    it('should not be able to add contact without joining', async () => {
        var hasError = false;
        try {
            await addContact(0, 1);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);
    });

    it('add contact after joining', async () => {
        await accountJoin(0);
        await addContact(0, 1);
        var relationship = await contract.methods.getRelationWith(accounts[1]).call({
            from: accounts[0]
        });
        assert.equal(1, relationship);

        await accountJoin(2);
        var relationshipWithAccount2 = await contract.methods.getRelationWith(accounts[1]).call({
            from: accounts[2]
        });
        assert.equal(0, relationshipWithAccount2);
    });

    it('should not be able to accept contact if there is no request', async () => {
        accountJoin(0);
        var hasError = false;
        try {
            await acceptContactRequest(0, 1);
        } catch (err) {
            if (err) hasError = true;
        }
        assert(hasError);

        hasError = false;
        await addContact(0, 1);
        try {
            await acceptContactRequest(0, 1);
        } catch (err) {
            if (err) hasError = true;
        }
        assert(hasError);
    });

    it('confirm contact request success', async () => {
        await accountJoin(0);
        await addContact(0, 1);

        // Account 1 hasn't joined, so, he shouldn't be able to confirm contact request
        var hasError = false;
        try {
            await acceptContactRequest(1, 0);
        } catch (err) {
            if (err) hasError = true;
        }
        assert(hasError);

        await accountJoin(1);
        await acceptContactRequest(1, 0);
        var relationship = await contract.methods.getRelationWith(accounts[1]).call({
            from: accounts[0]
        });
        assert.equal(2, relationship);
    });
});

describe('Sending message', () => {
    it('can send raw messages', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);
        await acceptContactRequest(1, 0);

        var messages = ['hello account 1', 'testing', 'how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message'];
        
        for (var i=0;i<messages.length;i++) {
            await contract.methods.sendMessage(accounts[1], stringToHex(messages[i]), stringToHex('no')).send({
                from: accounts[0],
                gas: '3000000'
            });
        }

        var messageEvents = await contract.getPastEvents('messageSentEvent',{
            filter: {},
            fromBlock: 0
        });
        for (var i=0;i<messages.length;i++) {
            var returnedMessage = messageEvents[i].returnValues.message;
            assert(messages[i], hexToString(returnedMessage));
        }
    });

    it('Can\'t send message to non member', async () => {
        await accountJoin(0);

        var hasError = false;
        try {
            await contract.methods.sendMessage(accounts[1], stringToHex('test message'), stringToHex('no')).send({
                from: accounts[0],
                gas: '3000000'
            });
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);
    });

    it('Can\'t send message to member before contact request accepted', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);

        var hasError = false;
        try {
            await contract.methods.sendMessage(accounts[1], stringToHex('test message'), stringToHex('no')).send({
                from: accounts[0],
                gas: '3000000'
            });
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);
    });

    it('Can send encrypted message', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);
        await acceptContactRequest(1, 0);
    });

    it('Encrypt/decrypt messages', () => {
        var pubkeyUser0 = '04' + utils.privateToPublic(testAccounts[0].secretKey).toString('hex');
        var pubkeyUser1 = '04' + utils.privateToPublic(testAccounts[1].secretKey).toString('hex');
        var secret0 = utils.computeSecret(testAccounts[0].secretKey, Buffer.from(pubkeyUser1, 'hex'));
        var secret1 = utils.computeSecret(testAccounts[1].secretKey, Buffer.from(pubkeyUser0, 'hex'));

        assert.equal(secret0.toString('hex'), secret1.toString('hex'));

        var message = 'this is just a test message';
        var encrypted = utils.encrypt(message, secret0);
        var decrypted = utils.decrypt(encrypted, secret1);

        assert.equal(message, decrypted.toString('hex'));
    });

    it('Can send encrypted messages', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);
        await acceptContactRequest(1, 0);

        var pubkeyUser0 = '04' + utils.privateToPublic(testAccounts[0].secretKey).toString('hex');
        var pubkeyUser1 = '04' + utils.privateToPublic(testAccounts[1].secretKey).toString('hex');
        var secret0 = utils.computeSecret(testAccounts[0].secretKey, Buffer.from(pubkeyUser1, 'hex'));
        var secret1 = utils.computeSecret(testAccounts[1].secretKey, Buffer.from(pubkeyUser0, 'hex'));

        var messages = ['Đây là một tin utf8', 'hello account 1', 'testing', 'how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message how about a very long message'];

        await contract.methods.sendMessage(accounts[0], 
            '0x' + utils.encrypt(messages[0], secret1).toString('hex'), 
            stringToHex('aes256')).send({
            from: accounts[1],
            gas: '3000000'
        });
        
        for (var i=0;i<messages.length;i++) {
            await contract.methods.sendMessage(accounts[1], 
                '0x' + utils.encrypt(messages[i], secret0).toString('hex'), 
                stringToHex('aes256')).send({
                from: accounts[0],
                gas: '3000000'
            });
        }

        var member1 = await contract.methods.members(accounts[1]).call({
            from: accounts[1]
        });
        assert(member1.messageStartBlock > 0);

        var messageEvents = await contract.getPastEvents('messageSentEvent',{
            filter: {from: accounts[0]},
            fromBlock: 0
        });

        var contactEvent = await contract.getPastEvents('addContactEvent',{
            filter: {},
            fromBlock: 0
        });
        
        for (var i=0;i<messages.length;i++) {
            var returnedMessage = messageEvents[i].returnValues.message;
            var decryptedMessage = utils.decrypt(Buffer.from(returnedMessage.substr(2), 'hex'), secret1);
            assert.equal(messages[i], decryptedMessage.toString('ascii'));
        }
    });
});

describe('Update profile', () => {
    it('Can update profile', async () => {
        await accountJoin(0);

        var name = 'Minh NguyeN';
        var avatarUrl = 'https://gOOgle.com';
        await contract.methods.updateProfile(stringToHex(name), stringToHex(avatarUrl)).send({
            from: accounts[0],
            gas: 3000000
        });

        var profile = await contract.methods.members(accounts[0]).call();
        assert.equal(name, hexToString(profile.name));
        assert.equal(avatarUrl, hexToString(profile.avatarUrl));
    });

    it('Received event after updating profile', async () => {
        await accountJoin(0);

        var name = 'Minh NguyeN';
        var avatarUrl = 'https://gOOgle.com';
        await contract.methods.updateProfile(stringToHex(name), stringToHex(avatarUrl)).send({
            from: accounts[0],
            gas: 3000000
        });

        var events = await contract.getPastEvents('profileUpdateEvent',{
            filter: {},
            fromBlock: 0
        });
        var eventData = events[0].returnValues;
        assert.equal(accounts[0], eventData.from);
        assert.equal(name, hexToString(eventData.name));
        assert.equal(avatarUrl, hexToString(eventData.avatarUrl));
    });
});

describe('Blocking users', () => {
    it('Block message from a user', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);
        await acceptContactRequest(1, 0);
        await blockMessagesFromAccountToAccount(1,0);

        var hasError = false;
        try {
            await contract.methods.sendMessage(accounts[1], stringToHex('test message'), stringToHex('no')).send({
                from: accounts[0],
                gas: '3000000'
            });
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);

        // User 1 can send message to user 0
        await contract.methods.sendMessage(accounts[0], stringToHex('test message'), stringToHex('no')).send({
            from: accounts[1],
            gas: '3000000'
        });
        assert(true);
    });

    it('block a not connected member', async() => {
        var hasError = false;
        try {
            await blockMessagesFromAccountToAccount(0, 1);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);

        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);

        var hasError = false;
        try {
            await blockMessagesFromAccountToAccount(0, 1);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);

        await acceptContactRequest(1, 0);

        var hasError = false;
        try {
            await blockMessagesFromAccountToAccount(0, 1);
            await blockMessagesFromAccountToAccount(1, 0);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(!hasError);
    });

    it('Unblock messages', async () => {
        await accountJoin(0);
        await accountJoin(1);
        await addContact(0,1);
        await acceptContactRequest(1, 0);
        await blockMessagesFromAccountToAccount(1,0);

        var hasError = false;
        try {
            await unblockMessagesFromAccountToAccount(0, 1);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(hasError);

        
        hasError = false;
        try {
            await unblockMessagesFromAccountToAccount(1, 0);
        } catch (err) {
            if (err) {
                hasError = true;
            }
        }
        assert(!hasError);

        var relationship = await contract.methods.getRelationWith(accounts[0]).call({
            from: accounts[1]
        });
        assert.equal(2, relationship);
    })
});

stringToHex = (text) => {
    return '0x' + Buffer.from(text, 'ascii').toString('hex');
}

hexToString = (hexString) => {
    if (hexString.startsWith('0x')) {
        hexString = hexString.substr(2);
    }
    return Buffer.from(hexString, 'hex').toString('ascii').replace(/\0/g, '');
}

accountJoin = async (accountIndex) => {
    var publicKey = utils.privateToPublic(testAccounts[accountIndex].secretKey);
    var publicKeyLeft = '0x' + publicKey.toString('hex', 0, 32);
    var publicKeyRight = '0x' + publicKey.toString('hex', 32, 64);

    await contract.methods
            .join(publicKeyLeft, publicKeyRight)
            .send({from: accounts[accountIndex], gas: '3000000'});
}

addContact = async (fromAccountIndex, toAccountIndex) => {
    await contract.methods.addContact(accounts[toAccountIndex]).send({
        from: accounts[fromAccountIndex],
        gas: '3000000'
    });
}

acceptContactRequest = async (fromAccountIndex, toAccountIndex) => {
    await contract.methods.acceptContactRequest(accounts[toAccountIndex]).send({
        from: accounts[fromAccountIndex],
        gas: '3000000'
    });
}

blockMessagesFromAccountToAccount = async (fromAccountIndex, toAccountIndex) => {
    await contract.methods.blockMessagesFrom(accounts[toAccountIndex]).send({
        from: accounts[fromAccountIndex],
        gas: '3000000'
    });
}

unblockMessagesFromAccountToAccount = async (fromAccountIndex, toAccountIndex) => {
    await contract.methods.unblockMessagesFrom(accounts[toAccountIndex]).send({
        from: accounts[fromAccountIndex],
        gas: '3000000'
    });
}