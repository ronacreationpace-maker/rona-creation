// ======================================
// RONA CREATION
// print.js
// ======================================

console.log("PRINT.JS BERJALAN");

console.log(
    "invoiceAktif:",
    localStorage.getItem("invoiceAktif")
);

window.onload = function () {

    const invoice =
        JSON.parse(localStorage.getItem("invoiceAktif"));

    if (!invoice) {

        alert("Tidak ada invoice yang dipilih.");

        return;

    }

    // ===============================
    // Header
    // ===============================

    document.getElementById("noInvoice").innerText =
        invoice.invoice;

    document.getElementById("tanggal").innerText =
        invoice.tanggal;

    document.getElementById("status").innerText =
    invoice.status || "Belum Lunas";

    // ===============================
    // Customer
    // ===============================

    document.getElementById("customer").innerText =
        invoice.customer;

    document.getElementById("alamat").innerText =
        invoice.alamat;

    document.getElementById("wa").innerText =
        invoice.wa;

    // ===============================
    // Ringkasan
    // ===============================

document.getElementById("subtotal").innerText =
    rupiah(invoice.subtotal);

document.getElementById("ongkir").innerText =
    rupiah(invoice.ongkir);

document.getElementById("diskon").innerText =
    rupiah(invoice.diskon);

document.getElementById("dp").innerText =
    rupiah(invoice.dp);

document.getElementById("grandtotal").innerText =
    rupiah(invoice.grandtotal);

    // ===============================
    // Detail Barang
    // ===============================

    let html = "";

    invoice.items.forEach(function(item, i){

        html += `
        <tr>

            <td>${i + 1}</td>

            <td>${item.barang}</td>

            <td>${item.qty}</td>

            <td>${rupiah(item.harga)}</td>

            <td>${rupiah(item.total)}</td>

        </tr>
        `;

    });

    document.getElementById("barang").innerHTML = html;

    // Cetak otomatis
    setTimeout(function () {

        window.print();

    }, 500);

};

// ===============================
// Format Rupiah
// ===============================

function rupiah(angka){

    if (typeof angka === "string") {
        angka = angka.replace(/[^0-9-]/g, "");
    }

    angka = Number(angka);

    if (isNaN(angka)) angka = 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);

}
