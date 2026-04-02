function renderInventoryUI() {
  let el = document.getElementById("inventoryList");

  let items = [...new Set(INV_DB.map(x => x.item))];

  el.innerHTML = items.map(item => {
    let stock = invGetStock(item);
    let sug = invSuggest(item);

    return `
      <div class="exp-card">
        <div>
          <b>${item}</b><br>
          Stock: ${stock}<br>
          Suggest: ${sug.suggestion}
        </div>
        <button onclick="quickAdd('${item}')">+Stock</button>
      </div>
    `;
  }).join("");
}

function quickAdd(item) {
  let qty = prompt("Qty?");
  invAddStock({ item, qty, warehouse: "Main Kitchen" });
  renderInventoryUI();
}
