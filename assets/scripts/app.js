// ---------- STATE ---------- //
const STORAGE_KEY = "equipmentTracker_v1";
let equipmentList = loadFromStorage();

// ---------- ELEMENTS ---------- //
const form = document.getElementById("equipment-form");
const nameInput = document.getElementById("name");
const siteInput = document.getElementById("site");
const rateInput = document.getElementById("rate");
const startDateInput = document.getElementById("start-date");

const activeListEl = document.getElementById("active-list");
const archivedListEl = document.getElementById("archived-list");

const totalActiveEl = document.getElementById("total-active");
const totalArchivedEl = document.getElementById("total-archived");

// ---------- INIT ---------- //
setDefaultStartDate();
render();

// ---------- EVENTS ---------- //
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addEquipmentFromForm();
});


// FUNCTIONS //


function setDefaultStartDate() {
  // sets the date input to today if it is empty
  if (!startDateInput.value) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    startDateInput.value = today;
  }
}

function addEquipmentFromForm() {
  const name = nameInput.value.trim();
  const site = siteInput.value.trim();
  const rate = Number(rateInput.value);
  const startDate = startDateInput.value;

  if (!name || !site || !rate || !startDate) return;

  const newItem = createEquipment(name, site, rate, startDate);

  equipmentList.push(newItem);
  saveToStorage(equipmentList);

  form.reset();
  setDefaultStartDate();
  render();
}

function createEquipment(name, site, rate, startDate) {
  return {
    id: generateId(),
    name,
    site,
    rate,
    startDate,
    isArchived: false,
    archivedDate: null
  };
}

function generateId() {
  // simple unique id
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function render() {
  activeListEl.innerHTML = "";
  archivedListEl.innerHTML = "";

  const activeItems = equipmentList.filter(item => !item.isArchived);
  const archivedItems = equipmentList.filter(item => item.isArchived);

  renderGroupedBySite(activeItems, activeListEl, "active");
  renderGroupedBySite(archivedItems, archivedListEl, "archived");

  // totals
  totalActiveEl.textContent = calcTotal(activeItems).toFixed(2);
  totalArchivedEl.textContent = calcTotal(archivedItems).toFixed(2);
}

function renderGroupedBySite(items, containerEl, mode) {
  const groups = groupBySite(items);

  // if empty
  const sites = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  if (sites.length === 0) {
    containerEl.innerHTML = "<li class='meta'>No items</li>";
    return;
  }

  sites.forEach(siteName => {
    // Site heading
    const siteHeader = document.createElement("li");
    siteHeader.innerHTML = `<h3>${escapeHtml(siteName)}</h3>`;
    containerEl.appendChild(siteHeader);

    // Items under site
    groups[siteName].forEach(item => {
      const li = document.createElement("li");

      if (mode === "active") {
        li.innerHTML = `
          <strong>${escapeHtml(item.name)}</strong>
          <span class="meta">£${item.rate}/day since ${item.startDate}</span>
          <button data-action="archive" data-id="${item.id}">Archive</button>
          <button data-action="delete" data-id="${item.id}">Delete</button>
        `;
      } else {
        li.innerHTML = `
          <strong>${escapeHtml(item.name)}</strong>
          <span class="meta">Archived ${item.archivedDate || ""}</span>
          <button data-action="restore" data-id="${item.id}">Restore</button>
          <button data-action="delete" data-id="${item.id}">Delete</button>
        `;
      }

      containerEl.appendChild(li);
    });
  });

  // Keep your event delegation
  containerEl.onclick = handleListClick;
}

function groupBySite(items) {
  return items.reduce((acc, item) => {
    const site = item.site?.trim() || "Unknown site";
    if (!acc[site]) acc[site] = [];
    acc[site].push(item);
    return acc;
  }, {});
}

  // render archived
  archivedItems.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong>
      <span class="meta">(${escapeHtml(item.site)}) archived ${item.archivedDate || ""}</span>
      <button data-action="restore" data-id="${item.id}">Restore</button>
      <button data-action="delete" data-id="${item.id}">Delete</button>
    `;
    archivedListEl.appendChild(li);
  });

  // button handlers (event delegation)
  activeListEl.onclick = handleListClick;
  archivedListEl.onclick = handleListClick;

  // totals
  totalActiveEl.textContent = calcTotal(activeItems).toFixed(2);
  totalArchivedEl.textContent = calcTotal(archivedItems).toFixed(2);


function handleListClick(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "archive") archiveEquipment(id);
  if (action === "restore") restoreEquipment(id);
  if (action === "delete") deleteEquipment(id);
}

function archiveEquipment(id) {
  const item = equipmentList.find(x => x.id === id);
  if (!item) return;

  item.isArchived = true;
  item.archivedDate = new Date().toISOString().slice(0, 10);

  saveToStorage(equipmentList);
  render();
}

function restoreEquipment(id) {
  const item = equipmentList.find(x => x.id === id);
  if (!item) return;

  item.isArchived = false;
  item.archivedDate = null;

  saveToStorage(equipmentList);
  render();
}

function deleteEquipment(id) {
  equipmentList = equipmentList.filter(x => x.id !== id);
  saveToStorage(equipmentList);
  render();
}

function calcTotal(list) {
  // simple total: rate * days since start
  return list.reduce((sum, item) => sum + calcHireCost(item.rate, item.startDate), 0);
}

function calcHireCost(rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();

  // milliseconds to days
  const diffMs = today - start;
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return rate * days;
}

// ---------- STORAGE ----------
function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// ---------- SAFETY ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- EXPORTS FOR JEST ----------
if (typeof module !== "undefined") {
  module.exports = {
    createEquipment,
    calcHireCost,
    calcTotal,
    generateId,
    loadFromStorage,
    saveToStorage
  };
}