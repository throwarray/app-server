import Link from 'next/link'
import Head from 'next/head'

export default function () {
    return <div style={{ color: '#333', background: 'ghostwhite' }}><div style={{ margin: '0 1.5em' }}>
    <Head>
        <title key="page-title">Terms of service | App</title>
        <meta key="page-description" name="Description" content="Terms of service | App"/>
    </Head>

    <h2 style={{ margin: 0 }}>TERMS OF SERVICE</h2>

    <h5>Last Revised: September 28th 2019</h5>
    
    <p>
    These Terms of service ("Terms") apply to your access and use of the service (the "Service"). Please read them carefully.
    </p>
    <p>
    These Terms constitute the entire agreement between you and the Service regarding the use of the Service, superseding any prior agreements between you and the Service relating to your use of the Service.
    </p>

    <h3>Accepting these Terms</h3>
    

    <p>If you access or use the Service, it means you agree to be bound by all of the Terms below. 
    Before you use the Service please read all of the Terms;  If you don't agree to all of the Terms below, please do not use the Service.
    </p>

    <h3>Changes to these Terms</h3>
    <p>
    We reserve the right to modify these Terms at any time.
    Whenever we make changes to these Terms, the changes are effective after we post such revised Terms (indicated by revising the date at the top of these Terms) or upon your acceptance if we provide a mechanism for your immediate acceptance of the revised Terms (such as a click-through confirmation or acceptance button). It is your responsibility to check for changes to these Terms.
    If you continue to use the Service after the revised Terms go into effect, then you have accepted the changes to these Terms.
    </p>
    

    <h3>Privacy Policy</h3>

    <p>
    For information about how we collect and use information about users of the Service,
    please check out our <Link href="/terms"><a title="Privacy Policy" aria-label="Click to view privacy policy">privacy policy.</a></Link>
    </p>

    <h3>Third-Party Services</h3>

    <p>
    From time to time, we may provide you with links to third party websites or services that we do not 
    own or control. Your use of the Service may also include the use of applications that are developed 
    or owned by a third party. Your use of such third party applications, websites, and services is 
    governed by that party's own terms of service or privacy policies. We encourage you to read the 
    terms and conditions and privacy policy of any third party application, website or service that you 
    visit or use.
    </p>

    <h3>Creating Accounts</h3>

    <p>When you create an account or use another service to log in to the Service, 
    you agree to maintain the security of your password and accept all risks of unauthorized 
    access to any data or other information you provide to the Service. If you discover or suspect 
    any Service security breaches, please let us know as soon as possible.
    </p>


    <h3>Your Content & Conduct</h3>

    <p>
    {/* Our Service allows you and other users to post, link and otherwise make available content.  */}
    You are responsible for the content that you make available to the Service, including its legality, 
    reliability, and appropriateness. When you post, link or otherwise make available content to 
    the Service, you grant us the right and license to use, reproduce, modify, publicly perform, 
    publicly display and distribute your content on or through the Service.
    Copies of your deleted content may remain in our system or backups for some period of time. 
    {/* We will retain web server access logs for a maximum of [TIME PERIOD] and then delete them. */}
    </p>

    <b>
    You may not post, link and otherwise make available on or through the Service any of the following:
    </b>

    <ul>
        <li>
            Content that is libelous, defamatory, bigoted, fraudulent or deceptive.
        </li>
        <li>
            Content that is illegal or unlawful, that would otherwise create liability.
        </li>
        <li>
            Content that may infringe or violate any patent, trademark, trade secret, copyright, 
            right of privacy, right of publicity or other intellectual or other right of any party.
        </li>
        <li>
            Mass or repeated promotions, political campaigning or commercial messages directed at 
            users who do not follow you (SPAM).
        </li>
        <li>
            Private information of any third party (e.g., addresses, phone numbers, email addresses, 
            Social Security numbers and credit card numbers).
        </li>
        <li>
            Viruses, corrupted data or other harmful, disruptive or destructive files or code.
        </li>
    </ul>

    <b>
    You agree that you will not do any of the following in connection with the Service or other users:
    </b>

    <ul>
        <li>Use the Service in any manner that could interfere with, disrupt, negatively affect or 
        inhibit other users from fully enjoying the Service or that could damage, disable, overburden or 
        impair the functioning of the Service.</li>
        <li>Impersonate or post on behalf of any person or entity or otherwise misrepresent your 
        affiliation with a person or entity.</li>
        <li>Collect any personal information about other users, or intimidate, threaten, stalk or 
        otherwise harass other users of the Service.</li>
        <li>Create an account or post any content if you are not over 13 years of age years of age.</li>
        <li>Circumvent or attempt to circumvent any filtering, security measures, rate limits or other 
        features designed to protect the Service, users of the Service, or third parties.</li>
    </ul>

    <h3>Materials</h3>

    <p>
    We put a lot of effort into creating the Service including, the logo, designs, 
    text, graphics, pictures, information and other content (excluding user submitted or third party content). 
    This property is owned by us or our licensors and it is protected by U.S. 
    and international copyright laws. We grant you the right to use it.
    </p>

    <p>
    This product uses the TMDb API but is not endorsed or certified by <a className="brand tmdb" href={'https://www.themoviedb.org/'}>TMDb.</a> We 
    do not claim ownership of any of the images or data in the API.
    </p>
    
    <p>
    Unless we expressly state otherwise, your rights do not include: 
    </p>

    <ol>
        <li>Publicly performing or publicly displaying the Service</li>
        <li>Modifying or otherwise making any derivative uses of 
        the Service or any portion thereof;</li>
        <li>Using any data mining, robots or similar data 
        gathering or extraction methods; </li>
        <li>Downloading (other than page caching) of any portion of 
        the Service or any information contained therein; </li>
        <li>Reverse engineering or accessing 
        the Service in order to build a competitive product or service; or </li>
        <li>Using 
        the Service other than for its intended purposes. If you do any of this, 
        we may terminate your use of the Service.</li>
    </ol>

    <h3>Hyperlinks and Third Party Content</h3>
    
    <p>You may create a hyperlink to the Service. But, you may not use, frame or utilize framing techniques to enclose any of our trademarks, 
    logos or other proprietary information without our express written consent. The Service makes no claim or representation regarding, and accepts no responsibility for third 
    party websites accessible by hyperlink from the Service or websites linking to the Service. 
    When you leave the Service, you should be aware that these Terms and our policies no longer govern.</p> 
    
    <p>If there is any content on the Service from you and others, we don't review, 
    verify or authenticate it, and it may include inaccuracies or false information. We make no representations, warranties, or guarantees relating to the quality, suitability, 
    truth, accuracy or completeness of any content contained in the Service. You acknowledge sole responsibility for and assume all risk arising from your use of or 
    reliance on any content.</p>

    <h3>Legal</h3>
    <p>
        THE SERVICE AND ANY OTHER SERVICE AND CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE ARE PROVIDED TO YOU ON AN AS IS OR AS 
        AVAILABLE BASIS WITHOUT ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND. WE DISCLAIM ANY AND ALL WARRANTIES AND REPRESENTATIONS (EXPRESS OR IMPLIED, ORAL OR WRITTEN) 
        WITH RESPECT TO THE SERVICE AND CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE WHETHER ALLEGED TO ARISE BY OPERATION OF LAW, 
        BY REASON OF CUSTOM OR USAGE IN THE TRADE, BY COURSE OF DEALING OR OTHERWISE.
    </p>
    <p>
        IN NO EVENT WILL THE SERVICE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY SPECIAL, INDIRECT, INCIDENTAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES OF ANY KIND ARISING OUT OF OR 
        IN CONNECTION WITH THE SERVICE OR ANY OTHER SERVICE AND/OR CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE, REGARDLESS OF THE FORM OF ACTION, 
        WHETHER IN CONTRACT, TORT, STRICT LIABILITY OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES OR ARE AWARE OF THE POSSIBILITY OF SUCH DAMAGES. 
        OUR TOTAL LIABILITY FOR ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF LIABILITY WILL BE LIMITED TO THE AMOUNT YOU PAID TO THE SERVICE. THIS SECTION WILL BE GIVEN FULL 
        EFFECT EVEN IF ANY REMEDY SPECIFIED IN THIS AGREEMENT IS DEEMED TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
    </p>

    <p>
        You agree to defend, indemnify and hold us harmless from and against any and all costs, damages, liabilities, and expenses (including attorneys' fees, costs, penalties, 
        interest and disbursements) we incur in relation to, arising from, or for the purpose of avoiding, any claim or demand from a third party relating to your use of the Service 
        or the use of the Service by any person using your account, including any claim that your use of the Service violates any applicable law or regulation, or the rights of any 
        third party, and/or your violation of these Terms.
    </p>

    <h3>Governing Law</h3>
    <p>
    [PLEASE NOTE THAT THIS TEMPLATE INCORPORATES TERMS AND SECTIONS THAT ARE INTENDED FOR U.S-BASED SERVICES. CONSULT WITH LEGAL COUNSEL TO DETERMINE THE APPROPRIATE GOVERNING LAW FOR YOUR TERMS AND WHETHER YOU ARE SUBJECT TO ANY ADDITIONAL LEGAL REQUIREMENTS BASED ON HOW AND WHERE YOUR SERVICE OPERATES.]
    The validity of these Terms and the rights, obligations, and relations of the parties under these Terms will be construed and determined under and in accordance with the laws of the [U.S. STATE NAME OR OTHER JURISDICTION], without regard to conflicts of law principles.
    </p>

    <h3>Jurisdiction</h3>
    <p>You expressly agree that exclusive jurisdiction for any dispute with the Service or relating to your use of it, resides in the courts of the [STATE NAME OR JURISDICTION] and you further agree and expressly consent to the exercise of personal jurisdiction in the courts of the [STATE NAME OR JURISDICTION] located in [CITY AND STATE IF APPLICABLE] in connection with any such dispute including any claim involving Service. You further agree that you and Service will not commence against the other a class action, class arbitration or other representative action or proceeding.</p>

    <h3>Termination</h3>

    <p>If you breach any of these Terms, we have the right to suspend or disable your access to or use of the Service.</p>

    <h3>Questions & Contact Information</h3>
    <p>Questions or comments about the Service may be directed to us at the email address [SUPPORT EMAIL ADDRESS].</p>

    </div></div>
}





































// import { connect } from 'react-redux'

// import { Message } from '../components/Layout'

// import { withRouter } from 'next/router'

// function Page (Component, options = {}) {
//     const Loader = options.loading? options.loading : ()=> (<Message>Loading...</Message>)

//     const Wrapper = connect(
//         function (state) { 
//             return { 
//                 state: state
//             } 
//         },
//         null
//     )(withRouter(function ({ router, dispatch, state, ...props }) {
//         const { loading } = state

//         if (loading) 
//             return <Loader/>
//         else 
//             return <Component
//                 router={router} 
//                 dispatch={dispatch} 
//                 state={state} 
//                 {...props}
//             ></Component>
//     }))

//     if (Component.getInitialProps) {
//         Wrapper.getInitialProps = async function (...args) {
//             const pageProps = await Component.getInitialProps(...args)

//             return pageProps
//         }
//     }

//     return Wrapper
// }




// function Terms ({ router, state, title }) {
//     const providers = (state.user? state.user.providers : void 0) || []

//     console.log('PROVIDERS', providers)

//     return <div>{ title }</div>
// }

// function Wait (ms, arg) {
//     return new Promise(function (resolve) {
//         setTimeout(function () {
//             resolve(arg)
//         }, ms)
//     })
// }

// // Terms.getInitialProps = async function ({ req }) {
// //     if (!req) await Wait(5000)

// //     console.log('WAITING')

// //     return {
// //         title: 'Terms of service'
// //     }
// // }

// export default Page(Terms)






