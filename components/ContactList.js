import {Component} from 'react';
import {
    List,
    Image,
    Loader,
    Dimmer,
    Menu,
    Sticky,
    Grid,
    Button,
    Icon,
    Segment,
    Label,
    Header,
    Popup
} from 'semantic-ui-react';
import appDispatcher from '../support/AppDispatcher';
import Constant from '../support/Constant';
import AddContactModal from './AddContactModal';
var {Relationship} = require('../support/Relationship');

class ContactList extends Component {
    constructor(props) {
        super(props);
        this.state = {contactAddresses: undefined, isAccepting: [], selectedAddress: ""};
        this.account = props.account;
    }

    componentDidMount() {
        this.getData();
        appDispatcher.register((payload) => {
            if (payload.action == Constant.EVENT.CONTACT_LIST_UPDATED) {
                this.setState({contactAddresses: this.account.storageManager.contactAddresses});
            }
        })
    }

    getData = async () => {
        if (this.account.isReady) {
            var list = await this.account.getContactList();
        } else {
            setTimeout(this.getData, 1000);
        }
    }

    addContactClicked = () => {
        if (this.account.isJoined) {
            appDispatcher.dispatch({
                action: Constant.ACTION.ADD_CONTACT
            });
        } else {
            appDispatcher.dispatch({
                action: Constant.EVENT.ENCOUNTERED_ERROR,
                message: 'Please join CryptoMessenger first by click on the \'Join\' button on the top-right corner'
            });
        }
    }

    acceptContactRequest = (event) => {
        if (this.account.isJoined) {
            var address = event.target.value;
            this.account.storageManager.contacts[address].isAccepting = true;
            this.account.acceptContactRequest(address);
            this.forceUpdate();
        } else {
            appDispatcher.dispatch({
                action: Constant.EVENT.ENCOUNTERED_ERROR,
                message: 'Please join CryptoMessenger first by click on the \'Join\' button on the top-right corner'
            });
        }
    }

    listItemClicked = (address, event) => {
        if (this.account.storageManager.contacts[address].relationship == Relationship.Connected) {
            appDispatcher.dispatch({
                action: Constant.ACTION.SELECT_CONTACT,
                data: address
            });
            this.setState({selectedAddress: address});
        }
    }

    render() {
        const { contactAddresses } = this.state;
        const {height} = this.props;
        var htmlContent;

        var contactItems = [];

        if (contactAddresses == undefined) {
            htmlContent = (
                <Dimmer active>
                   <Loader size='large'>Loading</Loader>
                </Dimmer>
            )
        } else if (contactAddresses.length == 0) {
            contactItems.push(
                <List.Item key={'contact_' + i}>
                    <List.Content>
                        <List.Header>Empty</List.Header>
                    </List.Content>
                </List.Item>
                );
            htmlContent = (<List selection animated verticalAlign='middle'>{contactItems}</List>);
        } else {
            for (var i=0;i<contactAddresses.length;i++) {
                var user = this.account.storageManager.contacts[contactAddresses[i]];
                var addressExplorerUrl = Constant.ENV.ExplorerUrl + 'address/' + contactAddresses[i];
                var rightAlignedContent = (<div></div>);
                if (user.relationship == Relationship.NoRelation) {
                    rightAlignedContent = (
                        <div>
                            <Button color='orange' floated='right' loading={user.isAccepting} disabled={user.isAccepting} 
                                onClick={this.acceptContactRequest} value={contactAddresses[i]}>Accept</Button>
                            <Popup  key={'info_button_popup_' + i}
                                    trigger={<Button color='green' as='a' href={addressExplorerUrl} target='_blank' circular icon='info circle'></Button>}
                                    content='View on Etherscan'
                            />
                        </div>
                    );
                } else if (user.relationship == Relationship.Requested) {
                    rightAlignedContent = (
                        <List.Content floated='right'>
                            <Popup  key={'wait_popup_' + i}
                                    trigger={<Button color='yellow' circular icon='wait'></Button>}
                                    content='Pending acceptance'
                            />
                            <Popup  key={'info_button_popup_' + i}
                                    trigger={<Button color='green' as='a' href={addressExplorerUrl} target='_blank' circular icon='info circle'></Button>}
                                    content='View on Etherscan'
                            />
                        </List.Content>
                    );
                }

                var address = contactAddresses[i];
                contactItems.push(
                    <List.Item active={address == this.state.selectedAddress} key={'contact_' + i} value={address} onClick={this.listItemClicked.bind(this,address)}>
                        <Image avatar src={user.avatarUrl ? user.avatarUrl : 'static/images/user.png'}/>
                        <List.Content>
                            <List.Header>
                                {user.name ? user.name : address.substr(0, 10)}
                            </List.Header>
                            {address.substr(0,14) + '...'}
                        </List.Content>
                        {rightAlignedContent}
                    </List.Item>
                );
            }
            htmlContent = (<List selection verticalAlign='middle'>{contactItems}</List>);
        }
        
        return (
            <div style={{width: '100%'}}>
                <div style={{height: 40, width: '100%'}}>
                <Header as='h2' style={{float: 'left'}}>Contact list</Header>
                <Button color='blue' style={{float: 'right'}} onClick={this.addContactClicked}><Icon name='add user'></Icon>Add</Button>
                </div>
                <Dimmer.Dimmable as='div' style={{height: height - 40, overflow: 'auto', float: 'left', width:'100%'}}>
                    {htmlContent}
                </Dimmer.Dimmable>
                <AddContactModal account={this.account} />
            </div>
        );
    }
}

export default ContactList;