// ======================================
// RONA CREATION
// hitung.js
// ======================================


// ===============================
// Format Rupiah
// ===============================

function rupiah(angka){

    return new Intl.NumberFormat("id-ID",{

        style:"currency",

        currency:"IDR",

        minimumFractionDigits:0

    }).format(angka);

}


// ===============================
// Hitung Invoice
// ===============================

function hitungInvoice(){

    let subtotal = 0;

    document
    .querySelectorAll("#itemBody tr")
    .forEach(function(row){

        const qty =
        Number(
            row.querySelector(".qty").value
        ) || 0;

        const harga =
        Number(
            row.querySelector(".harga").value
        ) || 0;

        const total =
        qty * harga;

        subtotal += total;

        row.querySelector(".total").value =
        rupiah(total);

    });

    document.getElementById("subtotal").value =
    rupiah(subtotal);

    const ongkir =
    Number(
        document.getElementById("ongkir").value
    ) || 0;

    const diskon =
    Number(
        document.getElementById("diskon").value
    ) || 0;

    const dp =
    Number(
        document.getElementById("dp").value
    ) || 0;

    const grandTotal =
    subtotal +
    ongkir -
    diskon -
    dp;

    document.getElementById("grandtotal").value =
    rupiah(grandTotal);

}


// ===============================
// Event Otomatis
// ===============================

document.addEventListener("input",function(e){

    if(

        e.target.classList.contains("qty") ||

        e.target.classList.contains("harga") ||

        e.target.id=="ongkir" ||

        e.target.id=="diskon" ||

        e.target.id=="dp"

    ){

        hitungInvoice();

    }

});


// ===============================
// Hitung Awal
// ===============================

document.addEventListener("DOMContentLoaded",function(){

    setTimeout(function(){

        hitungInvoice();

    },100);

});