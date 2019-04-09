# EtherChat
EtherChat is an decentralized app running on Ethereum platform that allows you to send encrypted messages via a smart contract. Only you and the recipient of a message can decrypt it. All encrypted messages will be available for everyone to see because it is on the Ethereum blockchain, however, only the sender and the receiver can decrypt the messages between them, on one else can intercept it.

EtherChat only depends on the Ethereum network and can work without any centralized server.

# Article on Medium
https://medium.com/@leonardnguyen/etherchat-decentralized-messaging-application-on-ethereum-network-part-1-253e5078770b

# How to run
You need to compile the smart contract first by executing:
"node ./ethereum/compile.js"

Then, you can run the app with:
"npm run dev"

The web app will connect to the smart contract that I have already deployed. If you want to have your own smart contract on the ethereum network, you need to deploy it by yourself. Command for deploying the contract:
"node ./ethereum/deploy.js"

# Official web app
https://etherchat.co

# Authors

Minh Nguyen, nvnminh0@gmail.com

# License

EtherChat is available under the MIT license. See the LICENSE file for more info.
