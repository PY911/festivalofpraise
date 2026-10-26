import { createFileRoute } from "@tanstack/react-router";
import { LegalContact, LegalPage } from "@/components/LegalPage";

const DESC = "How the Festival of Praise @20 website collects, uses and protects your information.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Festival of Praise @20" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Privacy Policy | Festival of Praise @20" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="26 October 2026">
      <p>This website is run by Bethlehem Society, Methodist Church Ghana ("we", "us") for Festival of Praise @20. This policy explains what information we collect and how we use it. We aim to handle personal data in line with Ghana's Data Protection Act, 2012 (Act 843).</p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Merchandise orders:</strong> your name, phone number, any notes you add, and the items, sizes and quantities you order.</li>
        <li><strong>WhatsApp messages:</strong> if you choose to send your order via WhatsApp, WhatsApp processes that message under its own privacy policy.</li>
        <li><strong>Festival questions:</strong> questions you type into "Ask the festival" are sent to an AI service to generate an answer. Your conversations are saved only in your own browser, not on our servers.</li>
        <li><strong>Basic technical data:</strong> like most websites, our hosting provider may record standard information such as your browser type and pages visited.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To receive, prepare and arrange your merchandise orders and contact you about them.</li>
        <li>To answer your questions about the festival.</li>
        <li>To keep the website working and secure.</li>
      </ul>
      <p>We do not sell your information or use it for advertising.</p>

      <h2>Please don't share sensitive details</h2>
      <p>Do not enter passwords, bank or mobile money details, or other sensitive personal information into the order notes or the question box.</p>

      <h2>Who we share it with</h2>
      <p>Only the service providers needed to run the site (website hosting, our order database and the AI answering service), and WhatsApp if you choose to use it. We may also share information if required by law.</p>

      <h2>How long we keep it</h2>
      <p>Order details are kept for as long as needed to complete orders and for reasonable record-keeping afterwards. You can clear your saved festival conversations at any time by deleting them in the chat or clearing your browser data.</p>

      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete the personal information we hold about you by contacting us.</p>

      <h2>Children</h2>
      <p>Children should place orders with the help of a parent or guardian.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows the latest version.</p>

      <h2>Contact</h2>
      <LegalContact />
    </LegalPage>
  );
}
