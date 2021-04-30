import Link from 'next/link'
import Head from 'next/head'

export default function PrivacyPage () {
    return <div style={{ color: '#333', background: 'ghostwhite' }}>
        
    <Head>
        <title key="page-title">Privacy Policy | App</title>
        <meta key="page-description" name="Description" content="Privacy Policy | App"/>
    </Head>

    <div style={{ margin: '0 1.5em' }}>
        <h2 style={{ margin: 0 }}>PRIVACY POLICY</h2>

        <h5>Last Revised: September 28th 2019</h5>
        
        <p>
        Our privacy policy applies to information we collect when you use or access our website, application or services. 
        We may change this privacy policy from time to time. Whenever we make changes to this privacy policy, 
        the changes are effective after we post the revised privacy policy (as indicated by revising the date at the top of our privacy policy). 
        We encourage you to review our privacy policy whenever you access our services to stay informed about our information practices and the ways you can help protect your privacy.
        </p>

        <h3>Collection of Information</h3>
        
        <b>Information You Provide to Us</b>
            
        <p>We collect information you provide directly to us. 
        For example, we collect information when you participate in any interactive features of our services, fill out a form, request customer support, provide any contact or identifying information or otherwise communicate with us. The types of information we may collect include your name, email address, postal address, credit card information and other contact or identifying information you choose to provide.
        </p>
        
        <b>Information We Collect Automatically When You Use the Services</b>
        
        <p>When you access or use our services, we may automatically collect information about you, including:</p>

        <ul>
            <li>Information about your use of our services, including the type of browser you use, access times,
                pages viewed, your IP address and the page you visited before navigating to our services.</li>
            <li>Information about the device you use to access our services, including the hardware model, operating system and version.</li>
            <li>Information about the location of your device each time you access or use one of our mobile applications 
                or otherwise consent to the collection of this information.</li>
            <li>Information collected by cookies and other tracking technologies: 
                We may use various technologies to collect information including cookies or other storage methods. 
                We may also collect information using web beacons (also known as "tracking pixels").
            </li>
        </ul>
            
        <b>Information We Collect From Other Sources</b>
        
        <p>In order to provide you with access to the Service, or to provide you with better service in general, 
        we may combine information obtained from other sources (for example, a third-party service whose application you have authorized 
        or used to sign in) and combine that with information we collect through our services.</p>
        
        <h3>Use of Information</h3>
        
        <b>We use information about you for various purposes, including to:</b>

        <ul>
            <li>Provide, personalize, maintain and improve our services.</li>
            <li>Provide services you request, process transactions and to send you related information.</li>
            <li>Send you technical notices, updates, security alerts and support and administrative messages.</li>
            <li>Respond to your comments, questions and requests and provide customer service.</li>
            <li>Communicate with you about news and information related to our service.</li>
            <li>Monitor and analyze trends, usage and activities in connection with our services.</li>
        </ul>

        <p>By accessing and using our services, you consent to the processing and transfer of your information in and to the United States and other countries.</p>
        
        <h3>Sharing of Information</h3>
        
        <b>We may share personal information about you as follows:</b>
        
        <ul>
            <li>With third party vendors and other service providers who need access to your information to carry out work on our behalf.</li>
            <li>If we believe disclosure is reasonably necessary to comply with any applicable law, regulation, legal process or governmental request.</li>
            <li>To enforce applicable user agreements or policies, including our 
                <Link href="/terms">
                    <a title="Terms of Service" aria-label="Click to view terms of service">Terms of Service</a>
                </Link> 
                and to protect us, our users or the public from harm or illegal activities.</li>
            <li>In connection with any merger, sale of our assets, financing or acquisition of all or a portion of our business to another company; and</li>
            <li>If we notify you through our services (or in our privacy policy) that the information you provide will be shared in a particular manner and you provide such information.</li>
        </ul>
        
        <p>We may also share aggregated or anonymized information that does not directly identify you.</p>
        
        <b>Third Party Analytics</b>
            
        <p>We may allow third parties to provide analytics services. These third parties may use cookies, web beacons and other technologies to collect information about your use of the services and other websites, including your IP address, web browser, pages viewed, time spent on pages, links clicked and conversion information. This information may be used by us and third parties to, among other things, analyze and track data, determine the popularity of certain content and other websites and better understand your online activity. Our privacy policy does not apply to, and we are not responsible for, third party cookies, web beacons or other tracking technologies and we encourage you to check the privacy policies of these third parties to learn more about their privacy practices.</p>
        
        <h3>Security</h3>
        
        <p>We take reasonable measures to help protect personal information from loss, theft, misuse and unauthorized access, disclosure, 
        alteration and destruction.
        </p>
        
        <h3>Your Information Choices</h3>
        
        <b>Location Information</b>
        
        <p>If you initially consent to our collection of location information, you can subsequently stop the collection of this information at any time 
        by changing the preferences on your device. If you do so, our services, or certain features thereof, may no longer function.</p>
        
        <b>Promotional Communications</b>
        
        <p>You may opt out of receiving any promotional emails from us by following the instructions in those emails. If you opt out, we may still send you non-promotional communications, such as those about your account or our ongoing business relations.</p>
            
        <h3>Contact Us</h3>
        
        <p>If you have any questions about this privacy policy, please contact us at:</p>  
        
        <div>[INSERT PHYSICAL AND/OR E-MAIL ADDRESS].</div>
        
        <div>[FINAL NOTE: CERTAIN APPLICATION STORES (E.G., APPLE APP STORE, GOOGLE PLAY, ETC.) 
            MAY REQUIRE YOU TO INCLUDE CERTAIN MINIMUM PRIVACY COMMITMENTS IN THIS PRIVACY POLICY AS A CONDITION TO MAKING YOUR APPLICATION 
            AVAILABLE ON SUCH PLATFORM. IF APPLICABLE, REVIEW YOUR AGREEMENT WITH ANY SUCH APPLICATION STORE TO DETERMINE IF ADDITIONAL PROVISIONS ARE REQUIRED.]
        </div>

        </div>
    </div>
}