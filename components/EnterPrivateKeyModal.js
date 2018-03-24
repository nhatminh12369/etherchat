import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Icon,
    Input,
    Message
} from 'semantic-ui-react';
import appDispatcher from '../components/AppDispatcher';

class EnterPrivateKeyModal extends Component {
    

    constructor(props) {
        super(props);
        this.state = { modalOpen: false, key: "", errorMessage:""}
        this.account = props.account;
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({errorMessage: ""});

        this.setState({ modalOpen: false })
    };

    handleConfirm = (e) => {
        e.preventDefault();
        this.setState({errorMessage: ""});

        var success = this.account.setPrivateKey(this.state.key);
        if (success) {
            this.setState({ modalOpen: false })
            window.localStorage.setItem("privateKey", this.state.key);
        } else {
            this.setState({errorMessage: "Invalid private key"});
        }
        
    };

    componentWillMount() {
        console.log('PrivateKeyModal componentWillMount');
        // this.checkForPrivateKey();

        appDispatcher.register((payload) => {
            if (payload.action == "open_privatekey_modal") {
                this.setState({modalOpen: true});
            }
        })
    }

    render() {
        console.log('PrivateKeyModal render');
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content="Please enter your private key" />
                    <Modal.Content>
                        <Input fluid value={this.state.key} onChange={event => this.setState({key: event.target.value})}/>
                        <Message error header={this.state.errorMessage} hidden={this.state.errorMessage == ""}/>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='green' onClick={this.handleConfirm}>
                        <Icon name='checkmark' /> Confirm
                    </Button>
                    <Button color='red' onClick={this.handleClose}>
                        <Icon name='close' /> Close
                    </Button>
                    </Modal.Actions>
                </Modal>
        );
    }
}

export default EnterPrivateKeyModal;