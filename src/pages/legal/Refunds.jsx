import { Link } from "react-router-dom";
import LegalLayout, { Section } from "./LegalLayout";
import { LEGAL as L } from "../../config/legal";

export default function Refunds() {
  return (
    <LegalLayout
      title="Refund Policy"
      intro={`This policy explains when you can get money back for ${L.brand} Pro. It is part of our Terms of Service.`}
    >
      <Section title="1. The 7-day money-back guarantee">
        <p>If Pro is not right for you, you can ask for a refund within <strong>{L.refundDays} days</strong> of your <strong>first payment</strong> for a plan. The refund is worked out fairly: you get back what you paid, minus the days of Pro you already used.</p>
        <ul>
          <li>Each day used is charged at {L.proMonthly} ÷ 30, about {L.dailyRate} per day. Any part of a day counts as a full day.</li>
          <li>Example (monthly plan): you ask on day 3, so 3 days are used. We keep 3 × {L.dailyRate} (about 10%) and refund the rest.</li>
          <li>Example (yearly plan): you ask on day 3. We keep the same 3 days at {L.dailyRate} and refund the rest of the {L.proYearly}.</li>
        </ul>
        <p>This is for your first payment on a plan only. Automatic renewals are not covered, so cancel before the renewal date if you do not want to continue.</p>
      </Section>

      <Section title="2. After 7 days">
        <p>After {L.refundDays} days from the payment, we do not give refunds for the rest of that period. You can still cancel automatic renewal at any time and keep Pro until the end of the period you paid for.</p>
      </Section>

      <Section title="3. Mistakes we always fix">
        <p>We will refund in full, at any time, if you were charged twice for the same period, charged after you cancelled in time, or charged an amount different from what was shown at checkout.</p>
      </Section>

      <Section title="4. How to ask">
        <ol>
          <li>Email <a href={`mailto:${L.email}`}>{L.email}</a> from the address on your account.</li>
          <li>Write “Refund request” and, if you can, your Paystack payment reference (it is in your receipt email and your account export).</li>
          <li>We will reply with the refund amount. Your Pro access ends and automatic renewal is cancelled when the refund is approved.</li>
        </ol>
      </Section>

      <Section title="5. How you get the money">
        <p>Refunds go back to the card or bank you paid with, through Paystack. We aim to approve within 3 business days of your request. Your bank may take several more days to show it.</p>
      </Section>

      <Section title="6. Questions">
        <p>Email <a href={`mailto:${L.email}`}>{L.email}</a>. See also the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
      </Section>
    </LegalLayout>
  );
}