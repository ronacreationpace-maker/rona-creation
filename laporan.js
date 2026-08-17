// ======================================
// RONA CREATION
// laporan.js
// ======================================

let chartOmzet = null;
document.addEventListener("DOMContentLoaded", () => {

    tampilLaporan();

    document
        .getElementById("btnFilter")
        .addEventListener("click", tampilLaporan);

    document
        .getElementById("btnExcel")
        .addEventListener("click", exportExcel);

    document
        .getElementById("btnPDF")
        .addEventListener("click", exportPDF);  
});

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

// ======================================
// Tampilkan Laporan
// ======================================

function tampilLaporan(){

    const data =
        JSON.parse(localStorage.getItem("invoice")) || [];

    const tglAwal =
        document.getElementById("tglAwal").value;

    const tglAkhir =
        document.getElementById("tglAkhir").value;

    let html = "";

    let totalInvoice = 0;
    let totalCustomer = new Set();
    let totalItem = 0;
    let omzet = 0;

    let subtotalAll = 0;
    let ongkirAll = 0;
    let diskonAll = 0;
    let dpAll = 0;
    let grandAll = 0;

    const grafik = {};
    
    data.forEach((inv,index)=>{

        if(tglAwal && inv.tanggal < tglAwal) return;
        if(tglAkhir && inv.tanggal > tglAkhir) return;

        const tanggal = inv.tanggal;

const grand = Number(
    String(inv.grandtotal)
    .replace(/[^\d]/g,"")
);

if (!grafik[tanggal]) {

    grafik[tanggal] = 0;

}

grafik[tanggal] += grand;

        totalInvoice++;

        totalCustomer.add(inv.customer);

        totalItem += inv.items.length;

        omzet += Number(
            String(inv.grandtotal)
            .replace(/[^\d]/g,"")
        );

        subtotalAll += Number(
    String(inv.subtotal).replace(/[^\d]/g,"")
) || 0;

ongkirAll += Number(
    String(inv.ongkir).replace(/[^\d]/g,"")
) || 0;

diskonAll += Number(
    String(inv.diskon).replace(/[^\d]/g,"")
) || 0;

dpAll += Number(
    String(inv.dp).replace(/[^\d]/g,"")
) || 0;

grandAll += Number(
    String(inv.grandtotal).replace(/[^\d]/g,"")
) || 0;

        html += `

        <tr>

            <td>${totalInvoice}</td>

            <td>${inv.invoice}</td>

            <td>${inv.tanggal}</td>

            <td>${inv.customer}</td>

            <td>${inv.status || "-"}</td>

            <td class="text-end">

                ${inv.grandtotal}

            </td>

        </tr>

        `;

    });

    document.getElementById("laporanBody").innerHTML = html;

document.getElementById("jmlInvoice").innerHTML =
    totalInvoice;

document.getElementById("jmlCustomer").innerHTML =
    totalCustomer.size;

document.getElementById("jmlItem").innerHTML =
    totalItem;

document.getElementById("omzet").innerHTML =
    rupiah(omzet);

document.getElementById("subtotalAll").innerHTML =
    rupiah(subtotalAll);

document.getElementById("ongkirAll").innerHTML =
    rupiah(ongkirAll);

document.getElementById("diskonAll").innerHTML =
    rupiah(diskonAll);

document.getElementById("dpAll").innerHTML =
    rupiah(dpAll);

document.getElementById("grandAll").innerHTML =
    rupiah(grandAll);

// ===============================
// Grafik Omzet
// ===============================

const labels = Object.keys(grafik);
const values = Object.values(grafik);

if(chartOmzet){
    chartOmzet.destroy();
}

chartOmzet = new Chart(
    document.getElementById("chartOmzet"),
    {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Omzet Penjualan",
                data: values,
                backgroundColor: "#b10000",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);

const awal =
    tglAwal || "Semua";

const akhir =
    tglAkhir || "Semua";

document.getElementById("periodeCetak").innerHTML =
    `Periode : ${awal} s/d ${akhir}`;

    
}

// ======================================
// Export Excel
// ======================================

function exportExcel(){

    const table =
        document.querySelector("table");

    const workbook =
        XLSX.utils.table_to_book(
            table,
            {
                sheet:"Laporan"
            }
        );

    XLSX.writeFile(
        workbook,
        "Laporan_RONA_CREATION.xlsx"
    );

}

// ======================================
// Export PDF
// ======================================

function exportPDF(){

    const element =
        document.querySelector(".container");

    const option = {

        margin: 8,

        filename: "Laporan_RONA_CREATION.pdf",

        image: {
            type: "jpeg",
            quality: 1
        },

        html2canvas: {
            scale: 2
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }

    };

    html2pdf().set(option).from(element).save();

}