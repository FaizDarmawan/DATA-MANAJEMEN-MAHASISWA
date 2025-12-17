// ┌──────────────────────────────┐
// │ Kelas Mahasiswa (OOP + Enkapsulasi)
// └──────────────────────────────┘
class Mahasiswa {
  constructor(nim, nama, jurusan) {
    this.nim = nim;
    this.nama = nama;
    this.jurusan = jurusan;
  }

  // Validasi menggunakan Regex
  static isValidNIM(nim) {
    const regex = /^\d{9,12}$/; // NIM: 9–12 digit angka
    return regex.test(nim);
  }

  static isValidNama(nama) {
    const regex = /^[A-Za-z\s]{2,50}$/; // Hanya huruf & spasi, panjang 2–50
    return regex.test(nama.trim());
  }

  static isValidJurusan(jurusan) {
    return jurusan.trim().length >= 2 && jurusan.trim().length <= 50;
  }

  // Method untuk validasi lengkap
  static validate(nim, nama, jurusan) {
    if (!this.isValidNIM(nim)) throw new Error("NIM harus 9–12 digit angka.");
    if (!this.isValidNama(nama)) throw new Error("Nama tidak valid.");
    if (!this.isValidJurusan(jurusan)) throw new Error("Jurusan tidak valid.");
  }
}

// ┌──────────────────────────────┐
// │ Kelas Manajemen Data (Polimorfisme & Pewarisan tidak eksplisit,
// │   tapi modular dan reusable)
// └──────────────────────────────┘
class ManajemenMahasiswa {
  constructor() {
    this.data = [];
    this.loadData();
  }

  // ─── FILE I/O SIMULASI ──────────────────────
  loadData() {
    try {
      const saved = localStorage.getItem("mahasiswa_data");
      this.data = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.showMessage("Gagal memuat data dari penyimpanan.", "error");
      this.data = [];
    }
  }

  saveData() {
    try {
      localStorage.setItem("mahasiswa_data", JSON.stringify(this.data));
    } catch (e) {
      this.showMessage("Gagal menyimpan data.", "error");
    }
  }

  // ─── OPERASI DASAR ──────────────────────────
  tambah(mhs) {
    if (this.data.some((m) => m.nim === mhs.nim)) {
      throw new Error("NIM sudah terdaftar.");
    }
    this.data.push(mhs);
    this.saveData();
  }

  edit(index, mhs) {
    if (index < 0 || index >= this.data.length)
      throw new Error("Indeks tidak valid.");
    // Pastikan NIM tidak bentrok dengan mahasiswa lain (kecuali diri sendiri)
    const exists = this.data.some((m, i) => m.nim === mhs.nim && i !== index);
    if (exists) throw new Error("NIM sudah digunakan oleh mahasiswa lain.");
    this.data[index] = mhs;
    this.saveData();
  }

  hapus(index) {
    if (index < 0 || index >= this.data.length)
      throw new Error("Indeks tidak valid.");
    this.data.splice(index, 1);
    this.saveData();
  }

  // ─── SEARCHING ──────────────────────────────
  // Time Complexity: O(n)
  linearSearch(query) {
    query = query.toLowerCase();
    return this.data.filter(
      (m) => m.nim.includes(query) || m.nama.toLowerCase().includes(query)
    );
  }

  // Time Complexity: O(log n) — hanya berlaku jika data terurut berdasarkan NIM
  binarySearch(nim) {
    let low = 0,
      high = this.data.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midNim = this.data[mid].nim;
      if (midNim === nim) return mid;
      if (midNim < nim) low = mid + 1;
      else high = mid - 1;
    }
    return -1;
  }

  // ─── SORTING ────────────────────────────────
  // Bubble Sort — O(n²)
  bubbleSort() {
    const arr = [...this.data];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j].nim > arr[j + 1].nim) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    this.data = arr;
    this.saveData();
  }

  // Merge Sort — O(n log n)
  mergeSort() {
    const merge = (left, right) => {
      const result = [];
      let i = 0,
        j = 0;
      while (i < left.length && j < right.length) {
        if (left[i].nim <= right[j].nim) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
      return result.concat(left.slice(i), right.slice(j));
    };

    const sort = (arr) => {
      if (arr.length <= 1) return arr;
      const mid = Math.floor(arr.length / 2);
      const left = sort(arr.slice(0, mid));
      const right = sort(arr.slice(mid));
      return merge(left, right);
    };

    this.data = sort(this.data);
    this.saveData();
  }

  // ─── UTILITAS ───────────────────────────────
  eksporKeFile() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_mahasiswa.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  imporDariFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) throw new Error("Format tidak valid.");
          // Validasi setiap entri
          imported.forEach((m) => {
            Mahasiswa.validate(m.nim, m.nama, m.jurusan);
          });
          this.data = imported;
          this.saveData();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca file."));
      reader.readAsText(file);
    });
  }

  renderTable(data = this.data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach((mhs, index) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${mhs.nim}</td>
        <td>${mhs.nama}</td>
        <td>${mhs.jurusan}</td>
        <td>
          <button class="edit" data-index="${index}">Edit</button>
          <button class="delete" data-index="${index}">Hapus</button>
        </td>
      `;
    });
  }

  showMessage(text, type = "success") {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = `notification ${type} show`;
    setTimeout(() => {
      msg.classList.remove("show");
    }, 5000);
  }
}

// ┌──────────────────────────────┐
// │ MAIN APP
// └──────────────────────────────┘
const app = new ManajemenMahasiswa();
app.renderTable();

// ─── EVENT LISTENERS ─────────────────────────
document.getElementById("formMahasiswa").addEventListener("submit", (e) => {
  e.preventDefault();
  const nim = document.getElementById("nim").value.trim();
  const nama = document.getElementById("nama").value.trim();
  const jurusan = document.getElementById("jurusan").value.trim();
  const editIndex = parseInt(document.getElementById("editIndex").value);

  try {
    Mahasiswa.validate(nim, nama, jurusan);
    const mhs = new Mahasiswa(nim, nama, jurusan);

    if (editIndex === -1) {
      app.tambah(mhs);
      app.showMessage("Data mahasiswa berhasil ditambahkan.");
    } else {
      app.edit(editIndex, mhs);
      app.showMessage("Data mahasiswa berhasil diupdate.");
      document.getElementById("editIndex").value = "-1";
      document.querySelector(
        "#formMahasiswa button[type='submit']"
      ).textContent = "Simpan";
    }

    app.renderTable();
    document.getElementById("formMahasiswa").reset();
  } catch (err) {
    app.showMessage(err.message, "error");
  }
});

document.getElementById("btnReset").addEventListener("click", () => {
  document.getElementById("formMahasiswa").reset();
  document.getElementById("editIndex").value = "-1";
  document.querySelector("#formMahasiswa button[type='submit']").textContent =
    "Simpan";
});

document.getElementById("tableBody").addEventListener("click", (e) => {
  if (e.target.classList.contains("edit")) {
    const index = e.target.dataset.index;
    const mhs = app.data[index];
    document.getElementById("nim").value = mhs.nim;
    document.getElementById("nama").value = mhs.nama;
    document.getElementById("jurusan").value = mhs.jurusan;
    document.getElementById("editIndex").value = index;
    document.querySelector("#formMahasiswa button[type='submit']").textContent =
      "Update";
  }
  if (e.target.classList.contains("delete")) {
    if (confirm("Hapus data mahasiswa ini?")) {
      try {
        app.hapus(e.target.dataset.index);
        app.renderTable();
        app.showMessage("Data berhasil dihapus.");
      } catch (err) {
        app.showMessage(err.message, "error");
      }
    }
  }
});

// Sorting
document.getElementById("btnSortBubble").addEventListener("click", () => {
  app.bubbleSort();
  app.renderTable();
  app.showMessage("Data diurutkan (Bubble Sort).");
});

document.getElementById("btnSortMerge").addEventListener("click", () => {
  app.mergeSort();
  app.renderTable();
  app.showMessage("Data diurutkan (Merge Sort).");
});

// Searching
document.getElementById("btnSearchLinear").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return app.renderTable();
  const hasil = app.linearSearch(query);
  app.renderTable(hasil);
});

document.getElementById("btnSearchBinary").addEventListener("click", () => {
  const nim = document.getElementById("searchInput").value.trim();
  if (!nim)
    return app.showMessage("Masukkan NIM untuk pencarian binary.", "error");
  const idx = app.binarySearch(nim);
  if (idx !== -1) {
    app.renderTable([app.data[idx]]);
  } else {
    app.showMessage(
      "Mahasiswa tidak ditemukan (pastikan data terurut).",
      "error"
    );
    app.renderTable([]);
  }
});

// File I/O
document.getElementById("btnExport").addEventListener("click", () => {
  app.eksporKeFile();
});

document.getElementById("btnImport").addEventListener("click", async () => {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return app.showMessage("Pilih file terlebih dahulu.", "error");

  try {
    await app.imporDariFile(file);
    app.renderTable();
    app.showMessage("Data berhasil diimpor.");
    fileInput.value = "";
  } catch (err) {
    app.showMessage("Impor gagal: " + err.message, "error");
  }
});

// ─── BEST PRACTICES ──────────────────────────
// - Penamaan variabel jelas (camelCase)
// - Modularisasi: class terpisah, fungsi fokus
// - Komentar menjelaskan kompleksitas & logika
// - Error handling menyeluruh
// - Tidak ada global variable berlebihan
