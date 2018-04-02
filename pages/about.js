import {Component} from 'react';
import {
    Container,
    Segment
} from 'semantic-ui-react';
import HeaderMenu from '../components/HeaderMenu';
import Footer from '../components/Footer';
import Constant from '../support/Constant';

class About extends Component {
    render() {
        return (
            <Container>
                <HeaderMenu />
                <Container style={{marginTop: 100, fontSize: '1.2em'}}>
                    <h1>About {Constant.APP_NAME}</h1>
                    <p></p>
                </Container>
                <Footer />
            </Container>
        )
    }
}

export default About;