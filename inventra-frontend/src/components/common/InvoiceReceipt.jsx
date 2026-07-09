import React from "react";
import { useCurrency } from "@/hooks/useCurrency";

/**
 * Professional Invoice Receipt Component
 * Displays a beautifully formatted invoice with company branding
 */
const InvoiceReceipt = ({ invoice, companyName = "Inventra POS" }) => {
  const { formatCurrency, symbol } = useCurrency();

  if (!invoice) return null;

  const items = invoice.items?.length ? invoice.items : [{ name: "Services", qty: 1, unitPrice: invoice.amount }];
  const subtotal = invoice.amount || 0;
  const tax = 0; // Add tax calculation if needed
  const total = subtotal + tax;

  return (
    <div className="w-full bg-white p-8 text-gray-800" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header with Logo and Invoice Title */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 text-white font-bold text-lg">
            IN
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{companyName}</p>
            <p className="text-xs text-gray-500">Point of Sale System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-gray-900">INVOICE</p>
        </div>
      </div>

      {/* Invoice Info Bar - Blue Accent */}
      <div className="flex items-center gap-6 mb-6 pb-4">
        <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-r-full font-bold text-sm">
          Invoice # {invoice.invoiceNumber || invoice.id?.slice(-6).toUpperCase()}
        </div>
        <div className="flex gap-8 ml-4">
          <div>
            <p className="text-xs font-semibold text-gray-600">Date</p>
            <p className="text-sm font-bold text-gray-900">{invoice.issued || new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600">Due Date</p>
            <p className="text-sm font-bold text-gray-900">{invoice.due || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600">Status</p>
            <p className={`text-sm font-bold ${
              invoice.status === "Paid" ? "text-green-600" :
              invoice.status === "Pending" ? "text-orange-600" :
              "text-red-600"
            }`}>
              {invoice.status || "Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-600 uppercase mb-2">Invoice to:</p>
        <p className="text-lg font-bold text-gray-900">{invoice.client}</p>
        {invoice.clientEmail && <p className="text-sm text-gray-600 mt-1">{invoice.clientEmail}</p>}
        {invoice.clientPhone && <p className="text-sm text-gray-600">{invoice.clientPhone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white">
            <th className="px-4 py-3 text-left font-bold text-sm">SL.</th>
            <th className="px-4 py-3 text-left font-bold text-sm">Item Description</th>
            <th className="px-4 py-3 text-right font-bold text-sm">Price</th>
            <th className="px-4 py-3 text-center font-bold text-sm">Qty.</th>
            <th className="px-4 py-3 text-right font-bold text-sm">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
              <td className="px-4 py-4 text-sm font-semibold text-gray-700">{idx + 1}</td>
              <td className="px-4 py-4 text-sm text-gray-900 font-medium">{item.name}</td>
              <td className="px-4 py-4 text-right text-sm text-gray-700 font-medium">
                {symbol}{(Number(item.unitPrice) || 0).toFixed(2)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-700 font-medium">{item.qty}</td>
              <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                {symbol}{((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Empty rows for spacing */}
          {items.length < 4 && (
            Array.from({ length: 4 - items.length }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="border-b border-gray-200 bg-gray-50 h-12">
                <td colSpan="5"></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
            <span className="text-sm font-semibold text-gray-700">Sub Total:</span>
            <span className="text-sm font-bold text-gray-900">{symbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-gray-300">
            <span className="text-sm font-semibold text-gray-700">Tax (0%):</span>
            <span className="text-sm font-bold text-gray-900">{symbol}{tax.toFixed(2)}</span>
          </div>
          <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-r-full flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span>{symbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
        <div>
          <p className="text-sm font-bold text-gray-900 mb-3">Payment Information:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold">Account #:</p>
            <p className="text-gray-700">Your bank account number</p>
            <p className="font-semibold mt-2">A/C Name:</p>
            <p className="text-gray-700">{companyName}</p>
            <p className="font-semibold mt-2">Bank Details:</p>
            <p className="text-gray-700">Add your bank details here</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 mb-3">Terms & Conditions:</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {invoice.notes || "Payment must be received within the due date. Late payments may incur additional charges. Thank you for your business."}
          </p>
        </div>
      </div>

      {/* Signature Line */}
      <div className="mb-8">
        <div className="w-48">
          <div className="border-t-2 border-gray-800 pt-2 text-center">
            <p className="text-xs font-bold text-gray-700">Authorised Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-l-full font-bold text-center text-sm">
        Thank you for your business
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceReceipt;
