import { Link } from "react-router-dom";
import LegalLayout, { Section } from "./LegalLayout";
import { LEGAL as L } from "../../config/legal";

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro={`These terms are the agreement between you and ${L.registeredName} (“${L.brand}”, “we”, “us”), a registered business name in ${L.address}. By creating an account or using ${L.brand} you agree to them. If you don’t agree, please don’t use the service.`}
    >
      <Section title="1. What PricePounce is">
        <p>{L.brand} is a price-tracking service. We show prices and discounts for products sold by online stores in Nigeria, let you save products to a watchlist, and send alerts when prices change.</p>
        <p>We are not a shop. You do not buy anything from us. We are not affiliated with, endorsed by or sponsored by Jumia, Konga or any other store. Their names belong to them.</p>
      </Section>

      <Section title="2. Prices and information">
        <p>Prices, discounts, ratings and availability come from third-party stores and can change at any moment. They may be late, incomplete or wrong. Always check the price and details on the store’s own website before you buy. We are not responsible for a purchase you make based on information shown here.</p>
        <p>Deal insights, verdicts such as “good deal” and similar labels are automatic guides based on past prices we recorded. They are not advice or a promise that a price will rise or fall.</p>
      </Section>

      <Section title="3. Who can use it">
        <p>You must be at least {L.minAge} years old. If you are under {L.adultAge}, you may use {L.brand} only with the permission of a parent or guardian, who is responsible for your use of it. Paid plans can be bought only by people aged {L.adultAge} or over, or by a parent or guardian.</p>
      </Section>

      <Section title="4. Your account">
        <ul>
          <li>Give us a real email address and keep your details correct.</li>
          <li>Keep your password secret. You are responsible for what happens under your account.</li>
          <li>One person per account. Don’t sell, share or transfer your account.</li>
          <li>Tell us quickly at {L.email} if you think someone else got into your account.</li>
        </ul>
      </Section>

      <Section title="5. Free and Pro plans">
        <p>{L.brand} has a free plan and a paid plan called Pro. Pro currently costs {L.proMonthly} per month, or {L.proYearly} per year when you pay yearly. Features of each plan are shown in the app and may change over time. We will not remove something you have already paid for during your paid period.</p>
      </Section>

      <Section title="6. Payments and automatic renewal">
        <ul>
          <li>Payments are handled by Paystack. We never see or store your card number.</li>
          <li>Pro renews automatically at the end of each period (monthly or yearly) and charges the same payment method until you cancel.</li>
          <li>Prices are in Nigerian naira. If we change the price, we will tell you by email at least 30 days before it applies to your next renewal.</li>
          <li>If a renewal payment fails, Pro ends when your paid period ends.</li>
        </ul>
      </Section>

      <Section title="7. Cancelling">
        <p>You can cancel automatic renewal at any time in the app (open Go Pro or Pro status, then “Cancel automatic renewal”). You keep Pro until the end of the period you already paid for. After that your account returns to the free plan and your watchlist stays.</p>
      </Section>

      <Section title="8. Refunds">
        <p>Our refund rules are on the <Link to="/refunds">Refund Policy</Link> page and form part of these terms.</p>
      </Section>

      <Section title="9. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>copy our data in bulk, scrape the site, or use bots or automated tools to collect it;</li>
          <li>resell or republish our price data;</li>
          <li>try to break, overload or bypass the security of the service, or access other users’ accounts or data;</li>
          <li>use the service to break the law or to harm others;</li>
          <li>pretend to be someone else or give false details.</li>
        </ul>
      </Section>

      <Section title="10. Alerts and emails">
        <p>If you turn on email alerts, we email you about price changes on products you watch, and a weekly digest. You can switch these off at any time in Settings. We also send emails that are necessary to run your account, such as password resets and payment receipts.</p>
      </Section>

      <Section title="11. Our content">
        <p>The {L.brand} name, logo, design and software belong to us. You may use the service for your own personal use. Store names, product names and images belong to their owners.</p>
      </Section>

      <Section title="12. Availability">
        <p>We try to keep {L.brand} running, but we do not promise it will always be available, error-free or up to date. We may change, pause or stop parts of it, for example for maintenance or because a data source is no longer available.</p>
      </Section>

      <Section title="13. Limits of our responsibility">
        <p>The service is provided “as is”. To the extent the law allows, we are not responsible for indirect or consequential losses, lost savings, or decisions you make using the information shown. Our total responsibility for any claim related to the service is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms removes rights you have under Nigerian consumer law that cannot be removed.</p>
      </Section>

      <Section title="14. Ending your account">
        <p>You can delete your account at any time in Settings. We may suspend or close an account that breaks these terms or puts the service or other users at risk. We will give notice where reasonably possible.</p>
      </Section>

      <Section title="15. Changes to these terms">
        <p>We may update these terms. If a change matters, we will tell you in the app or by email before it applies. If you keep using {L.brand} after the change date, you accept the new terms.</p>
      </Section>

      <Section title="16. Governing law and disputes">
        <p>These terms are governed by the laws of the Federal Republic of Nigeria. Please contact us first so we can try to settle any problem. If we cannot, the courts of {L.court}, Nigeria will have jurisdiction.</p>
      </Section>

      <Section title="17. Contact">
        <p>{L.registeredName}, {L.address}. Email: <a href={`mailto:${L.email}`}>{L.email}</a>.</p>
      </Section>
    </LegalLayout>
  );
}