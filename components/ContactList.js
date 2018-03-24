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
        this.state = {contacts: undefined};
        this.account = props.account;
    }

    componentDidMount() {
        this.getData();
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
        const { contacts } = this.state;
        const {height} = this.props;
        var htmlContent;

        var contactItems = [];

        if (contacts == undefined) {
            htmlContent = (
                <Dimmer active>
                   <Loader size='large'>Loading</Loader>
                </Dimmer>
            )
        } else if (contacts.length == 0) {
            contactItems.push(
                <List.Item key={'contact_' + i}>
                    <List.Content>
                        <List.Header>Empty</List.Header>
                    </List.Content>
                </List.Item>
                );
            htmlContent = (<List selection animated verticalAlign='middle'>{contactItems}</List>);
        } else {
            for (var i=0;i<contacts.length;i++) {
                contactItems.push(
                    <List.Item key={'contact_' + i}>
                        <Image avatar src='/assets/images/avatar/small/helen.jpg' />
                        <List.Content>
                            <List.Header>Helen</List.Header>
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