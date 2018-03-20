pragma solidity ^0.4.20;

contract EtherMessage {
    event messageSent(address from, address to, string message, bytes32 encryption);
    event addContactRequest(address from, address to);
    
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
        emit addContactRequest(msg.sender, addr);
    }

    function confirmContactRequest(address addr) public onlyMember {
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
    
    function sendMessage(address to, string message, bytes32 encryption) public onlyMember {
        RelationshipType relation = relationships[msg.sender][to];
        require(relation != RelationshipType.NoRelation);
        require(relation != RelationshipType.Blocked);
        
        emit messageSent(msg.sender, to, message, encryption);
    }
    
    function blockMessagesFrom(address a) public onlyMember {
        relationships[msg.sender][a] = RelationshipType.Blocked;
    }
    
    function unblockMessagesFrom(address a) public onlyMember {
        relationships[msg.sender][a] = RelationshipType.Connected;
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
    function getContactList() public view returns (address[], uint[]) {
        uint[] memory a = new uint[](2);
        return (contactLists[msg.sender], a);
    }
    
    function getRelationWith(address a) public view returns (RelationshipType) {
        return relationships[msg.sender][a];
    }
}
