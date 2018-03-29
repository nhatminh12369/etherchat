import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Message
} from 'semantic-ui-react';
import appDispatcher from './AppDispatcher';
import Constant from './Constant';

class ErrorModal extends Component {
    state = { modalOpen: false, message: "", title: ""}

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false })
    };

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.EVENT.ENCOUNTERED_ERROR) {
                this.setState({modalOpen: true, message: payload.message, title: payload.title});
            }
        });
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content={this.state.title ? this.state.title : "Notice"} />
                    <Modal.Content>
                        <Message error>{this.state.message}</Message>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='grey' onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ErrorModal;