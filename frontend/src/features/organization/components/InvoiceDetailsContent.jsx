import { useEffect, useState } from 'react';
import { normalizeOrganization, organizationApi, readStoredOrganizationId } from '@shared/services/apiServices';
import './invoice-details.css';

// Preview of the generated invoice PDF. Every value comes from the invoice
// returned by the invoice API (plus the organization profile for the header);
// fields the backend does not send fall back to the same wording the PDF uses.

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value ?? 0));

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// 29-Sep-2026, matching the PDF. Non-date strings are shown as-is.
const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${String(date.getDate()).padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

const DEFAULT_TERMS = [
  'This is a computer-generated education fee invoice.',
  'Tax information is based on the invoice tax configuration.',
  'Payment reference is updated after successful payment.',
  'Please retain this invoice for your records.',
  'Fees once paid are non-refundable.',
  'Course access will be activated after successful payment.',
];

const toTermsList = (terms) => {
  if (Array.isArray(terms)) return terms.map(String).filter(Boolean);
  if (typeof terms === 'string' && terms.trim()) return terms.split(/\r?\n|•/).map((line) => line.trim()).filter(Boolean);
  return null;
};

// Line items from the API when present; otherwise the single course line the
// invoice was generated for.
const buildItems = (invoice) => {
  const rawItems = firstValue(invoice.items, invoice.invoiceItems, invoice.lineItems);
  if (Array.isArray(rawItems) && rawItems.length) {
    return rawItems.map((item) => ({
      name: firstValue(item.courseName, item.serviceName, item.itemName, item.description, item.name) ?? 'Not provided',
      duration: firstValue(item.duration, item.courseDuration) ?? 'Not provided',
      batchType: firstValue(item.batchType, item.mode, item.deliveryMode) ?? 'Not provided',
      quantity: firstValue(item.quantity, item.qty) ?? 1,
      unitFee: firstValue(item.unitFee, item.unitPrice, item.rate, item.amount) ?? 0,
      taxable: firstValue(item.taxableAmount, item.lineTotal, item.total, item.amount) ?? 0,
    }));
  }
  const subtotal = Number(invoice.amount ?? 0);
  return [{
    name: firstValue(invoice.courseName) ?? 'Not provided',
    duration: firstValue(invoice.duration, invoice.courseDuration) ?? 'Not provided',
    batchType: firstValue(invoice.batchType, invoice.batchMode, invoice.mode, invoice.deliveryMode) ?? 'Not provided',
    quantity: firstValue(invoice.quantity, invoice.qty) ?? 1,
    unitFee: firstValue(invoice.unitFee, invoice.unitPrice) ?? subtotal,
    taxable: firstValue(invoice.taxableAmount) ?? Math.max(0, subtotal - Number(invoice.discount ?? 0)),
  }];
};

// Organization name, address and contact for the invoice header/footer, loaded
// the same way as the Invoice settings preview. Header falls back to the
// invoice's own organization fields (or KiniEduHub) if the profile is unavailable.
function useOrganizationProfile() {
  const [organization, setOrganization] = useState({});
  useEffect(() => {
    let active = true;
    // The header is decoration: any failure here (no stored org, API error,
    // service unavailable) must never break the invoice itself.
    const load = async () => {
      try {
        const storedId = readStoredOrganizationId();
        if (!storedId) return;
        const response = await organizationApi.getById(storedId);
        if (active) setOrganization(normalizeOrganization(response));
      } catch {
        /* Profile unavailable: header uses invoice fields. */
      }
    };
    load();
    return () => { active = false; };
  }, []);
  return organization;
}

function Field({ label, value }) {
  return <div><dt>{label} :</dt><dd>{value}</dd></div>;
}

export default function InvoiceDetailsContent({ invoice }) {
  const organization = useOrganizationProfile();
  const paymentStatus = String(invoice.paymentStatus || invoice.status || 'Pending');
  const taxRate = invoice.taxRate;
  const subtotal = Number(invoice.amount ?? 0);
  const discount = Number(invoice.discount ?? 0);
  const taxableAmount = Number(firstValue(invoice.taxableAmount) ?? Math.max(0, subtotal - discount));
  const items = buildItems(invoice);

  const orgName = firstValue(invoice.organizationName, organization.organizationName, organization.name) ?? 'KiniEduHub';
  const orgAddress = firstValue(
    invoice.organizationAddress,
    [organization.addressLine1 ?? organization.address, organization.city, organization.state].filter(Boolean).join(', '),
  );
  const orgEmail = firstValue(invoice.organizationEmail, organization.email);
  const orgPhone = firstValue(invoice.organizationPhone, organization.phone);
  const orgWebsite = firstValue(invoice.organizationWebsite, organization.website);
  const orgContact = [orgEmail, orgPhone, orgWebsite].filter(Boolean);

  const dueDate = formatDate(invoice.dueDate);
  const paymentTerms = firstValue(invoice.paymentTerms) ?? (dueDate ? `Due by ${dueDate}` : 'Due on Receipt');
  const terms = toTermsList(firstValue(invoice.termsAndConditions, invoice.terms)) ?? [
    ...DEFAULT_TERMS,
    ...(orgContact.length ? [`For queries, contact ${orgContact.join(' | ')}.`] : []),
  ];
  const note = firstValue(invoice.notes, invoice.note);

  return <div className="invoice-details-content invoice-document">
    <header className="invoice-document-header">
      <div className="invoice-brand">
        {/* Pre-cropped transparent logo, so it is shown whole with object-fit: contain.
            (The square JPEG used elsewhere relies on .brand-logo-viewport enlarging and
            clipping it, which cut the artwork off in this smaller window.) */}
        <img src="/assets/kini-logo-transparent-cropped.png" alt="Kini — Learn. Innovate. Lead." className="invoice-logo" />
        <div className="invoice-org">
          <strong>{orgName}</strong>
          {orgAddress && <p>{orgAddress}</p>}
          {orgEmail && <p>{orgEmail}</p>}
          {orgPhone && <p>{orgPhone}</p>}
          {orgWebsite && <p>{orgWebsite}</p>}
        </div>
      </div>
      <div className="invoice-title"><span>EDUCATION FEE</span><strong>INVOICE</strong><small>{firstValue(invoice.id) ?? 'Not provided'}</small></div>
    </header>

    <div className="invoice-document-grid">
      <section className="invoice-document-card"><h4>BILL TO</h4><dl>
        <Field label="Student Name" value={firstValue(invoice.customerName) ?? 'Not provided'} />
        <Field label="Billing Address" value={firstValue(invoice.billingAddress, invoice.studentAddress, invoice.customerAddress, invoice.address) ?? 'Not provided'} />
        <Field label="Email" value={firstValue(invoice.customerEmail) ?? 'Not provided'} />
        <Field label="Phone" value={firstValue(invoice.studentPhone, invoice.customerPhone, invoice.phone) ?? 'Not provided'} />
      </dl></section>
      <section className="invoice-document-card"><h4>INVOICE DETAILS</h4><dl>
        <Field label="Invoice No" value={firstValue(invoice.id) ?? 'Not provided'} />
        <Field label="Invoice Date" value={formatDate(invoice.invoiceDate) ?? 'Not provided'} />
        <Field label="Payment Terms" value={paymentTerms} />
        <Field label="Place of Supply" value={firstValue(invoice.placeOfSupply) ?? 'Not configured'} />
        <Field label="Currency" value={firstValue(invoice.currency) ?? 'INR'} />
        <Field label="Invoice Type" value={firstValue(invoice.invoiceType) ?? 'Course Enrollment'} />
      </dl></section>
    </div>

    <div className="invoice-items-scroll">
      <table className="invoice-items invoice-document-items" data-table-header="plain">
        <thead><tr><th>S.No</th><th>Course / Service</th><th>Duration</th><th>Batch Type</th><th>Qty</th><th>Unit Fee (INR)</th><th>Taxable Amount (INR)</th></tr></thead>
        <tbody>{items.map((item, index) => <tr key={index}>
          <td>{index + 1}</td><td>{item.name}</td><td>{item.duration}</td><td>{item.batchType}</td><td>{item.quantity}</td><td>{money(item.unitFee)}</td><td>{money(item.taxable)}</td>
        </tr>)}</tbody>
      </table>
    </div>

    <dl className="invoice-totals invoice-document-totals">
      <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
      <div><dt>Discount</dt><dd>{money(discount)}</dd></div>
      <div><dt>Taxable Amount</dt><dd>{money(taxableAmount)}</dd></div>
      <div><dt>{taxRate !== null && taxRate !== undefined ? `Tax @ ${taxRate}%` : 'Tax'}</dt><dd>{money(invoice.tax)}</dd></div>
      <div className="invoice-total"><dt>Grand Total</dt><dd>{money(invoice.total)}</dd></div>
    </dl>

    <div className="invoice-document-grid invoice-lower-grid">
      <section className="invoice-document-card"><h4>PAYMENT DETAILS</h4><dl>
        <Field label="Payment Status" value={<span className="invoice-status" data-status={paymentStatus.toLowerCase()}>{paymentStatus}</span>} />
        <Field label="Amount Paid" value={money(invoice.paid)} />
        <Field label="Balance" value={money(invoice.balanceDue)} />
        <Field label="Payment Mode" value={firstValue(invoice.paymentMode, invoice.paymentMethod) ?? 'Not available'} />
        <Field label="Transaction / UTR" value={firstValue(invoice.transactionId, invoice.utr, invoice.utrNumber, invoice.paymentReference, invoice.referenceId) ?? 'Not available'} />
        <Field label="Payment Date" value={formatDate(firstValue(invoice.paymentDate, invoice.paidAt, invoice.paidDate)) ?? 'Not available'} />
      </dl></section>
      <section className="invoice-document-card"><h4>TERMS / NOTES</h4>
        <ul>{terms.map((term) => <li key={term}>{term}</li>)}</ul>
        {note && <p className="invoice-document-note">Note: {note}</p>}
      </section>
    </div>

    <footer className="invoice-document-footer">
      <strong>Thank you for choosing {orgName}.</strong>
      {orgContact.length > 0 && <p>{orgContact.join('  |  ')}</p>}
      <small>This is a computer-generated document and does not require a signature.</small>
    </footer>
  </div>;
}
