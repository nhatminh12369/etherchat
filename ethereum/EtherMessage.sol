pragma solidity ^0.4.20;

contract EtherMessage {
    event messageSentEvent(address from, address to, bytes message, bytes32 encryption);
    event addContactEvent(address from, address to);
    
    enum RelationshipType {NoRelation, Requested, Connected, Blocked}
    
    struct Member {
        bytes32 publicKeyLeft;
        bytes32 publicKeyRight;
        bytes32 name;
        bytes32 avatarUrl;
        uint messageStartBlock;
        bool isMember;
    }
    
    mapping (address => address[]) contactLists;
    mapping (address => mapping (address => RelationshipType)) relationships;
    mapping (address => Member) public members;
    
    function EtherMessage() public {
    }
    
    // TRANSACTIONAL METHODS

    function addContact(address addr) public onlyMember {
        require(relationships[msg.sender][addr] == RelationshipType.NoRelation);
        
        relationships[msg.sender][addr] = RelationshipType.Requested;
        emit addContactEvent(msg.sender, addr);
    }

    function acceptContactRequest(address addr) public onlyMember {
        require(relationships[addr][msg.sender] == RelationshipType.Requested);
        
        relationships[msg.sender][addr] = RelationshipType.Connected;
        relationships[addr][msg.sender] = RelationshipType.Connected;
        contactLists[msg.sender].push(addr);
        contactLists[addr].push(msg.sender);
    }
    
    function join(bytes32 publicKeyLeft, bytes32 publicKeyRight) public {
        require(members[msg.sender].isMember == false);
        
        Member memory newMember = Member(publicKeyLeft, publicKeyRight, '', '', 0, true);
        members[msg.sender] = newMember;
    }
    
    function sendMessage(address to, bytes message, bytes32 encryption) public onlyMember {

        // Whether A can send message to B depends on the relationship between B to A
        require(relationships[to][msg.sender] == RelationshipType.Connected);

        if (members[to].messageStartBlock == 0) {
            members[to].messageStartBlock = block.number;
        }
        
        emit messageSentEvent(msg.sender, to, message, encryption);
    }
    
    // Blocking is one-way
    function blockMessagesFrom(address from) public onlyMember {
        require(relationships[msg.sender][from] == RelationshipType.Connected);

        relationships[msg.sender][from] = RelationshipType.Blocked;
    }
    
    function unblockMessagesFrom(address from) public onlyMember {
        require(relationships[msg.sender][from] == RelationshipType.Blocked);

        relationships[msg.sender][from] = RelationshipType.Connected;
    }
    
    function setName(bytes32 name) public onlyMember {
        members[msg.sender].name = name;
    }
    
    function setAvatarUrl(bytes32 url) public onlyMember {
        members[msg.sender].avatarUrl = url;
    }
    
    modifier onlyMember() {
        require(members[msg.sender].isMember == true);
        _;
    }
    
    // CALL METHODS
    function getContactList() public view onlyMember
        returns (address[] addresses, bytes32[] names, bytes32[] avatarUrls, 
        bytes32[] pubkeyLefts, bytes32[] pubkeyRights, uint[] msgStartBlocks) {
            addresses = contactLists[msg.sender];
            uint count = addresses.length;

            names = new bytes32[](count);
            avatarUrls = new bytes32[](count);
            pubkeyLefts = new bytes32[](count);
            pubkeyRights = new bytes32[](count);
            msgStartBlocks = new uint[](count);

            for (uint i=0;i<count;i++) {
                Member storage member = members[addresses[i]];
                names[i] = member.name;
                avatarUrls[i] = member.avatarUrl;
                pubkeyLefts[i] = member.publicKeyLeft;
                pubkeyRights[i] = member.publicKeyRight;
                msgStartBlocks[i] = member.messageStartBlock;
            }
    }
    
    function getRelationWith(address a) public view onlyMember returns (RelationshipType) {
        return relationships[msg.sender][a];
    }
}
