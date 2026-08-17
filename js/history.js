// ======================================
// RONA CREATION
// history.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("btnHistory")
        .addEventListener("click", tampilRiwayat);

    const searchInvoice =
        document.getElementById("searchInvoice");

    if (searchInvoice) {

        searchInvoice.addEventListener("input", function () {

            tampilRiwayat();

        });

    }

});

// ======================================
// Tampilkan Riwayat
// ======================================

// ======================================
// Tampilkan Riwayat
// ======================================

// ======================================
// Tampilkan Riwayat dari Google
// ======================================

async function tampilRiwayat(){

    const data =
        await ambilRiwayatGoogle();

    const searchElement =
        document.getElementById("searchInvoice");

    const keyword =
        searchElement
            ? searchElement.value.toLowerCase()
            : "";

    let html = "";

    [...data].reverse().forEach(function(inv){

        const invoice =
            String(inv.Invoice || "");

        const customer =
            String(inv.Customer || "");

        if(
            keyword !== "" &&
            !invoice.toLowerCase().includes(keyword) &&
            !customer.toLowerCase().includes(keyword)
        ){
            return;
        }

        html += `

        <tr>

            <td>${invoice}</td>

            <td>
                ${formatTanggalGoogle(inv.Tanggal)}
            </td>

            <td>
                ${customer}
            </td>

            <td>
                ${inv.Status || "-"}
            </td>

            <td class="text-end">
                ${rupiah(
                    Number(inv["Grand Total"]) || 0
                )}
            </td>

            <td class="text-center">

<td class="text-center">

<td class="text-center">

    <button
        class="btn btn-sm btn-info"
        title="Lihat"
        onclick="bukaInvoiceGoogle('${inv.ID}')">

        👁

    </button>

    <button
        class="btn btn-sm btn-success"
        title="Cetak"
        onclick="cetakInvoiceGoogle('${inv.ID}')">

        🖨

    </button>

    <button
        class="btn btn-sm btn-danger"
        title="Hapus"
        onclick="hapusInvoiceGoogle('${inv.ID}')">

        🗑

    </button>

</td>

    <button
        class="btn btn-sm btn-info"
        title="Lihat"
        onclick="bukaInvoiceGoogle('${inv.ID}')">

        👁

    </button>

    <button
        class="btn btn-sm btn-success"
        title="Cetak"
        onclick="cetakInvoiceGoogle('${inv.ID}')">

        🖨

    </button>

</td>

            </td>

        </tr>

        `;

    });


    if(html === ""){

        html = `

        <tr>

            <td
                colspan="6"
                class="text-center text-muted">

                Tidak ada data.

            </td>

        </tr>

        `;

    }


    document.getElementById(
        "historyBody"
    ).innerHTML = html;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "historyModal"
            )
        );

    modal.show();

}


// ======================================
// Format Tanggal Google
// ======================================

function formatTanggalGoogle(tanggal){

    if(!tanggal){
        return "-";
    }

    const d = new Date(tanggal);

    if(isNaN(d)){
        return tanggal;
    }

    return d.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}

// ======================================
// Buka Invoice dari Google Spreadsheet
// ======================================

async function bukaInvoiceGoogle(id){

    const data =
        await ambilRiwayatGoogle();

    const inv =
        data.find(function(item){

            return String(item.ID) === String(id);

        });


   if(!inv){

    alert("Invoice tidak ditemukan.");

    return;
}

window.invoiceGoogleID = inv.ID;

localStorage.setItem(
    "invoiceGoogleID",
    inv.ID
);

    


    // ======================================
    // Isi Data Invoice
    // ======================================

    document.getElementById("invoice").value =
        inv.Invoice || "";

    document.getElementById("tanggal").value =
        formatTanggalInput(inv.Tanggal);

    document.getElementById("customer").value =
        inv.Customer || "";

    document.getElementById("wa").value =
        inv.WA || "";

    document.getElementById("alamat").value =
        inv.Alamat || "";

    document.getElementById("status").value =
        inv.Status || "Belum Lunas";

    document.getElementById("ongkir").value =
        Number(inv.Ongkir) || 0;

    document.getElementById("diskon").value =
        Number(inv.Diskon) || 0;

    document.getElementById("dp").value =
        Number(inv.DP) || 0;


    // ======================================
    // Isi Barang
    // ======================================

    const tbody =
        document.getElementById("itemBody");

    tbody.innerHTML = "";


    if(inv.items && inv.items.length > 0){

        inv.items.forEach(function(item){

            tambahBaris();

            const row =
                tbody.rows[
                    tbody.rows.length - 1
                ];


            row.querySelector(".barang").value =
                item.barang || "";

            row.querySelector(".qty").value =
                Number(item.qty) || 0;

            row.querySelector(".harga").value =
                Number(item.harga) || 0;

        });

    } else {

        tambahBaris();

    }


    // ======================================
    // Hitung Ulang
    // ======================================

    hitungInvoice();


    // ======================================
// Tutup Modal
// ======================================

const modalElement =
    document.getElementById("historyModal");

const modal =
    bootstrap.Modal.getInstance(
        modalElement
    );

if(modal){

    modal.hide();

}


// ======================================
// Ubah Tombol Simpan Menjadi Update
// ======================================

const btnSimpan =
    document.getElementById("btnSimpan");

if(btnSimpan){

    btnSimpan.innerHTML =
        "💾 Update Invoice";

}
}

// ======================================
// Format Tanggal untuk Input
// ======================================

function formatTanggalInput(tanggal){

    if(!tanggal){
        return "";
    }

    const d =
        new Date(tanggal);

    if(isNaN(d)){
        return tanggal;
    }

    const tahun =
        d.getFullYear();

    const bulan =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const hari =
        String(
            d.getDate()
        ).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;

}

// ======================================
// Buka Invoice
// ======================================

function bukaInvoice(index){

    const data =
        JSON.parse(localStorage.getItem("invoice")) || [];

    const inv = data[index];

    localStorage.setItem(
    "invoiceAktif",
    JSON.stringify(inv)
);

editIndex = index;

    document.getElementById("invoice").value = inv.invoice;
    document.getElementById("tanggal").value = inv.tanggal;
    document.getElementById("customer").value = inv.customer;
    document.getElementById("wa").value = inv.wa;
    document.getElementById("alamat").value = inv.alamat;
    document.getElementById("status").value =
    inv.status || "Belum Lunas";
    
    document.getElementById("ongkir").value = inv.ongkir;
    document.getElementById("diskon").value = inv.diskon;
    document.getElementById("dp").value = inv.dp;
    
    const tbody =
        document.getElementById("itemBody");

    tbody.innerHTML = "";

    inv.items.forEach(item=>{

        tambahBaris();

        const row =
            tbody.rows[tbody.rows.length-1];

        row.querySelector(".barang").value =
            item.barang;

        row.querySelector(".qty").value =
            item.qty;

        row.querySelector(".harga").value =
            item.harga;

    });

    // Hitung ulang total
hitungInvoice();

// Tutup modal
bootstrap.Modal.getInstance(
    document.getElementById("historyModal")
).hide();

// Ubah tombol menjadi Update
document.getElementById("btnSimpan").innerHTML =
"💾 Update Invoice";

}

// ======================================
// Hapus Invoice
// ======================================

function hapusInvoice(index){

    if(!confirm("Yakin ingin menghapus invoice ini?")){

        return;

    }

    let data =
        JSON.parse(localStorage.getItem("invoice")) || [];

    data.splice(index,1);

localStorage.setItem(
    "invoice",
    JSON.stringify(data)
);

if (typeof updateDashboard === "function") {
    updateDashboard();
}

tampilRiwayat();

}

// ======================================
// Cetak Invoice dari Google Spreadsheet
// ======================================

async function cetakInvoiceGoogle(id){

    const data =
        await ambilRiwayatGoogle();

    const inv =
        data.find(function(item){

            return String(item.ID) === String(id);

        });


    if(!inv){

        alert("Invoice tidak ditemukan.");

        return;

    }


    // Simpan invoice yang akan dicetak
    localStorage.setItem(
        "invoiceAktif",
        JSON.stringify({

            invoice:
                inv.Invoice || "",

            tanggal:
                formatTanggalInput(inv.Tanggal),

            customer:
                inv.Customer || "",

            wa:
                inv.WA || "",

            alamat:
                inv.Alamat || "",

            subtotal:
                Number(inv.Subtotal) || 0,

            ongkir:
                Number(inv.Ongkir) || 0,

            diskon:
                Number(inv.Diskon) || 0,

            dp:
                Number(inv.DP) || 0,

            grandtotal:
                Number(inv["Grand Total"]) || 0,

            status:
                inv.Status || "Belum Lunas",

            admin:
                inv.Admin || "",

            items:
                inv.items || []

        })
    );


    window.open(
        "print.html",
        "_blank"
    );

}

// ======================================
// Hapus Invoice dari Google Spreadsheet
// ======================================

async function hapusInvoiceGoogle(id){

    if(
        !confirm(
            "Yakin ingin menghapus invoice ini?"
        )
    ){

        return;

    }


    try {

        const response = await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",

                body: JSON.stringify({

                    action:
                        "hapusInvoiceGoogle",

                    id: id

                })

            }
        );


        const result =
            await response.json();


        if(!result.success){

            alert(
                result.message ||
                "Gagal menghapus invoice."
            );

            return;

        }


alert(
    "Invoice berhasil dihapus."
);


// ======================================
// HAPUS INVOICE AKTIF
// ======================================

localStorage.removeItem(
    "invoiceAktif"
);


// ======================================
// REFRESH RIWAYAT
// ======================================

tampilRiwayat();



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
// REFRESH RIWAYAT
// ======================================

await tampilRiwayat();


    } catch(error){

        console.error(
            "GAGAL HAPUS INVOICE:",
            error
        );

        alert(
            "Terjadi kesalahan saat menghapus invoice."
        );

    }

}
// ======================================
// Ambil Riwayat dari Google Spreadsheet
// ======================================

async function ambilRiwayatGoogle() {

    try {

        const response =
            await fetch(GOOGLE_SCRIPT_URL);

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Gagal mengambil data."
            );

        }

        console.log(
            "Data Google Spreadsheet:",
            result.data
        );

        return result.data;

    } catch (error) {

        console.error(
            "GAGAL AMBIL DATA:",
            error
        );

        alert(
            "Gagal mengambil data dari Google Spreadsheet."
        );

        return [];

    }

}
