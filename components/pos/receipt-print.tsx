"use client"

import type { Sale } from "@/lib/types"

const GHS = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

interface ReceiptPrintProps {
  sale: Sale
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  footerMessage?: string
  showTax?: boolean
}

export function ReceiptPrint({
  sale,
  companyName = "BuzinessIQ",
  companyAddress,
  companyPhone,
  footerMessage = "Thank you for your patronage!",
  showTax = true,
}: ReceiptPrintProps) {
  const printDate = new Date(sale.date).toLocaleString("en-GH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <div
      id="receipt-print-area"
      style={{
        display: "none",
        width: "74mm",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "12px",
        lineHeight: "1.5",
        color: "#000",
        backgroundColor: "#fff",
        padding: "2mm",
        margin: "0",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <div style={{ fontSize: "17px", fontWeight: "bold", letterSpacing: "1px" }}>
          {companyName}
        </div>
        {companyAddress && (
          <div style={{ fontSize: "10px", marginTop: "2px" }}>{companyAddress}</div>
        )}
        {companyPhone && (
          <div style={{ fontSize: "10px" }}>Tel: {companyPhone}</div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* ── Receipt Info ── */}
      <div style={{ fontSize: "10px", marginBottom: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Receipt#</span>
          <span style={{ fontWeight: "bold" }}>{sale.receiptNumber}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date</span>
          <span>{printDate}</span>
        </div>
        {sale.cashierName && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Cashier</span>
            <span>{sale.cashierName}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* ── Items Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          fontWeight: "bold",
          marginBottom: "3px",
          textTransform: "uppercase",
        }}
      >
        <span>Item</span>
        <span>Total</span>
      </div>

      {/* ── Items ── */}
      <div style={{ marginBottom: "5px" }}>
        {sale.items.map((item, i) => (
          <div key={i} style={{ marginBottom: "4px" }}>
            <div style={{ fontWeight: "600", fontSize: "11px" }}>{item.productName}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "#333",
              }}
            >
              <span>
                {item.quantity} x {GHS(item.unitPrice)}
              </span>
              <span style={{ fontWeight: "bold" }}>{GHS(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* ── Totals ── */}
      <div style={{ fontSize: "11px", marginBottom: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>{GHS(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Discount</span>
            <span>- {GHS(sale.discount)}</span>
          </div>
        )}
        {showTax && sale.taxAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tax ({(sale.taxRate * 100).toFixed(0)}%)</span>
            <span>{GHS(sale.taxAmount)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: "2px solid #000", margin: "5px 0" }} />

      {/* ── Grand Total ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "16px",
          marginBottom: "8px",
        }}
      >
        <span>TOTAL</span>
        <span>{GHS(sale.total)}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* ── Payment ── */}
      <div style={{ fontSize: "11px", marginBottom: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Payment</span>
          <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>
            {sale.paymentMethod.replace("_", " ")}
          </span>
        </div>
        {sale.paymentMethod === "cash" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tendered</span>
              <span>{GHS(sale.amountTendered)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <span>Change</span>
              <span>{GHS(sale.change)}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center",
          fontSize: "10px",
          marginTop: "8px",
          paddingBottom: "4px",
        }}
      >
        <div>{footerMessage}</div>
        <div style={{ marginTop: "4px", fontSize: "9px", color: "#555" }}>
          Powered by BuzinessIQ
        </div>
      </div>
    </div>
  )
}
