import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Icon
} from 'semantic-ui-react';
import appDispatcher from './AppDispatcher';

class GuideModal extends Component {
    state = { modalOpen: false, key: ""}

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false })

        var firstTimeUse = window.localStorage.firstTimeUse;
        if (firstTimeUse == undefined) {
            window.localStorage.setItem('firstTimeUse', "false");
            appDispatcher.dispatch({
                action: 'open_privatekey_modal',
            });
        }
    };

    componentDidMount() {
        this.checkForFirstTime();
    }

    checkForFirstTime() {
        if (typeof(Storage) !== "undefined") {
            var firstTimeUse = window.localStorage.firstTimeUse;
            if (firstTimeUse == undefined || firstTimeUse == false) {
                this.setState({modalOpen: true});
            }
        }
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='small'
                >
                <Header icon="" content="How to use" />
                    <Modal.Content>
                        <p>Please read this through</p>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='green' onClick={this.handleClose}>
                        <Icon name='checkmark' /> Got it
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default GuideModal;