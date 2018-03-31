import {Component} from 'react';
import {
    Modal,
    Header,
    Button,
    Icon,
    Form
} from 'semantic-ui-react';
import appDispatcher from '../support/AppDispatcher';
import Constant from '../support/Constant';

class UpdateProfileModal extends Component {
    constructor(props) {
        super(props);
        this.account = props.account;
        this.state = {modalOpen: false, name: this.account.name, avatarUrl: this.account.avatarUrl};
    }

    handleClose = (e) => {
        e.preventDefault();
        this.setState({ modalOpen: false })
    };

    updateProfileClicked = (e) => {
        e.preventDefault();
        this.account.updateProfile(this.state.name, this.state.avatarUrl, (resultEvent) => {
            if (resultEvent == Constant.EVENT.ON_RECEIPT) {
                window.location.reload();
            }
        });
        this.setState({ modalOpen: false });
    }

    componentDidMount() {
        appDispatcher.register((payload) => {
            if (payload.action == Constant.ACTION.OPEN_UPDATE_PROFILE) {
                this.setState({modalOpen: true});
            } else if (payload.action == Constant.EVENT.ACCOUNT_INFO_UPDATED) {
                this.setState({name: this.account.name, avatarUrl: this.account.avatarUrl});
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.state.modalOpen}
                onClose={this.handleClose}
                >
                <Header icon="" content="Update name and avatar" />
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                            <label>Name</label>
                            <input placeholder='Maximum 32 characters' value={this.state.name} 
                                onChange={(e) => {
                                    if (e.target.value.length <= 32) {
                                        this.setState({name: e.target.value});
                                    }
                                }}/>
                            </Form.Field>
                            <Form.Field>
                            <label>Avatar URL</label>
                            <input placeholder='Maximum 32 characters' value={this.state.avatarUrl} 
                                onChange={(e) => {
                                    if (e.target.value.length <= 32) {
                                        this.setState({avatarUrl: e.target.value});
                                    }
                                }} />
                            <label>If your avatar URL is longer than 32 characters, 
                                please consider using <a href='https://goo.gl/' target='_blank'>Google URL Shortener</a></label>
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='orange' onClick={this.updateProfileClicked}>
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

export default UpdateProfileModal;