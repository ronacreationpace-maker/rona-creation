// ======================================
// RONA CREATION
// invoice.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    buatNomorInvoice();

    isiTanggal();

    tambahBaris();

    document
        .getElementById("btnTambah")
        .addEventListener("click", tambahBaris);

});


// ======================================
// Nomor Invoice
// ======================================

function buatNomorInvoice(){

    const now = new Date();

    const y =
        now.getFullYear();

    const m =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const d =
        String(now.getDate())
            .padStart(2, "0");

    const h =
        String(now.getHours())
            .padStart(2, "0");

    const i =
        String(now.getMinutes())
            .padStart(2, "0");

    const s =
        String(now.getSeconds())
            .padStart(2, "0");


    document.getElementById("invoice").value =
        `RC-${y}${m}${d}-${h}${i}${s}`;

}

// ======================================
// Tanggal Hari Ini
// ======================================

function isiTanggal(){

    const now = new Date();

    now.setMinutes(
        now.getMinutes()-
        now.getTimezoneOffset()
    );

    document.getElementById("tanggal").value =
    now.toISOString().slice(0,10);

}


// ======================================
// Tambah Baris
// ======================================

function tambahBaris(){

    const tbody =
    document.getElementById("itemBody");

    const nomor =
    tbody.rows.length+1;

    const row =
    tbody.insertRow();

    row.innerHTML = `

<td class="text-center">
${nomor}
</td>

<td>
<input
type="text"
class="form-control barang"
placeholder="Nama Barang">
</td>

<td>
<input
type="number"
class="form-control qty"
value="1"
min="1"
oninput="hitungInvoice()">
</td>

<td>
<input
type="number"
class="form-control harga"
value="0"
min="0"
oninput="hitungInvoice()">
</td>

<td>
<input
type="text"
class="form-control total text-end"
value="Rp0"
readonly>
</td>

<td class="text-center">

<button
class="btn btn-danger btn-sm"
onclick="hapusBaris(this)">

🗑

</button>

</td>

`;

    hitungInvoice();

}


// ======================================
// Hapus Baris
// ======================================

function hapusBaris(btn){

    btn.closest("tr").remove();

    nomorUlang();

    hitungInvoice();

}


// ======================================
// Nomor Ulang
// ======================================

function nomorUlang(){

    document
    .querySelectorAll("#itemBody tr")
    .forEach((row,index)=>{

        row.cells[0].innerHTML =
        index+1;

    });

}