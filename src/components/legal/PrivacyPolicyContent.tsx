const EFFECTIVE_DATE = 'May 17, 2026';
const CONTACT_EMAIL = 'rovitatech@gmail.com';
const PRODUCT_NAME = 'WASCHBUDDY';

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-6 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      <p className="text-base text-muted-foreground">
        This Privacy Policy explains how <strong>{PRODUCT_NAME}</strong> collects, uses, stores, preserves,
        and protects personal information across all parts of our service — including the{' '}
        <strong>web-based administration console</strong>, <strong>mobile applications</strong> for
        residents and staff, and the <strong>backend APIs</strong> that connect them — and how we comply
        with the General Data Protection Regulation (GDPR) and UK GDPR where applicable.
      </p>
      <p className="text-sm text-muted-foreground">
        <strong>Effective date:</strong> {EFFECTIVE_DATE}
      </p>

      <h2>1. Who we are</h2>
      <p>
        <strong>{PRODUCT_NAME}</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides software that helps property managers and housing operators run shared
        laundry facilities: machine availability, reservations, queues, user onboarding, maintenance
        notices, and multi-location administration (countries, cities, dorms, and clients).
      </p>
      <p>
        For privacy questions, GDPR requests, or to exercise your rights, contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Scope — platforms covered</h2>
      <p>
        This policy applies to personal data processed through every {PRODUCT_NAME} surface, including:
      </p>
      <ul>
        <li>
          <strong>Web administration console</strong> — client administrators and super administrators who
          manage users, machines, dorms, cities, countries, clients, reservations, maintenance, and
          platform settings in the browser
        </li>
        <li>
          <strong>Mobile applications</strong> — native or hybrid apps for residents and on-site staff to
          sign in, view machine availability, make and manage reservations, join queues, receive
          notifications, and use laundry features at their assigned dorm or property
        </li>
        <li>
          <strong>Backend services and APIs</strong> — authentication, data storage, and business logic that
          power both the web console and mobile apps
        </li>
        <li>
          <strong>Account lifecycle communications</strong> — onboarding, password reset, maintenance notices,
          profile approvals, and support messages sent by email or in-app
        </li>
      </ul>
      <p>
        The same privacy rules apply whether you access {PRODUCT_NAME} from a desktop browser, tablet, or
        mobile device. Data collected in the mobile app is linked to the same account and client organization
        as data from the web console, where applicable.
      </p>
      <p>
        Each <strong>client</strong> (property operator) may act as an independent controller for their
        end-users&apos; data. Where we process data only on a client&apos;s instructions, we act as a{' '}
        <strong>processor</strong>; where we determine purposes (e.g. platform security, product
        improvement), we act as a <strong>controller</strong>.
      </p>

      <h2>3. Information we collect</h2>
      <h3>3.1 Account and identity</h3>
      <ul>
        <li>Name, email address, and password (stored in hashed form)</li>
        <li>Role (e.g. resident, client admin, super admin)</li>
        <li>Account status (active, inactive, pending approval)</li>
        <li>Mobile number, when provided during registration or profile updates</li>
        <li>Last login time and authentication tokens (access and refresh tokens)</li>
      </ul>

      <h3>3.2 Location and tenancy context</h3>
      <ul>
        <li>Client identifier, country, city, and dorm (property) associations</li>
        <li>Timezone settings for cities where applicable</li>
      </ul>

      <h3>3.3 Service usage and operations</h3>
      <ul>
        <li>Laundry machine reservations, queue entries, start/cancel events, and usage history</li>
        <li>Machine status, maintenance messages, and dorm-specific settings</li>
        <li>Profile change requests and approval workflows</li>
        <li>User support queries and replies submitted through the platform</li>
        <li>Aggregated statistics (user counts, dorm counts, reservation stats) shown in admin dashboards</li>
      </ul>

      <h3>3.4 Technical and device data</h3>
      <ul>
        <li>IP address, browser or app version, operating system, device model, and request logs</li>
        <li>
          On web: cookies and browser local storage for session management and preferences (e.g. selected
          city or dorm)
        </li>
        <li>
          On mobile: secure storage of session tokens, push notification identifiers where enabled, and
          app-specific settings needed to run the service
        </li>
        <li>Error and performance logs needed to secure, debug, and operate the service</li>
      </ul>

      <h2>4. How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Provide, authenticate, and maintain your account across web and mobile</li>
        <li>Enable reservations, queues, and machine control at your assigned location</li>
        <li>Allow client admins and super admins to manage users, machines, dorms, and settings</li>
        <li>Send transactional messages (onboarding, password reset, maintenance notices, query replies)</li>
        <li>Deliver push or in-app notifications on mobile where you have enabled them</li>
        <li>Enforce terms of use, prevent fraud, and protect the security of our systems</li>
        <li>Comply with legal obligations and respond to lawful requests</li>
        <li>Improve reliability and usability of the platform (using aggregated or anonymized data where possible)</li>
      </ul>

      <h2>5. How we store and preserve your data</h2>
      <p>
        We preserve personal data only for as long as necessary and in line with the purposes described in
        this policy. Our approach includes:
      </p>
      <ul>
        <li>
          <strong>Centralized storage</strong> — account, reservation, machine, and operational data are held
          in secure databases behind our production API, accessed by the web console and mobile apps under
          the same access controls
        </li>
        <li>
          <strong>Encryption in transit</strong> — all communication between your browser or mobile app and
          our servers uses HTTPS/TLS
        </li>
        <li>
          <strong>Access controls</strong> — role-based permissions limit who can view or change data;
          administrators only see data for organizations and locations they manage
        </li>
        <li>
          <strong>Backups</strong> — periodic backups support disaster recovery and service continuity;
          backups are protected with equivalent security measures and retained only for a limited period
        </li>
        <li>
          <strong>Retention limits</strong> — when data is no longer needed for the service, legal
          obligations, or legitimate business purposes, we delete or anonymize it where feasible
        </li>
        <li>
          <strong>Account deletion</strong> — when an account is removed or a client requests deletion,
          associated personal data is removed or anonymized subject to legal retention requirements (e.g.
          audit logs for security or disputes)
        </li>
      </ul>
      <p>
        Reservation history, authentication logs, and administrative audit trails may be kept longer where
        required for billing disputes, security investigations, or regulatory compliance, then deleted or
        aggregated according to our retention schedule.
      </p>

      <h2>6. GDPR and UK GDPR compliance</h2>
      <p>
        Where you are in the European Economic Area (EEA), United Kingdom, or another jurisdiction with
        similar data protection law, we process personal data in accordance with the GDPR and UK GDPR. This
        includes the following principles and obligations:
      </p>
      <h3>6.1 Data protection principles</h3>
      <ul>
        <li><strong>Lawfulness, fairness, and transparency</strong> — we process data on valid legal bases and explain our practices in this policy</li>
        <li><strong>Purpose limitation</strong> — we collect data for specified, explicit purposes and do not use it in incompatible ways</li>
        <li><strong>Data minimisation</strong> — we collect only what is needed to operate {PRODUCT_NAME}</li>
        <li><strong>Accuracy</strong> — you may update your profile; admins may correct records on your behalf</li>
        <li><strong>Storage limitation</strong> — we do not keep data longer than necessary (see sections 5 and 9)</li>
        <li><strong>Integrity and confidentiality</strong> — we apply technical and organizational measures to protect data</li>
        <li><strong>Accountability</strong> — we maintain records of processing and work with clients under data processing terms where we act as processor</li>
      </ul>
      <h3>6.2 Legal bases for processing</h3>
      <p>We rely on one or more of the following, depending on the activity:</p>
      <ul>
        <li><strong>Contract</strong> — to deliver the service you or your organization signed up for (web and mobile access)</li>
        <li><strong>Legitimate interests</strong> — security, fraud prevention, and improving the platform, balanced against your rights</li>
        <li><strong>Legal obligation</strong> — where required by applicable law</li>
        <li><strong>Consent</strong> — where we ask for it explicitly (e.g. optional marketing or non-essential cookies, if offered)</li>
      </ul>
      <h3>6.3 Processors and subprocessors</h3>
      <p>
        We use trusted infrastructure and service providers (e.g. cloud hosting, email delivery) that process
        data on our instructions. Where required by GDPR, we use data processing agreements that require
        subprocessors to protect personal data to the same standard.
      </p>
      <h3>6.4 International transfers</h3>
      <p>
        Data may be processed in countries outside your own. Where personal data is transferred from the EEA
        or UK to countries without an adequacy decision, we use appropriate safeguards such as Standard
        Contractual Clauses approved by the European Commission or UK authorities.
      </p>
      <h3>6.5 Data breaches</h3>
      <p>
        If we become aware of a personal data breach that is likely to result in a risk to your rights and
        freedoms, we will notify the relevant supervisory authority within 72 hours where required by GDPR,
        and affected individuals without undue delay when the breach is likely to result in a high risk to
        them.
      </p>

      <h2>7. Sharing and disclosure</h2>
      <p>We do not sell your personal data. We may share information with:</p>
      <ul>
        <li>
          <strong>Your client organization</strong> — admins at your dorm, city, or operator who manage accounts
          and operations on the platform
        </li>
        <li>
          <strong>Infrastructure providers</strong> — hosting, email delivery, and monitoring services that
          help us run {PRODUCT_NAME} under data processing agreements where required
        </li>
        <li>
          <strong>Authorities</strong> — when required by law or to protect rights, safety, and security
        </li>
      </ul>

      <h2>8. Data retention</h2>
      <p>
        We keep personal data only as long as needed for the purposes above, including while your account is
        active and for a reasonable period afterward for legal, security, and backup requirements. Clients
        may request deletion of user data subject to their policies and applicable law. See section 5 for how
        we preserve and eventually remove data.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard measures including encrypted connections (HTTPS/TLS), access controls,
        role-based permissions, secure password hashing, and restricted access to production systems. Mobile
        apps use secure token handling and platform security features where available. No method of
        transmission over the Internet is 100% secure; we encourage strong passwords and prompt reporting of
        suspected unauthorized access to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>10. Your rights under GDPR</h2>
      <p>
        If GDPR or UK GDPR applies to you, you have the following rights in relation to your personal data:
      </p>
      <ul>
        <li><strong>Right of access</strong> — obtain a copy of the personal data we hold about you</li>
        <li><strong>Right to rectification</strong> — correct inaccurate or incomplete data</li>
        <li><strong>Right to erasure</strong> — request deletion in certain circumstances (&quot;right to be forgotten&quot;)</li>
        <li><strong>Right to restrict processing</strong> — limit how we use your data in specific situations</li>
        <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
        <li><strong>Right to data portability</strong> — receive your data in a structured, commonly used format where technically feasible</li>
        <li><strong>Right to withdraw consent</strong> — where processing is based on consent, without affecting prior lawful processing</li>
        <li><strong>Right to lodge a complaint</strong> — with your local data protection supervisory authority</li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within{' '}
        <strong>one month</strong> as required by GDPR (this may be extended by two further months for complex
        requests, with notice). Residents may also contact their dorm or housing administrator, who can act
        on the platform on your behalf.
      </p>

      <h2>11. Cookies and similar technologies</h2>
      <p>
        <strong>Web:</strong> We use essential cookies and browser storage for login sessions, security, and
        remembering administrative preferences (such as selected city or dorm). We do not use third-party
        advertising cookies on the administration console.
      </p>
      <p>
        <strong>Mobile:</strong> The app may store session tokens and preferences locally on your device using
        secure storage mechanisms provided by the operating system. Push notifications, if enabled, use
        platform-specific identifiers managed according to Apple and Google policies.
      </p>
      <p>
        You can control cookies through your browser settings; disabling essential cookies may prevent the
        web service from working correctly. On mobile, you can revoke notification permissions in device
        settings.
      </p>

      <h2>12. Children</h2>
      <p>
        {PRODUCT_NAME} is intended for use in student and residential housing contexts. Accounts are typically
        created by housing operators or by users who meet their institution&apos;s eligibility rules. We do
        not knowingly collect data from children under 16 without appropriate authorization; contact us if
        you believe we have done so.
      </p>

      <h2>13. Third-party links</h2>
      <p>
        Our service may link to external sites. We are not responsible for their privacy practices. Review
        their policies before providing personal data.
      </p>

      <h2>14. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version on this page
        and update the effective date. Material changes may be communicated via the platform, mobile app, or
        email where appropriate.
      </p>

      <h2>15. Contact us</h2>
      <p>
        For privacy requests, GDPR inquiries, questions, or complaints regarding {PRODUCT_NAME}:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </li>
        <li>
          <strong>Product:</strong> {PRODUCT_NAME}
        </li>
      </ul>
      <p>We aim to respond to privacy and GDPR requests within 30 days (one month under GDPR).</p>
    </article>
  );
}
