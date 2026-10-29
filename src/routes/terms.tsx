import { createFileRoute } from "@tanstack/react-router";
import { LegalContact, LegalPage } from "@/components/LegalPage";

const DESC = "The terms for using the Festival of Praise @20 website, merchandise store and festival question assistant.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Festival of Praise @20" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Terms of Use | Festival of Praise @20" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms of Use" updated="29 October 2026">
      <p>By using this website you agree to these terms. The site is run by Bethlehem Society, Methodist Church Ghana for Festival of Praise @20.</p>

      <h2>Event information</h2>
      <p>We work to keep event details accurate, but dates, times, venue arrangements and programme may change. Please check this site and our official social pages for the latest updates.</p>

      <h2>Merchandise orders</h2>
      <ul>
        <li>Submitting an order is a request. An order is confirmed only when our team contacts you.</li>
        <li>Prices, sizes and availability may change until your order is confirmed. Product photos are for illustration and items may differ slightly.</li>
        <li>Payment and collection or delivery arrangements will be agreed with you directly by our team.</li>
        <li>Please give a correct name and phone number so we can reach you.</li>
      </ul>

      <h2>"Ask the festival" assistant</h2>
      <p>The question assistant uses AI to answer from information on this website. Answers may sometimes be incomplete or wrong. Official announcements on this site and our social pages take priority over any AI answer.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not misuse the site, submit false orders, or try to disrupt or break into it.</li>
        <li>Do not post offensive, unlawful or misleading content.</li>
      </ul>

      <h2>Content and branding</h2>
      <p>The Festival of Praise @20 name, logos, images and text belong to Bethlehem Society, Methodist Church Ghana. Please don't reuse them for commercial purposes without permission. Sharing the event with friends is welcome.</p>

      <h2>Links to other sites</h2>
      <p>Links to WhatsApp, Google Maps, Facebook, Instagram and TikTok are provided for convenience. Those services have their own terms.</p>

      <h2>Limitation of responsibility</h2>
      <p>The site is provided "as is". To the extent the law allows, we are not responsible for losses arising from use of the site or reliance on its content.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Ghana.</p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>

      <h2>Contact</h2>
      <LegalContact />
    </LegalPage>
  );
}
