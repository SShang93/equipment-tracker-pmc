// State //
const STORAGE_KEY = "equipmentTracker_v1";
let equipmentList = [];

// Targetted Elements //
const form = document.getElementById("equipment-form");
const nameInput = document.getElementById("name");
const siteInput = document.getElementById("site");
const rateInput = document.getElementById("rate");
const startDateInput = document.getElementById("start-date");

const activeListEl = document.getElementById("active-list");
const archivedListEl = document.getElementById("archived-list");

const totalActiveEl = document.getElementById("total-active");
const totalArchivedEl = document.getElementById("total-archived");

// Dependencies for testing //
const deps = {
  createEquipment,
  saveToStorage,
  setDefaultStartDate,
  render,
  calcHireCost,
};

// initialization //
function init() {
  // Prevent crashes if DOM not present (e.g. during Jest tests)
  if (
    !form ||
    !startDateInput ||
    !activeListEl ||
    !archivedListEl ||
    !totalActiveEl ||
    !totalArchivedEl
  ) {
    return;
  }

  equipmentList = loadFromStorage();
  setDefaultStartDate();
  render();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addEquipmentFromForm();
  });
}

// Only auto-run in browser // (allows functions to be imported for testing without side effects)
if (typeof window !== "undefined") {
  init();
}

// Export for Jest // (in browser, this will be ignored since module is undefined)
if (typeof module !== "undefined") {
  module.exports = {
    setDefaultStartDate,
    addEquipmentFromForm,
    createEquipment,
    generateId,
    render,
    renderGroupedBySite,
    groupBySite,
    handleListClick,
    archiveEquipment,
    restoreEquipment,
    deleteEquipment,
    calcTotal,
    calcHireCost,
    saveToStorage,
    loadFromStorage,
    escapeHtml,
    init,
    deps,
    __setEquipmentList,
    __getEquipmentList,
  };
}

// Functions //

function setDefaultStartDate() {
  // sets the date input to today if it is empty // (but doesn't override if user has already selected a date)
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

  const newItem = deps.createEquipment(name, site, rate, startDate);

  equipmentList.push(newItem);
  deps.saveToStorage(equipmentList);

  form.reset();
  deps.setDefaultStartDate();
  deps.render();
}

function createEquipment(name, site, rate, startDate) {
  return {
    id: generateId(),
    name,
    site,
    rate,
    startDate,
    isArchived: false,
    archivedDate: null,
  };
}

function generateId() {
  // simple unique id generator using timestamp and random string
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function render() {
  activeListEl.innerHTML = "";
  archivedListEl.innerHTML = "";

  const activeItems = equipmentList.filter((item) => !item.isArchived);
  const archivedItems = equipmentList.filter((item) => item.isArchived);

  renderGroupedBySite(activeItems, activeListEl, "active");
  renderGroupedBySite(archivedItems, archivedListEl, "archived");

  // totals //
  totalActiveEl.textContent = calcTotal(activeItems).toFixed(2);
  totalArchivedEl.textContent = calcTotal(archivedItems).toFixed(2);
}

function renderGroupedBySite(items, containerEl, mode) {
  const groups = groupBySite(items);

  const sites = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  if (sites.length === 0) {
    containerEl.innerHTML = "<li class='meta'>No items</li>";
    return;
  }

  sites.forEach((siteName) => {
    const siteHeader = document.createElement("li");
    siteHeader.innerHTML = `<h3>${escapeHtml(siteName)}</h3>`;
    containerEl.appendChild(siteHeader);

    groups[siteName].forEach((item) => {
      const li = document.createElement("li");

      if (mode === "active") {
        li.innerHTML = `
          <strong>${escapeHtml(item.name)}</strong>
          <span class="meta">£${item.rate}/day from ${item.startDate}</span>
          <button data-action="archive" data-id="${item.id}">Archive</button>
          <button data-action="delete" data-id="${item.id}">Delete</button>
        `;
      } else {
        li.innerHTML = `
          <strong>${escapeHtml(item.name)}</strong>
          <span class="meta">${item.startDate} to ${item.archivedDate || "—"}</span>
          <button data-action="restore" data-id="${item.id}">Restore</button>
          <button data-action="delete" data-id="${item.id}">Delete</button>
        `;
      }

      containerEl.appendChild(li);
    });
  });

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
  const item = equipmentList.find((x) => x.id === id);
  if (!item) return;

  item.isArchived = true;
  item.archivedDate = new Date().toISOString().slice(0, 10);

  deps.saveToStorage(equipmentList);
  deps.render();
}

function restoreEquipment(id) {
  const item = equipmentList.find((x) => x.id === id);
  if (!item) return;

  item.isArchived = false;
  item.archivedDate = null;

  deps.saveToStorage(equipmentList);
  deps.render();
}

function deleteEquipment(id) {
  equipmentList = equipmentList.filter((x) => x.id !== id);
  deps.saveToStorage(equipmentList);
  deps.render();
}

function calcTotal(list) {
  return list.reduce(
    (sum, item) => sum + deps.calcHireCost(item.rate, item.startDate),
    0
  );
}

function calcHireCost(rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();

  // Strip time from both dates (calendar-day logic)
  const startDateOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );

  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffMs = todayDateOnly - startDateOnly;
  const days = Math.max(1, diffMs / (1000 * 60 * 60 * 24));

  return rate * days;
}

// Storage //
function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// safety //
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// State helpers for testing (not exported in browser) //
function __setEquipmentList(list) {
  equipmentList = list;
}

function __getEquipmentList() {
  return equipmentList;
}
