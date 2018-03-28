import {Component} from 'react';
import {
    Modal,
    Header,
    Button
} from 'semantic-ui-react';
import appDispatcher from './AppDispatcher';
import Constant from './Constant';

class ErrorModal extends Component {
    state = { modalOpen: false, message: ""}

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false })
    };

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.EVENT.ENCOUNTERED_ERROR) {
                this.setState({modalOpen: true, message: payload.message});
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
                <Header icon="" content="Notice" />
                    <Modal.Content>
                        <p>{this.state.message}</p>
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