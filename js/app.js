// ======================================
// RONA CREATION
// app.js
// ======================================

// Mode Edit
let editIndex = -1;

// ======================================
// GAMBAR NOTA SEMENTARA
// ======================================

let gambarNotaAktif = "";

// ======================================
// Google Spreadsheet API
// ======================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwCY_vTfLglG-evSc9jO6X5cro24IN39tM53V1f6CgLCt1d8BthOEv_3rQLitKL7yL5/exec";

// ======================================
// Event
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const btnSimpan = document.getElementById("btnSimpan");
    if (btnSimpan) {
        btnSimpan.addEventListener("click", simpanInvoice);
    }

    const btnReset = document.getElementById("btnReset");
    if (btnReset) {
        btnReset.addEventListener("click", resetForm);
    }

    const btnCetak = document.getElementById("btnCetak");
    if (btnCetak) {
        btnCetak.addEventListener("click", bukaCetak);
    }

    const btnBackup = document.getElementById("btnBackup");
if (btnBackup) {
    btnBackup.addEventListener("click", backupData);
}

const btnRestore = document.getElementById("btnRestore");
if (btnRestore) {
    btnRestore.addEventListener("click", () => {
        document.getElementById("restoreFile").click();
    });
}

const restoreFile = document.getElementById("restoreFile");
if (restoreFile) {
    restoreFile.addEventListener("change", restoreData);
}

// ======================================
// LOAD DASHBOARD
// ======================================

updateDashboard();

// ==========================
// Customer
// ==========================

const customerInput = document.getElementById("customer");

if(customerInput){

    customerInput.addEventListener("change", isiDataCustomer);

}

loadCustomer();

});

// ======================================
// Simpan Invoice
// ======================================

// ======================================
// Simpan Invoice
// Google Spreadsheet
// ======================================

    async function simpanInvoice(){

    const googleID =
        window.invoiceGoogleID ||
        localStorage.getItem("invoiceGoogleID");

    if(googleID){

        window.invoiceGoogleID = googleID;

        await updateInvoiceGoogle();

        return;

    }

    // kode simpan invoice lama
    // tetap di bawah sini

    const customer =
        document.getElementById("customer").value.trim();

    if (customer === "") {
        alert("Nama customer masih kosong!");
        return;
    }

    const rows =
        document.querySelectorAll("#itemBody tr");

    if (rows.length === 0) {
        alert("Minimal harus ada 1 barang.");
        return;
    }

    const items = [];
    let valid = true;

    rows.forEach(function (row) {

        const barang =
            row.querySelector(".barang").value.trim();

        const qty =
            Number(row.querySelector(".qty").value);

        const harga =
            Number(row.querySelector(".harga").value);

        if (barang === "") {
            alert("Masih ada nama barang yang kosong.");
            valid = false;
            return;
        }

        if (qty <= 0) {
            alert("Qty harus lebih dari 0.");
            valid = false;
            return;
        }

        if (harga < 0) {
            alert("Harga tidak boleh negatif.");
            valid = false;
            return;
        }

        items.push({
            barang: barang,
            qty: qty,
            harga: harga,
            total: qty * harga
        });

    });

    if (!valid) return;


    // ======================================
    // Ambil Status
    // ======================================

    const statusElement =
        document.getElementById("status");

    const status =
        statusElement
            ? statusElement.value || statusElement.innerText || "Lunas"
            : "Lunas";


    // ======================================
    // Data Invoice
    // ======================================

    const invoice = {

        invoice:
            document.getElementById("invoice").value,

        tanggal:
            document.getElementById("tanggal").value,

        customer:
            customer,

        wa:
            document.getElementById("wa").value,

        alamat:
            document.getElementById("alamat").value,

        subtotal:
    Number(
        document
        .getElementById("subtotal")
        .value
        .replace(/[^\d]/g, "")
    ) || 0,

        ongkir:
            document.getElementById("ongkir").value,

        diskon:
            document.getElementById("diskon").value,

        dp:
            document.getElementById("dp").value,

 grandtotal:
    Number(
        document
            .getElementById("grandtotal")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

        status:
            status,

        admin:
            document.getElementById("admin")?.value || "",

        items:
            items

    };


    // ======================================
    // Simpan ke Google Spreadsheet
    // ======================================

    try {

      const result =
    await kirimInvoiceGoogle(invoice);


        if (!result.success) {

            throw new Error(
                result.message ||
                "Gagal menyimpan invoice."
            );

        }

        // ======================================
// SINKRONISASI DASHBOARD
// ======================================

if (
    typeof updateDashboard ===
    "function"
) {

    await updateDashboard();

}

        // ======================================
        // Simpan lokal sebagai cadangan
        // ======================================

        let data =
            JSON.parse(
                localStorage.getItem("invoice")
            ) || [];


        if (editIndex === -1) {

            data.push(invoice);

        } else {

            data[editIndex] = invoice;

            editIndex = -1;

            document.getElementById(
                "btnSimpan"
            ).innerHTML = "💾 Simpan";

        }


        localStorage.setItem(
            "invoice",
            JSON.stringify(data)
        );


        localStorage.setItem(
            "invoiceAktif",
            JSON.stringify(invoice)
        );


        // ======================================
        // Database Customer
        // ======================================

        let customerDB =
            JSON.parse(
                localStorage.getItem("customerDB")
            ) || [];


        const indexCustomer =
            customerDB.findIndex(function(c) {

                return c.customer.toLowerCase()
                    === customer.toLowerCase();

            });


        const customerBaru = {

            customer: customer,

            wa:
                document.getElementById("wa").value,

            alamat:
                document.getElementById("alamat").value

        };


        if (indexCustomer === -1) {

            customerDB.push(customerBaru);

        } else {

            customerDB[indexCustomer] =
                customerBaru;

        }


        localStorage.setItem(
            "customerDB",
            JSON.stringify(customerDB)
        );


       if (
    typeof updateDashboard ===
    "function"
) {

    await updateDashboard();

}


        alert(
            "Invoice berhasil disimpan ke Google Spreadsheet."
        );


    } catch (error) {

        console.error(
            "GAGAL SIMPAN:",
            error
        );

        alert(
            "Gagal menyimpan invoice ke Google Spreadsheet.\n\n" +
            error.message
        );

    }

}
// ======================================
// Cetak Invoice
// ======================================

function bukaCetak() {

    const invoice =
        JSON.parse(localStorage.getItem("invoiceAktif"));

    if (!invoice) {

        alert("Silakan simpan atau buka invoice terlebih dahulu.");

        return;

    }

    window.open("print.html", "_blank");

}

// ======================================
// Reset Form
// ======================================

function resetForm(){

    if(!confirm("Reset semua data?")){
        return;
    }

    // Keluar dari mode edit
    editIndex = -1;
window.invoiceGoogleID = "";

localStorage.removeItem("invoiceGoogleID");

    const btn = document.getElementById("btnSimpan");
    if(btn){
        btn.innerHTML = "💾 Simpan";
    }

    // Nomor invoice & tanggal baru
    buatNomorInvoice();

    if(typeof isiTanggalHariIni === "function"){
        isiTanggalHariIni();
    }

    // Data customer
    document.getElementById("customer").value = "";
    document.getElementById("wa").value = "";
    document.getElementById("alamat").value = "";

    // Ringkasan
    document.getElementById("ongkir").value = 0;
    document.getElementById("diskon").value = 0;
    document.getElementById("dp").value = 0;
    document.getElementById("subtotal").value = rupiah(0);
    document.getElementById("grandtotal").value = rupiah(0);

    // Hapus semua barang
    const tbody = document.getElementById("itemBody");
    tbody.innerHTML = "";

    // Tambahkan satu baris kosong
    tambahBaris();

    // Hitung ulang
    hitungInvoice();

    // Hapus invoice aktif
    localStorage.removeItem("invoiceAktif");
}

// ======================================
// Backup Data
// ======================================

function backupData(){

    const data = JSON.parse(localStorage.getItem("invoice")) || [];

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "RONA-INVOICE-BACKUP.json";

    link.click();

    URL.revokeObjectURL(link.href);

}

// ======================================
// Restore Data
// ======================================

function restoreData(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        try{

            const data = JSON.parse(event.target.result);

            localStorage.setItem(
                "invoice",
                JSON.stringify(data)
            );

            if(typeof updateDashboard === "function"){
                updateDashboard();
            }

            alert("Restore berhasil.");

        }catch(err){

            alert("File backup tidak valid.");

        }

    };

    reader.readAsText(file);

}

// ======================================
// Load Database Customer
// ======================================

function loadCustomer(){

    const list = document.getElementById("customerList");

    if(!list) return;

    list.innerHTML = "";

    const customerDB =
        JSON.parse(localStorage.getItem("customerDB")) || [];

    customerDB.forEach(function(c){

        const option = document.createElement("option");

        option.value = c.customer;

        list.appendChild(option);

    });

}

// ======================================
// Isi Data Customer
// ======================================

function isiDataCustomer(){

    const nama =
        document.getElementById("customer").value;

    const customerDB =
        JSON.parse(localStorage.getItem("customerDB")) || [];

    const data = customerDB.find(function(c){

        return c.customer.toLowerCase() === nama.toLowerCase();

    });

    if(!data){

        return;

    }

    document.getElementById("wa").value =
        data.wa;

    document.getElementById("alamat").value =
        data.alamat;

}

// ======================================
// UPDATE INVOICE KE GOOGLE
// ======================================

async function updateInvoiceGoogle(){

    try {

        const items = [];

        document
            .querySelectorAll("#itemBody tr")
            .forEach(function(row){

                const barang =
                    row.querySelector(".barang")?.value || "";

                const qty =
                    Number(
                        row.querySelector(".qty")?.value
                    ) || 0;

                const harga =
                    Number(
                        row.querySelector(".harga")?.value
                    ) || 0;

                const total =
                    qty * harga;


                if(barang !== ""){

                    items.push({

                        barang: barang,

                        qty: qty,

                        harga: harga,

                        total: total

                    });

                }

            });

console.log(
    "ID INVOICE YANG AKAN DI-UPDATE:",
    window.invoiceGoogleID
);

        const data = {

            action:
                "updateInvoiceGoogle",

            id:
                window.invoiceGoogleID || "",

            invoice:
                document.getElementById("invoice").value,

            tanggal:
                document.getElementById("tanggal").value,

            customer:
                document.getElementById("customer").value,

            wa:
                document.getElementById("wa").value,

            alamat:
                document.getElementById("alamat").value,

            subtotal:
    Number(
        document
            .getElementById("subtotal")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

ongkir:
    Number(
        document
            .getElementById("ongkir")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

diskon:
    Number(
        document
            .getElementById("diskon")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

dp:
    Number(
        document
            .getElementById("dp")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

grandtotal:
    Number(
        document
            .getElementById("grandtotal")
            .value
            .replace(/[^\d]/g, "")
    ) || 0,

            status:
                document.getElementById("status").value,

            admin:
                document.getElementById("admin")?.value || "",

            items:
                items

        };


        if(!data.id){

            alert(
                "ID invoice tidak ditemukan."
            );

            return;

        }


       const response =
    await fetch(
        GOOGLE_SCRIPT_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body:
                JSON.stringify(data)

        }
    );


        const result =
            await response.json();


if(!result.success){

    alert(
        result.message ||
        "Gagal memperbarui invoice."
    );

    return;

}

// ======================================
// UPDATE DATA AKTIF UNTUK CETAK
// ======================================

localStorage.setItem(
    "invoiceAktif",
    JSON.stringify({
        invoice: data.invoice,
        tanggal: data.tanggal,
        customer: data.customer,
        wa: data.wa,
        alamat: data.alamat,
        subtotal: data.subtotal,
        ongkir: data.ongkir,
        diskon: data.diskon,
        dp: data.dp,
        grandtotal: data.grandtotal,
        status: data.status,
        admin: data.admin,
        items: data.items
    })
);


// ======================================
// SINKRONISASI DASHBOARD
// ======================================

if (
    typeof updateDashboard ===
    "function"
) {

    await updateDashboard();

}


alert(
    "Invoice berhasil diperbarui."
);

// Refresh riwayat dari Google
if (typeof tampilRiwayat === "function") {

    await tampilRiwayat();

}

// Kembali ke mode SIMPAN
window.invoiceGoogleID = "";

localStorage.removeItem(
    "invoiceGoogleID"
);


const btn =
    document.getElementById("btnSimpan");

if(btn){

    btn.innerHTML =
        "💾 Simpan Invoice";

}

    } catch(error){

        console.error(
            "GAGAL UPDATE INVOICE:",
            error
        );

        alert(
            "Terjadi kesalahan saat update invoice."
        );

    }

}

// ======================================
// DASHBOARD DARI GOOGLE SPREADSHEET
// ======================================

async function updateDashboard() {

    try {

        const response =
            await fetch(GOOGLE_SCRIPT_URL);

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Gagal mengambil data dashboard."
            );

        }


        const data =
            result.data || [];


        // ==================================
        // TOTAL INVOICE
        // ==================================

        document.getElementById(
            "dashInvoice"
        ).innerHTML =
            data.length;


        // ==================================
        // CUSTOMER
        // ==================================

        const customers =
            new Set();

        data.forEach(function(inv) {

            if (inv.Customer) {

                customers.add(
                    String(inv.Customer)
                        .trim()
                        .toLowerCase()
                );

            }

        });


        document.getElementById(
            "dashCustomer"
        ).innerHTML =
            customers.size;


        // ==================================
        // TANGGAL HARI INI
        // ==================================

        const sekarang =
            new Date();

        const tahunHari =
            sekarang.getFullYear();

        const bulanHari =
            sekarang.getMonth();

        const tanggalHari =
            sekarang.getDate();


        let omzetHari =
            0;

        let omzetBulan =
            0;


        // ==================================
        // HITUNG OMZET
        // ==================================

        data.forEach(function(inv) {

            const tanggal =
                new Date(inv.Tanggal);


            const grand =
                Number(
                    inv["Grand Total"]
                ) || 0;


            if (isNaN(tanggal)) {

                return;

            }


            // ==============================
            // HARI INI
            // ==============================

            if (
                tanggal.getFullYear()
                    === tahunHari &&

                tanggal.getMonth()
                    === bulanHari &&

                tanggal.getDate()
                    === tanggalHari
            ) {

                omzetHari += grand;

            }


            // ==============================
            // BULAN INI
            // ==============================

            if (
                tanggal.getFullYear()
                    === tahunHari &&

                tanggal.getMonth()
                    === bulanHari
            ) {

                omzetBulan += grand;

            }

        });


        // ==================================
        // TAMPILKAN OMZET HARI
        // ==================================

        document.getElementById(
            "dashHari"
        ).innerHTML =
            rupiah(omzetHari);


        // ==================================
        // TAMPILKAN OMZET BULAN
        // ==================================

        document.getElementById(
            "dashBulan"
        ).innerHTML =
            rupiah(omzetBulan);


    } catch(error) {

        console.error(
            "GAGAL DASHBOARD:",
            error
        );

    }

}

// ======================================
// SIMPAN INVOICE KE GOOGLE
// TANPA FETCH / CORS
// ======================================

function kirimInvoiceGoogle(invoice) {

    return new Promise(function(resolve) {

        // ==================================
        // Buat iframe tersembunyi
        // ==================================

        const iframe =
            document.createElement("iframe");

        iframe.style.display = "none";

        iframe.name =
            "googleInvoiceFrame_" +
            Date.now();

        document.body.appendChild(iframe);


        // ==================================
        // Buat form
        // ==================================

        const form =
            document.createElement("form");

        form.method = "POST";

        form.action =
            GOOGLE_SCRIPT_URL;

        form.target =
            iframe.name;


        // ==================================
        // Data invoice
        // ==================================

        const input =
            document.createElement("input");

        input.type = "hidden";

        input.name = "data";

        input.value =
            JSON.stringify(invoice);

        form.appendChild(input);


        document.body.appendChild(form);


        // ==================================
        // Kirim
        // ==================================

        form.submit();


        // ==================================
        // Anggap request terkirim
        // ==================================

        setTimeout(function() {

            form.remove();
            iframe.remove();

            resolve({
                success: true
            });

        }, 2000);

    });

}

// ======================================
// BUAT DATA INVOICE DARI FORM
// ======================================

function ambilDataInvoiceForm() {

    const items = [];

    document
        .querySelectorAll("#itemBody tr")
        .forEach(function(row) {

            const barang =
                row.querySelector(".barang")?.value || "";

            const qty =
                Number(
                    row.querySelector(".qty")?.value
                ) || 0;

            const harga =
                Number(
                    row.querySelector(".harga")?.value
                ) || 0;

            if (barang.trim() !== "") {

                items.push({

                    barang: barang,

                    qty: qty,

                    harga: harga,

                    total: qty * harga

                });

            }

        });


    return {

        invoice:
            document.getElementById("invoice")?.value || "",

        tanggal:
            document.getElementById("tanggal")?.value || "",

        customer:
            document.getElementById("customer")?.value || "",

        wa:
            document.getElementById("wa")?.value || "",

        alamat:
            document.getElementById("alamat")?.value || "",

        subtotal:
            Number(
                document
                    .getElementById("subtotal")
                    ?.value
                    .replace(/[^\d]/g, "")
            ) || 0,

        ongkir:
            Number(
                document
                    .getElementById("ongkir")
                    ?.value
                    .replace(/[^\d]/g, "")
            ) || 0,

        diskon:
            Number(
                document
                    .getElementById("diskon")
                    ?.value
                    .replace(/[^\d]/g, "")
            ) || 0,

        dp:
            Number(
                document
                    .getElementById("dp")
                    ?.value
                    .replace(/[^\d]/g, "")
            ) || 0,

        grandtotal:
            Number(
                document
                    .getElementById("grandtotal")
                    ?.value
                    .replace(/[^\d]/g, "")
            ) || 0,

        status:
            document.getElementById("status")?.value ||
            "Belum Lunas",

        admin:
            document.getElementById("admin")?.value || "",

        items:
            items

    };

}


// ======================================
// BUAT GAMBAR NOTA
// ======================================

async function buatGambarNota() {

    const invoice =
        ambilDataInvoiceForm();


    // ==================================
    // CEK DATA
    // ==================================

    if (!invoice.invoice) {

        alert(
            "Nomor invoice belum tersedia."
        );

        return null;

    }


    if (!invoice.items.length) {

        alert(
            "Belum ada barang dalam invoice."
        );

        return null;

    }


    // ==================================
    // BUAT AREA NOTA
    // ==================================

    const nota =
        document.createElement("div");

    nota.style.position = "fixed";
    nota.style.left = "-99999px";
    nota.style.top = "0";
    nota.style.width = "800px";
    nota.style.background = "#ffffff";
    nota.style.padding = "40px";
    nota.style.fontFamily =
        "Arial, sans-serif";
    nota.style.color = "#000000";


    // ==================================
    // DETAIL BARANG
    // ==================================

    let barangHTML = "";


    invoice.items.forEach(
        function(item, index) {

            barangHTML += `

                <tr>

                    <td style="
                        padding:8px;
                        border:1px solid #ddd;
                    ">
                        ${index + 1}
                    </td>

                    <td style="
                        padding:8px;
                        border:1px solid #ddd;
                    ">
                        ${item.barang}
                    </td>

                    <td style="
                        padding:8px;
                        border:1px solid #ddd;
                        text-align:center;
                    ">
                        ${item.qty}
                    </td>

                    <td style="
                        padding:8px;
                        border:1px solid #ddd;
                        text-align:right;
                    ">
                        ${rupiah(item.harga)}
                    </td>

                    <td style="
                        padding:8px;
                        border:1px solid #ddd;
                        text-align:right;
                    ">
                        ${rupiah(item.total)}
                    </td>

                </tr>

            `;

        }
    );


    // ==================================
    // NOTA
    // ==================================

    nota.innerHTML = `

        <div style="
            border:2px solid #222;
            padding:30px;
        ">

            <div style="
                text-align:center;
                margin-bottom:25px;
            ">

                <h1 style="
                    margin:0;
                    font-size:32px;
                ">
                    RONA CREATION
                </h1>

                <div style="
                    margin-top:5px;
                    font-size:16px;
                ">
                    INVOICE
                </div>

            </div>


            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:20px;
                font-size:16px;
            ">

                <div>

                    <b>No. Invoice:</b>
                    ${invoice.invoice}

                    <br>

                    <b>Tanggal:</b>
                    ${invoice.tanggal}

                </div>


                <div style="
                    text-align:right;
                ">

                    <b>Status:</b>
                    ${invoice.status}

                </div>

            </div>


            <div style="
                border-top:1px solid #ddd;
                border-bottom:1px solid #ddd;
                padding:15px 0;
                margin-bottom:20px;
            ">

                <b>Customer:</b>
                ${invoice.customer}

                <br>

                <b>WhatsApp:</b>
                ${invoice.wa}

                <br>

                <b>Alamat:</b>
                ${invoice.alamat}

            </div>


            <table style="
                width:100%;
                border-collapse:collapse;
                font-size:16px;
            ">

                <thead>

                    <tr style="
                        background:#f2f2f2;
                    ">

                        <th style="
                            padding:8px;
                            border:1px solid #ddd;
                        ">
                            No
                        </th>

                        <th style="
                            padding:8px;
                            border:1px solid #ddd;
                        ">
                            Barang
                        </th>

                        <th style="
                            padding:8px;
                            border:1px solid #ddd;
                        ">
                            Qty
                        </th>

                        <th style="
                            padding:8px;
                            border:1px solid #ddd;
                        ">
                            Harga
                        </th>

                        <th style="
                            padding:8px;
                            border:1px solid #ddd;
                        ">
                            Total
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${barangHTML}

                </tbody>

            </table>


            <div style="
                margin-top:25px;
                margin-left:auto;
                width:350px;
                font-size:17px;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:5px 0;
                ">
                    <span>Subtotal</span>
                    <b>${rupiah(invoice.subtotal)}</b>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:5px 0;
                ">
                    <span>Ongkir</span>
                    <b>${rupiah(invoice.ongkir)}</b>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:5px 0;
                ">
                    <span>Diskon</span>
                    <b>${rupiah(invoice.diskon)}</b>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:5px 0;
                ">
                    <span>DP</span>
                    <b>${rupiah(invoice.dp)}</b>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:12px 0;
                    margin-top:10px;
                    border-top:2px solid #222;
                    font-size:21px;
                ">

                    <b>GRAND TOTAL</b>

                    <b>
                        ${rupiah(invoice.grandtotal)}
                    </b>

                </div>

            </div>


            <div style="
                text-align:center;
                margin-top:35px;
                font-size:14px;
                color:#666;
            ">

                Terima kasih telah mempercayakan
                pesanan Anda kepada RONA CREATION.

            </div>

        </div>

    `;


    document.body.appendChild(nota);


    // ==================================
    // CANVAS
    // ==================================

    try {

        const canvas =
            await html2canvas(
                nota,
                {
                    scale: 2,
                    backgroundColor: "#ffffff"
                }
            );


        document.body.removeChild(
            nota
        );


        return canvas.toDataURL(
            "image/png"
        );


    } catch(error) {

        document.body.removeChild(
            nota
        );

        console.error(
            "GAGAL MEMBUAT GAMBAR NOTA:",
            error
        );

        alert(
            "Gagal membuat gambar nota."
        );

        return null;

    }

}

// ======================================
// PREVIEW NOTA SESUAI print.html
// ======================================

async function previewGambarNota() {

    const gambar =
        await buatGambarDariPrint();

    if (!gambar) {
        return;
    }

    gambarNotaAktif = gambar;
    
    const overlay =
        document.createElement("div");

    overlay.id =
        "previewNotaOverlay";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background =
        "rgba(0,0,0,0.75)";
    overlay.style.zIndex = "99999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "20px";

    overlay.innerHTML = `

        <div style="
            background:#fff;
            width:min(900px,95vw);
            max-height:95vh;
            overflow:auto;
            border-radius:12px;
            padding:15px;
            box-shadow:0 5px 30px rgba(0,0,0,.3);
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:12px;
            ">

                <h4 style="margin:0;">
                    🧾 Preview Nota
                </h4>

                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    onclick="
                        document
                            .getElementById(
                                'previewNotaOverlay'
                            )
                            .remove();
                    "
                >
                    ✖ Tutup
                </button>

            </div>

            <div style="
                text-align:center;
                background:#eee;
                padding:10px;
            ">

                <img
                    src="${gambar}"
                    style="
                        width:100%;
                        max-width:794px;
                        height:auto;
                        display:block;
                        margin:auto;
                        background:white;
                        box-shadow:
                            0 2px 8px
                            rgba(0,0,0,.15);
                    "
                >

            </div>

            <div style="
                display:flex;
                justify-content:center;
                gap:10px;
                flex-wrap:wrap;
                margin-top:15px;
            ">

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="downloadGambarNota();"
                >
                    💾 Simpan Gambar
                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    onclick="bagikanNotaWhatsApp();"
                >
                    📱 Bagikan WhatsApp
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(
        overlay
    );

}

// ======================================
// TOMBOL PREVIEW NOTA
// ======================================

document
    .getElementById("btnWhatsApp")
    ?.addEventListener(
        "click",
        previewGambarNota
    );

    // ======================================
// BUAT GAMBAR DARI DESAIN PRINT.HTML
// ======================================

async function buatGambarDariPrint() {

    const invoice =
        ambilDataInvoiceForm();

    if (!invoice.invoice) {

        alert("Nomor invoice belum tersedia.");

        return null;

    }

    // Simpan data sementara
    localStorage.setItem(
        "invoiceAktif",
        JSON.stringify(invoice)
    );

    // Buat iframe tersembunyi
    const iframe =
        document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "794px";
    iframe.style.height = "1123px";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    try {

        iframe.src = "print.html";

        // Tunggu print.html selesai dimuat
        await new Promise(function(resolve) {

            iframe.onload = resolve;

        });

        // Tunggu print.js mengisi data
        await new Promise(function(resolve) {

            setTimeout(resolve, 1000);

        });


        const iframeDocument =
            iframe.contentDocument ||
            iframe.contentWindow.document;


        const nota =
            iframeDocument.querySelector(
                ".invoice"
            );


        if (!nota) {

            throw new Error(
                "Elemen .invoice tidak ditemukan."
            );

        }


        // Tunggu gambar/logo selesai
        const images =
            iframeDocument.images;


        await Promise.all(
            Array.from(images).map(
                function(img) {

                    if (img.complete) {

                        return Promise.resolve();

                    }

                    return new Promise(
                        function(resolve) {

                            img.onload =
                                resolve;

                            img.onerror =
                                resolve;

                        }
                    );

                }
            )
        );


        // Buat gambar
        const canvas =
            await html2canvas(
                nota,
                {

                    scale: 2,

                    backgroundColor:
                        "#ffffff",

                    useCORS: true,

                    allowTaint: false

                }
            );


        document.body.removeChild(
            iframe
        );


        return canvas.toDataURL(
            "image/png"
        );


    } catch(error) {

        console.error(
            "GAGAL MEMBUAT GAMBAR PRINT:",
            error
        );


        if (iframe.parentNode) {

            iframe.parentNode.removeChild(
                iframe
            );

        }


        alert(
            "Gagal membuat gambar dari nota."
        );


        return null;

    }

}

// ======================================
// DOWNLOAD GAMBAR NOTA
// ======================================

function downloadGambarNota() {

    if (!gambarNotaAktif) {

        alert(
            "Gambar nota belum tersedia."
        );

        return;

    }

    const invoice =
        document
            .getElementById("invoice")
            ?.value ||
        "invoice";

    const link =
        document.createElement("a");

    link.href =
        gambarNotaAktif;

    link.download =
        invoice + ".png";

    link.style.display =
        "none";

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

}

// ======================================
// BAGIKAN NOTA KE WHATSAPP
// ======================================

function bagikanNotaWhatsApp() {

    const wa =
        document
            .getElementById("wa")
            ?.value
            .trim();

    if (!wa) {

        alert(
            "Nomor WhatsApp customer belum diisi."
        );

        return;

    }


    // Bersihkan nomor
    let nomor =
        wa.replace(/\D/g, "");


    // 08xxxxxxxx → 628xxxxxxxx
    if (nomor.startsWith("0")) {

        nomor =
            "62" + nomor.substring(1);

    }


    const customer =
        document
            .getElementById("customer")
            ?.value ||
        "";


    const invoice =
        document
            .getElementById("invoice")
            ?.value ||
        "";


    const grandtotal =
        document
            .getElementById("grandtotal")
            ?.value ||
        "";


    const pesan =
`Halo ${customer},

Berikut invoice dari RONA CREATION.

No. Invoice: ${invoice}
Grand Total: ${grandtotal}

Terima kasih telah mempercayakan kebutuhan Anda kepada RONA CREATION. 🙏`;


    const url =
        "https://web.whatsapp.com/send?phone=" +
        nomor +
        "&text=" +
        encodeURIComponent(pesan);


    window.open(
        url,
        "_blank"
    );

}
