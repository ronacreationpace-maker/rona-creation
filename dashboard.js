// ======================================
// RONA CREATION
// dashboard.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    updateDashboard();

});

// ======================================
// Dashboard
// ======================================

function updateDashboard(){

    const data =
        JSON.parse(localStorage.getItem("invoice")) || [];

    // Total Invoice
    document.getElementById("dashInvoice").innerHTML =
        data.length;

    // Total Customer
    const customer =
        [...new Set(data.map(i => i.customer))];

    document.getElementById("dashCustomer").innerHTML =
        customer.length;

    let hari = 0;
    let bulan = 0;

    const today = new Date();

    const tglHari =
        today.toISOString().slice(0,10);

    const bulanIni =
        today.toISOString().slice(0,7);

    data.forEach(inv=>{

        const total =
            Number(
                String(inv.grandtotal)
                .replace(/[^\d]/g,"")
            );

        if(inv.tanggal == tglHari){

            hari += total;

        }

        if(inv.tanggal.startsWith(bulanIni)){

            bulan += total;

        }

    });

    document.getElementById("dashHari").innerHTML =
        rupiah(hari);

    document.getElementById("dashBulan").innerHTML =
        rupiah(bulan);

}

// ======================================
// Format Rupiah
// ======================================

function rupiah(angka){

    return new Intl.NumberFormat("id-ID",{

        style:"currency",

        currency:"IDR",

        minimumFractionDigits:0

    }).format(angka);

}