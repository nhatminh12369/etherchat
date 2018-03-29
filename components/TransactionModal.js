import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Message
} from 'semantic-ui-react';
import appDispatcher from '../support/AppDispatcher';
import Constant from '../support/Constant';

class TransactionModal extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = { modalOpen: false, askForApproval: false}
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false})
    };

    handleUpdate = () => {
        this.account.storageManager.setAskForTransactionApproval(this.state.askForApproval);
    }

    componentDidMount() {
        // appDispatcher.register((payload) => {
        //     if (payload.action == Constant.ACTION.OPEN_SETTINGS_MODAL) {
        //         this.setState({modalOpen: true, message: payload.message, title: payload.title});
        //     }
        // });
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content='Settings' />
                    <Modal.Content>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='blue' onClick={this.handleUpdate}>
                        Update
                    </Button>
                    <Button color='grey' onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default TransactionModal;