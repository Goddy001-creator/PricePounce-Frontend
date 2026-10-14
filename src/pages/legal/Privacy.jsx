import { Link } from "react-router-dom";
import LegalLayout, { Section } from "./LegalLayout";
import { LEGAL as L } from "../../config/legal";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`${L.registeredName} (“${L.brand}”, “we”) respects your privacy. This policy explains what personal data we collect, why, who we share it with, and the choices you have. We follow the Nigeria Data Protection Act 2023.`}
    >
      <Section title="1. Who is responsible for your data">
        <p>{L.registeredName}, {L.address}. Contact: <a href={`mailto:${L.email}`}>{L.email}</a>.</p>
      </Section>

      <Section title="2. What we collect">
        <ul>
          <li><strong>Account details:</strong> your name, email address and a scrambled (hashed) version of your password. We cannot read your password.</li>
          <li><strong>Your activity in the app:</strong> products on your watchlist, price alerts, and settings such as theme and email preferences.</li>
          <li><strong>Security details:</strong> if you turn on two-factor sign-in, the encrypted secret needed for it, plus your login sessions.</li>
          <li><strong>Security log:</strong> for important events such as logins and account changes, we record the time, your IP address and browser type, to detect and investigate abuse. These records are kept for up to 12 months and your personal details are removed from them when you delete your account.</li>
          <li><strong>Payment records:</strong> when you buy Pro we keep the Paystack payment reference, plan, amount, date and status. Your card or bank details go directly to Paystack and are never stored by us.</li>
          <li><strong>Technical data:</strong> things like your IP address and browser type, used to keep the service secure and to limit abuse, and error reports if something breaks.</li>
        </ul>
      </Section>

      <Section title="3. Cookies">
        <p>We use only the cookies needed to run the site: a login session cookie and a security token that protects your account from forged requests. We do not use advertising or tracking cookies, and we do not currently use analytics tools. If that changes, we will update this page first.</p>
      </Section>

      <Section title="4. Why we use your data">
        <ul>
          <li>To create and run your account and provide the service (our contract with you).</li>
          <li>To send price alerts and the weekly digest if you turn them on, and necessary emails such as password resets and receipts.</li>
          <li>To take payment and manage your Pro plan.</li>
          <li>To keep the service secure and prevent abuse or fraud.</li>
          <li>To meet legal and accounting duties.</li>
        </ul>
        <p>We do not sell your personal data and we do not use it for advertising.</p>
      </Section>

      <Section title="5. Who we share it with">
        <p>Only with companies that help us run the service, and only what they need:</p>
        <ul>
          <li><strong>Paystack</strong> – processes payments.</li>
          <li><strong>Brevo</strong> – sends our emails.</li>
          <li><strong>Our hosting provider</strong> – stores the data on its servers.</li>
          <li><strong>Sentry</strong> (if enabled) – receives error reports to help us fix bugs.</li>
        </ul>
        <p>We may also share data if the law requires it, for example a valid order from a court or authority. Some of these providers process data outside Nigeria; we choose providers that protect data to a reasonable standard.</p>
      </Section>

      <Section title="6. How long we keep it">
        <ul>
          <li>Account data: for as long as your account is open.</li>
          <li>When you delete your account, we delete your profile, watchlist, alerts and settings.</li>
          <li>Payment records are kept, with your personal details removed where possible, for as long as the law requires for accounting and tax.</li>
          <li>Login sessions and one-time tokens expire and are cleared automatically.</li>
        </ul>
      </Section>

      <Section title="7. Your rights">
        <p>You have the right to:</p>
        <ul>
          <li>see and get a copy of your data (Settings, then Export Data, as PDF or Excel);</li>
          <li>correct wrong data (edit your profile);</li>
          <li>delete your account and data (Settings, then Delete account);</li>
          <li>switch off email alerts at any time (Settings);</li>
          <li>object to how we use your data or withdraw consent by emailing {L.email};</li>
          <li>complain to the Nigeria Data Protection Commission if you think we mishandled your data.</li>
        </ul>
      </Section>

      <Section title="8. Security">
        <p>We protect your data with measures such as hashed passwords, encrypted connections (HTTPS), restricted access to our servers and database, and rate limits against attacks. No system is perfectly secure, so please use a strong, unique password. If a breach affects your data, we will tell you and the regulator as the law requires.</p>
      </Section>

      <Section title="9. Children">
        <p>{L.brand} is for people aged {L.minAge} and over. If you are under {L.adultAge}, use it only with a parent or guardian’s permission. If you believe a child has given us data without permission, email {L.email} and we will delete it.</p>
      </Section>

      <Section title="10. Changes">
        <p>We may update this policy. We will change the date at the top and, for important changes, tell you in the app or by email. See also our <Link to="/terms">Terms of Service</Link> and <Link to="/refunds">Refund Policy</Link>.</p>
      </Section>

      <Section title="11. Contact us">
        <p>For any privacy question or request, email <a href={`mailto:${L.email}`}>{L.email}</a>.</p>
      </Section>
    </LegalLayout>
  );
}