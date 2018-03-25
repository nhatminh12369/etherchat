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
    Segment
} from 'semantic-ui-react';
import appDispatcher from './AppDispatcher';
import Constant from './Constant';
import AddContactModal from './AddContactModal';

class ContactList extends Component {
    constructor(props) {
        console.log(props);
        super(props);
        this.state = {contactAddresses: undefined};
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
        appDispatcher.dispatch({
            action: Constant.ACTION.ADD_CONTACT
        });
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
                contactItems.push(
                    <List.Item key={'contact_' + i}>
                        <Image avatar src='/assets/images/avatar/small/helen.jpg' />
                        <List.Content>
                            <List.Header></List.Header>
                            {contactAddresses[i].substr(0, 10)+'...'}
                        </List.Content>
                    </List.Item>
                );
            }
            htmlContent = (<List selection animated verticalAlign='middle'>{contactItems}</List>);
        }
        
        return (
            <div style={{width: '100%'}}>
                <div style={{height: 40, width: '100%'}}>
                <h2 style={{float: 'left'}}>Contact list</h2>
                <Button color='teal' style={{float: 'right'}} onClick={this.addContactClicked}><Icon name='add user'></Icon>Add</Button>
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