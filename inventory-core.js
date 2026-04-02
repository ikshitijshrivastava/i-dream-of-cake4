// ============================
// INVENTORY MASTER ENGINE
// ============================

let INV_DB = JSON.parse(localStorage.getItem("INV_DB") || "[]");

// Warehouses
let WAREHOUSES = ["Main Kitchen", "Store", "Warehouse"];

// Save DB
function invSave() {
  localStorage.setItem("INV_DB", JSON.stringify(INV_DB));
}

// ============================
// ADD STOCK (PURCHASE / MANUAL)
// ============================
function invAddStock(data) {
  INV_DB.push({
    id: Date.now(),
    item: data.item,
    qty: Number(data.qty),
    warehouse: data.warehouse,
    batch: data.batch || "",
    expiry: data.expiry || "",
    type: data.type || "purchase",
    ref: data.ref || "",
    date: new Date().toISOString()
  });
  invSave();
}

// ============================
// SALES DEDUCTION (AUTO)
// ============================
function invConsume(itemName, qty = 1) {
  INV_DB.push({
    id: Date.now(),
    item: itemName,
    qty: -Math.abs(qty),
    warehouse: "Main Kitchen",
    type: "sale",
    date: new Date().toISOString()
  });
  invSave();
}

// ============================
// DAMAGE / RETURN / CLAIM
// ============================
function invAdjust(type, item, qty, note) {
  INV_DB.push({
    id: Date.now(),
    item,
    qty: type === "return" ? qty : -Math.abs(qty),
    warehouse: "Main Kitchen",
    type,
    ref: note,
    date: new Date().toISOString()
  });
  invSave();
}

// ============================
// CURRENT STOCK
// ============================
function invGetStock(item) {
  return INV_DB
    .filter(x => x.item === item)
    .reduce((sum, x) => sum + x.qty, 0);
}

// ============================
// RECONCILIATION
// ============================
function invReconcile(item, physicalQty, ref) {
  let systemQty = invGetStock(item);
  let diff = physicalQty - systemQty;

  INV_DB.push({
    id: Date.now(),
    item,
    qty: diff,
    type: "reconcile",
    ref,
    date: new Date().toISOString()
  });

  invSave();

  return {
    systemQty,
    physicalQty,
    diff
  };
}

// ============================
// REPLENISHMENT SUGGESTION
// ============================
function invSuggest(item) {
  let lastSales = INV_DB
    .filter(x => x.item === item && x.type === "sale")
    .slice(-10);

  let avg = lastSales.reduce((s, x) => s + Math.abs(x.qty), 0) / (lastSales.length || 1);

  let current = invGetStock(item);

  return {
    current,
    suggestion: Math.max(0, Math.ceil(avg * 5 - current))
  };
}

// ============================
// CSV EXPORT
// ============================
function invExportCSV() {
  let csv = "Item,Qty,Warehouse,Batch,Expiry,Type,Ref,Date\n";

  INV_DB.forEach(x => {
    csv += `${x.item},${x.qty},${x.warehouse},${x.batch},${x.expiry},${x.type},${x.ref},${x.date}\n`;
  });

  downloadFile(csv, "inventory.csv");
}

// ============================
// CSV IMPORT
// ============================
function invImportCSV(text) {
  let rows = text.split("\n").slice(1);

  rows.forEach(r => {
    let [item, qty, warehouse, batch, expiry] = r.split(",");

    if (item) {
      invAddStock({ item, qty, warehouse, batch, expiry });
    }
  });
}

// ============================
// DOWNLOAD HELPER
// ============================
function downloadFile(content, filename) {
  let blob = new Blob([content]);
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
                        }
