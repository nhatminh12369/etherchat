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

class Terms extends Component {
    render() {
        return (
            <Container>
                <Head>
                    <title>EtherChat - Terms of use</title>
                </Head>
                <HeaderMenu />
                <GuideModal />
                <Container style={{marginTop: 100, fontSize: '1.2em'}}>
                    <h1>Terms of use</h1>

                    <h2>1. Acceptance of terms</h2>
                    <p>{Constant.APP_NAME} is a messaging application that operate directly on the 
                    Ethereum blockchain without any centralized server for storing and processing 
                    messages. The Site, and any other features, tools, materials, or other services 
                    offered from time to time by {Constant.APP_NAME} are referred to here as the “Service.” Please read these Terms of Use (the “Terms” or “Terms of Use”) carefully before using the Service. By using or otherwise accessing the Services, or clicking to accept or agree to these Terms where that option is made available, you (1) accept and agree to these Terms (2) consent to the collection, use, disclosure and other handling of information as described in our Privacy Policy and (3) any additional terms, rules and conditions of participation issued by {Constant.APP_NAME} from time to time. If you do not agree to the Terms, then you may not access or use the Content or Services.</p>

                    <h2>2. Modification of Terms of Use</h2>
                    <p>{Constant.APP_NAME} reserves the right, at its sole discretion, to modify or replace the Terms of Use at any time. The most current version of these Terms will be posted on our Site. You shall be responsible for reviewing and becoming familiar with any such modifications. Use of the Services by you after any modification to the Terms constitutes your acceptance of the Terms of Use as modified.</p>


                    <h2>3. Eligibility</h2>
                    <p>You hereby represent and warrant that you are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations and warranties set forth in these Terms and to abide by and comply with these Terms.</p>

                    <p>{Constant.APP_NAME} is a global platform and by accessing the Content or Services, you are representing and warranting that, you are of the legal age of majority in your jurisdiction as is required to access such Services and Content and enter into arrangements as provided by the Service. You further represent that you are otherwise legally permitted to use the service in your jurisdiction including owning cryptographic tokens of value, and interacting with the Services or Content in any way. You further represent you are responsible for ensuring compliance with the laws of your jurisdiction and acknowledge that {Constant.APP_NAME} is not liable for your compliance with such laws.</p>


                    <h2>4. Account and Security</h2>
                    <p>When setting up an account with {Constant.APP_NAME} using your Ethereum private key, you will be responsible for keeping your own account secrets. We never send your private key to our server or any server. However, Cryto Messenger does not encrypt your private key when storing it in your browser. We recommend you to create a new Ethereum account (using Mist/Metamask or any online Ethereum wallet) and use our service on the Rinkeby test net. {Constant.APP_NAME} cannot and will not be liable for any loss or damage arising from using our service.</p>

                    <h2>5. Limitation on liability</h2>
                    <p>YOU ACKNOWLEDGE AND AGREE THAT YOU ASSUME FULL RESPONSIBILITY FOR YOUR USE OF THE SITE AND SERVICE. YOU ACKNOWLEDGE AND AGREE THAT ANY INFORMATION YOU SEND OR RECEIVE DURING YOUR USE OF THE SITE AND SERVICE MAY NOT BE SECURE AND MAY BE INTERCEPTED OR LATER ACQUIRED BY UNAUTHORIZED PARTIES. YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE SITE AND SERVICE IS AT YOUR OWN RISK. RECOGNIZING SUCH, YOU UNDERSTAND AND AGREE THAT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER {Constant.APP_NAME} NOR ITS SUPPLIERS OR LICENSORS WILL BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, EXEMPLARY OR OTHER DAMAGES OF ANY KIND, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER TANGIBLE OR INTANGIBLE LOSSES OR ANY OTHER DAMAGES BASED ON CONTRACT, TORT, STRICT LIABILITY OR ANY OTHER THEORY (EVEN IF {Constant.APP_NAME} HAD BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM THE SITE OR SERVICE; THE USE OR THE INABILITY TO USE THE SITE OR SERVICE; UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SITE OR SERVICE; ANY ACTIONS WE TAKE OR FAIL TO TAKE AS A RESULT OF COMMUNICATIONS YOU SEND TO US; HUMAN ERRORS; TECHNICAL MALFUNCTIONS; FAILURES, INCLUDING PUBLIC UTILITY OR TELEPHONE OUTAGES; OMISSIONS, INTERRUPTIONS, LATENCY, DELETIONS OR DEFECTS OF ANY DEVICE OR NETWORK, PROVIDERS, OR SOFTWARE (INCLUDING, BUT NOT LIMITED TO, THOSE THAT DO NOT PERMIT PARTICIPATION IN THE SERVICE); ANY INJURY OR DAMAGE TO COMPUTER EQUIPMENT; INABILITY TO FULLY ACCESS THE SITE OR SERVICE OR ANY OTHER WEBSITE; THEFT, TAMPERING, DESTRUCTION, OR UNAUTHORIZED ACCESS TO, IMAGES OR OTHER CONTENT OF ANY KIND; DATA THAT IS PROCESSED LATE OR INCORRECTLY OR IS INCOMPLETE OR LOST; TYPOGRAPHICAL, PRINTING OR OTHER ERRORS, OR ANY COMBINATION THEREOF; OR ANY OTHER MATTER RELATING TO THE SITE OR SERVICE.</p>

                    <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</p>
                </Container>
                <Footer />
            </Container>
        )
    }
}

export default Terms;