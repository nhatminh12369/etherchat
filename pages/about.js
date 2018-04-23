// Copyright (c) 2018 Nguyen Vu Nhat Minh
// Distributed under the MIT software license, see the accompanying file LICENSE

import {Component} from 'react';
import {
    Container,
    Segment
} from 'semantic-ui-react';
import HeaderMenu from '../views/HeaderMenu';
import Footer from '../views/Footer';
import Constant from '../support/Constant';
import GuideModal from '../views/modals/GuideModal';
import Head from 'next/head';

class About extends Component {
    render() {
        return (
            <Container>
                <Head>
                    <title>About {Constant.APP_NAME}</title>
                </Head>

                <HeaderMenu />
                <GuideModal />
                <Container style={{marginTop: 100, fontSize: '1.2em'}}>
                    <h1>About {Constant.APP_NAME}</h1>
                    <p>{Constant.APP_NAME} is an Ethereum app that allows you to send encrypted messages 
                        via a smart contract that only you and the recipient of a message can decrypt it.</p>
                    <p>Contact: contact@etherchat.co</p>
                    <p>{Constant.APP_NAME} is an open source project and available at: <a href={Constant.GITHUB_LINK} target='_blank'>Github link</a></p>
                    <p>We also published an <a href={Constant.MEDIUM_LINK} target='_blank'>article on medium</a></p>
                </Container>
                <Footer />
            </Container>
        )
    }
}

export default About;