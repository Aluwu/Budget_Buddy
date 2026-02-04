const STORAGE_KEY = "calmBudget_v1";
const DEFAULT_MONTH_DAY = new Date().getDate();
const FEEDBACK_EMAIL = "asa.e.mcleod@gmail.com";
const GITHUB_REPO = "Aluwu/Budget_Buddy";
const DEFAULT_CATEGORIES = [
  { name: "Housing", limit: 1200, monthDay: DEFAULT_MONTH_DAY },
  { name: "Food", limit: 450, monthDay: DEFAULT_MONTH_DAY },
  { name: "Transport", limit: 220, monthDay: DEFAULT_MONTH_DAY },
  { name: "Health", limit: 160, monthDay: DEFAULT_MONTH_DAY },
  { name: "Utilities", limit: 180, monthDay: DEFAULT_MONTH_DAY },
  { name: "Fun", limit: 200, monthDay: DEFAULT_MONTH_DAY }
];

const state = {
  onboardingComplete: false,
  income: 0,
  incomeFrequency: "monthly",
  incomeStartDate: null,
  viewingDate: null,
  goal: "",
  categories: [],
  expenses: [],
  settings: {
    accent: "#3b82f6",
    highContrast: false,
    fontScale: 1,
    darkMode: false
  }
};

const ui = {
  onboarding: document.getElementById("onboarding"),
  onboardingForm: document.getElementById("onboardingForm"),
  incomeLabel: document.getElementById("incomeLabel"),
  newCategoryName: document.getElementById("newCategoryName"),
  newCategoryLimit: document.getElementById("newCategoryLimit"),
  newCategoryMonthDay: document.getElementById("newCategoryMonthDay"),
  addCategoryBtn: document.getElementById("addCategoryBtn"),
  categoryChips: document.getElementById("categoryChips"),
  dashboard: document.getElementById("dashboard"),
  periodTitle: document.getElementById("periodTitle"),
  monthLabel: document.getElementById("monthLabel"),
  prevPeriod: document.getElementById("prevPeriod"),
  nextPeriod: document.getElementById("nextPeriod"),
  totalIncome: document.getElementById("totalIncome"),
  totalSpent: document.getElementById("totalSpent"),
  totalRemaining: document.getElementById("totalRemaining"),
  totalCategorySpent: document.getElementById("totalCategorySpent"),
  statusPill: document.getElementById("statusPill"),
  categoryList: document.getElementById("categoryList"),
  transactions: document.getElementById("transactions"),
  transactionList: document.getElementById("transactionList"),
  searchInput: document.getElementById("searchInput"),
  filterCategory: document.getElementById("filterCategory"),
  expenseDialog: document.getElementById("expenseDialog"),
  expenseForm: document.getElementById("expenseForm"),
  expenseDialogTitle: document.getElementById("expenseDialogTitle"),
  expenseAmount: document.getElementById("expenseAmount"),
  expenseCategory: document.getElementById("expenseCategory"),
  expenseNote: document.getElementById("expenseNote"),
  expenseDate: document.getElementById("expenseDate"),
  deleteExpense: document.getElementById("deleteExpense"),
  openAddExpense: document.getElementById("openAddExpense"),
  closeExpense: document.getElementById("closeExpense"),
  refreshApp: document.getElementById("refreshApp"),
  refreshStatus: document.getElementById("refreshStatus"),
  openSettings: document.getElementById("openSettings"),
  settingsDialog: document.getElementById("settingsDialog"),
  settingsForm: document.getElementById("settingsForm"),
  closeSettings: document.getElementById("closeSettings"),
  editCategoryDialog: document.getElementById("editCategoryDialog"),
  editCategoryForm: document.getElementById("editCategoryForm"),
  editCategoryName: document.getElementById("editCategoryName"),
  editCategoryLimit: document.getElementById("editCategoryLimit"),
  editCategoryMonthDay: document.getElementById("editCategoryMonthDay"),
  closeEditCategory: document.getElementById("closeEditCategory"),
  cancelEditCategory: document.getElementById("cancelEditCategory"),
  accentColor: document.getElementById("accentColor"),
  applyAccent: document.getElementById("applyAccent"),
  settingsIncome: document.getElementById("settingsIncome"),
  settingsFrequency: document.getElementById("settingsFrequency"),
  settingsStartDate: document.getElementById("settingsStartDate"),
  settingsStartDateField: document.getElementById("settingsStartDateField"),
  settingsCategoryName: document.getElementById("settingsCategoryName"),
  settingsCategoryLimit: document.getElementById("settingsCategoryLimit"),
  settingsCategoryMonthDay: document.getElementById("settingsCategoryMonthDay"),
  settingsAddCategory: document.getElementById("settingsAddCategory"),
  resetApp: document.getElementById("resetApp"),
  fontScale: document.getElementById("fontScale"),
  highContrast: document.getElementById("highContrast"),
  darkMode: document.getElementById("darkMode"),
  incomeFrequency: document.getElementById("incomeFrequency"),
  incomeStartDate: document.getElementById("incomeStartDate"),
  onboardingStartDateField: document.getElementById("onboardingStartDateField"),
  insights: document.getElementById("insights"),
  insightCards: document.getElementById("insightCards"),
  goals: document.getElementById("goals"),
  goalCards: document.getElementById("goalCards"),
  dataTools: document.getElementById("dataTools"),
  exportCsv: document.getElementById("exportCsv"),
  exportJson: document.getElementById("exportJson"),
  importJson: document.getElementById("importJson"),
  submitFeedback: document.getElementById("submitFeedback"),
  openUpdateNotes: document.getElementById("openUpdateNotes"),
  updateNotesDialog: document.getElementById("updateNotesDialog"),
  updateNotesContent: document.getElementById("updateNotesContent"),
  closeUpdateNotes: document.getElementById("closeUpdateNotes"),
  toast: document.getElementById("toast")
};

let editingExpenseId = null;
let editingCategoryId = null;

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

const formatCurrency = (value) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value || 0);

const todayIso = () => new Date().toISOString().slice(0, 10);

const generateId = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.assign(state, data, {
      settings: { ...state.settings, ...data.settings }
    });
  } catch (error) {
    console.error("Failed to load state", error);
  }
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const setAccent = (color) => {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-soft", `${color}1f`);
};

const setFontScale = (scale) => {
  document.documentElement.style.setProperty("--font-scale", String(scale));
};

const setHighContrast = (enabled) => {
  document.body.classList.toggle("high-contrast", enabled);
};

const setDarkMode = (enabled) => {
  document.documentElement.classList.toggle("dark-theme", enabled);
};

const showToast = (message) => {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  setTimeout(() => ui.toast.classList.remove("show"), 2200);
};

const setRefreshStatus = (message) => {
  if (!ui.refreshStatus) return;
  ui.refreshStatus.textContent = message || "";
};

const fetchLatestCommit = async () => {
  if (!GITHUB_REPO || GITHUB_REPO.includes("YOUR_GITHUB_REPO")) {
    throw new Error("Repo not set");
  }
  const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1&t=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Commit not found");
  }
  const data = await response.json();
  return data[0] || null;
};

const checkForUpdate = (registration) =>
  new Promise((resolve) => {
    if (registration.waiting) {
      resolve(true);
      return;
    }
    const installing = registration.installing;
    if (!installing) {
      resolve(false);
      return;
    }
    const onStateChange = () => {
      if (installing.state === "installed") {
        installing.removeEventListener("statechange", onStateChange);
        resolve(!!navigator.serviceWorker.controller);
      }
    };
    installing.addEventListener("statechange", onStateChange);
    setTimeout(() => resolve(false), 4000);
  });

const refreshAppForUpdates = async () => {
  if (!navigator.onLine) {
    showToast("You will need to be connected to the internet to update the app.");
    return;
  }
  ui.refreshApp.disabled = true;
  setRefreshStatus("Checking for updates...");
  if (!("serviceWorker" in navigator)) {
    showToast("You're using the latest version");
    ui.refreshApp.disabled = false;
    setRefreshStatus("");
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    showToast("You're using the latest version");
    ui.refreshApp.disabled = false;
    setRefreshStatus("");
    return;
  }
  const hadWaiting = !!registration.waiting;
  await registration.update();
  const updated = await checkForUpdate(registration);
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "FORCE_REFRESH" });
  }
  try {
    await fetchLatestCommit();
  } catch (error) {
    setRefreshStatus("Could not reach GitHub.");
  }
  if (updated || hadWaiting || registration.waiting) {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    showToast("Your app has been updated");
    setTimeout(() => window.location.reload(), 700);
    return;
  }
  showToast("You're using the latest version");
  ui.refreshApp.disabled = false;
  setRefreshStatus("");
};

const defaultCategorySelection = () =>
  DEFAULT_CATEGORIES.map((category) => ({ ...category, selected: true, id: generateId() }));

const toggleStartDateFields = (frequency) => {
  const show = frequency === "biweekly";
  ui.onboardingStartDateField.classList.toggle("hidden", !show);
  ui.settingsStartDateField.classList.toggle("hidden", !show);
  if (ui.incomeLabel) {
    ui.incomeLabel.textContent = frequency === "biweekly" ? "Bi-weekly income" : "Monthly income";
  }
};

const normalizeName = (name) => name.trim().toLowerCase();

const normalizeMonthDay = (value, baseDate = new Date()) => {
  const day = Number(value);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  if (!Number.isFinite(day)) return Math.min(DEFAULT_MONTH_DAY, lastDay);
  return Math.min(lastDay, Math.max(1, Math.round(day)));
};

const getMonthDayFromDateString = (value, baseDate = new Date()) => {
  if (!value) return normalizeMonthDay(DEFAULT_MONTH_DAY, baseDate);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return normalizeMonthDay(DEFAULT_MONTH_DAY, baseDate);
  return normalizeMonthDay(parsed.getDate(), parsed);
};

const monthDayToDateValue = (day, baseDate = new Date()) => {
  const safeDay = normalizeMonthDay(day, baseDate);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const result = new Date(year, month, safeDay);
  return result.toISOString().slice(0, 10);
};

const createCategory = (name, limit, monthDay) => ({
  id: generateId(),
  name: name.trim(),
  limit: Number.isFinite(limit) ? limit : 0,
  monthDay: normalizeMonthDay(monthDay)
});

const addOnboardingCategory = () => {
  const name = ui.newCategoryName.value.trim();
  const limitValue = Number(ui.newCategoryLimit.value);
  const monthDayValue = getMonthDayFromDateString(ui.newCategoryMonthDay.value);
  if (!name) return;
  const exists = onboardingCategories.some((cat) => normalizeName(cat.name) === normalizeName(name));
  if (exists) {
    showToast("Category already exists");
    return;
  }
  onboardingCategories.push({ ...createCategory(name, limitValue, monthDayValue), selected: true });
  ui.newCategoryName.value = "";
  ui.newCategoryLimit.value = "";
  ui.newCategoryMonthDay.value = "";
  renderOnboardingChips(onboardingCategories);
  showToast("Category added");
};

const addSettingsCategory = () => {
  const name = ui.settingsCategoryName.value.trim();
  const limitValue = Number(ui.settingsCategoryLimit.value);
  const monthDayValue = getMonthDayFromDateString(ui.settingsCategoryMonthDay.value);
  if (!name) return;
  const exists = state.categories.some((cat) => normalizeName(cat.name) === normalizeName(name));
  if (exists) {
    showToast("Category already exists");
    return;
  }
  state.categories.push(createCategory(name, limitValue, monthDayValue));
  ui.settingsCategoryName.value = "";
  ui.settingsCategoryLimit.value = "";
  ui.settingsCategoryMonthDay.value = "";
  saveAndRender();
  showToast("Category added");
};

const renderOnboardingChips = (items) => {
  ui.categoryChips.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "chip-row";

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip ${item.selected ? "active" : ""}`;
    chip.textContent = item.name;

    const inputsWrap = document.createElement("div");
    inputsWrap.className = "chip-inputs";

    const limitInput = document.createElement("input");
    limitInput.type = "number";
    limitInput.min = "0";
    limitInput.step = "0.01";
    limitInput.value = Number.isFinite(item.limit) ? item.limit : 0;
    limitInput.placeholder = "Limit";
    limitInput.setAttribute("aria-label", `${item.name} limit`);
    limitInput.disabled = !item.selected;

    const dayInput = document.createElement("input");
    dayInput.type = "date";
    dayInput.value = monthDayToDateValue(item.monthDay);
    dayInput.setAttribute("aria-label", `${item.name} due date`);
    dayInput.disabled = !item.selected;

    chip.addEventListener("click", () => {
      item.selected = !item.selected;
      chip.classList.toggle("active", item.selected);
      limitInput.disabled = !item.selected;
      dayInput.disabled = !item.selected;
    });

    limitInput.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      item.limit = Number.isFinite(value) ? value : item.limit;
    });

    dayInput.addEventListener("input", (event) => {
      item.monthDay = getMonthDayFromDateString(event.target.value);
    });

    inputsWrap.append(limitInput, dayInput);

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "chip-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "btn ghost";
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", () => {
      const nextName = window.prompt("Rename category", item.name);
      if (!nextName) return;
      const trimmed = nextName.trim();
      if (!trimmed) return;
      const exists = items.some((cat) => cat.id !== item.id && normalizeName(cat.name) === normalizeName(trimmed));
      if (exists) {
        showToast("Category already exists");
        return;
      }
      item.name = trimmed;
      renderOnboardingChips(items);
      showToast("Category renamed");
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn ghost danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      const index = items.findIndex((cat) => cat.id === item.id);
      if (index >= 0) {
        items.splice(index, 1);
        renderOnboardingChips(items);
        showToast("Category removed");
      }
    });

    actionsWrap.append(renameBtn, removeBtn);

    row.append(chip, inputsWrap, actionsWrap);
    ui.categoryChips.appendChild(row);
  });
};

const getPeriodInfo = (date = new Date()) => {
  if (state.incomeFrequency !== "biweekly") {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: monthFormatter.format(date),
      start,
      end
    };
  }

  const anchor = state.incomeStartDate ? new Date(state.incomeStartDate) : new Date();
  anchor.setHours(0, 0, 0, 0);
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((current - anchor) / (1000 * 60 * 60 * 24));
  const periodIndex = Math.floor(diffDays / 14);
  const start = new Date(anchor);
  start.setDate(anchor.getDate() + periodIndex * 14);
  const end = new Date(start);
  end.setDate(start.getDate() + 13);

  return {
    key: `biweekly-${periodIndex}`,
    label: `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`,
    start,
    end
  };
};

const getPreviousPeriodInfo = (currentPeriod) => {
  if (state.incomeFrequency === "biweekly") {
    const previousDate = new Date(currentPeriod.start);
    previousDate.setDate(currentPeriod.start.getDate() - 14);
    return getPeriodInfo(previousDate);
  }
  const previousDate = new Date(currentPeriod.start);
  previousDate.setMonth(currentPeriod.start.getMonth() - 1);
  return getPeriodInfo(previousDate);
};

const isWithinPeriod = (date, period) => {
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check >= period.start && check <= period.end;
};

const filterExpensesForPeriod = (period) =>
  state.expenses.filter((expense) => isWithinPeriod(expense.date, period));

const sumExpenses = (items) => items.reduce((sum, item) => sum + item.amount, 0);

const getCategorySpent = (categoryId, period) =>
  sumExpenses(filterExpensesForPeriod(period).filter((item) => item.categoryId === categoryId));

const renderDashboard = () => {
  const period = getPeriodInfo(state.viewingDate ? new Date(state.viewingDate) : new Date());
  ui.periodTitle.textContent = state.incomeFrequency === "biweekly" ? "This period" : "This month";
  ui.monthLabel.textContent = period.label;

  const periodExpenses = filterExpensesForPeriod(period);
  const totalSpent = sumExpenses(periodExpenses);
  const totalCategorySpent = state.categories.reduce(
    (sum, category) => sum + getCategorySpent(category.id, period),
    0
  );
  const totalIncome = state.income || 0;
  const remaining = totalIncome - totalSpent;

  ui.totalIncome.textContent = formatCurrency(totalIncome);
  ui.totalSpent.textContent = formatCurrency(totalSpent);
  ui.totalRemaining.textContent = formatCurrency(remaining);
  ui.totalCategorySpent.textContent = formatCurrency(totalCategorySpent);

  const totalLimit = state.categories.reduce((sum, cat) => sum + (cat.limit || 0), 0);
  const overBy = totalLimit > 0 ? totalSpent - totalLimit : totalSpent - totalIncome;

  ui.statusPill.classList.remove("warning", "danger");
  if (overBy > 50) {
    ui.statusPill.textContent = `You’re over by ${formatCurrency(overBy)}`;
    ui.statusPill.classList.add("danger");
  } else if (overBy > 0) {
    ui.statusPill.textContent = `You’re close — ${formatCurrency(overBy)} over`;
    ui.statusPill.classList.add("warning");
  } else {
    ui.statusPill.textContent = "You’re on track";
  }

  ui.categoryList.innerHTML = "";
  state.categories.forEach((category) => {
    const spent = getCategorySpent(category.id, period);
    const percent = category.limit ? Math.min(100, (spent / category.limit) * 100) : 0;
    const remaining = (category.limit || 0) - spent;
    const baseDate = period.start || new Date();
    const dueDateIso = monthDayToDateValue(category.monthDay, baseDate);
    const dueDateLabel = shortDateFormatter.format(new Date(dueDateIso));
    const card = document.createElement("div");
    card.className = "category-card";

    const info = document.createElement("div");
    info.className = "category-info";
    info.innerHTML = `
      <div class="category-name">${category.name} <span class="muted">- ${dueDateLabel}</span></div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${percent.toFixed(0)}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width: ${percent}%;"></div>
      </div>
      <div class="progress-meta">
        <span>What's left ${formatCurrency(remaining)} of ${formatCurrency(category.limit || 0)}</span>
        <span>Spent ${formatCurrency(spent)}</span>
      </div>
    `;

    const action = document.createElement("div");
    action.className = "category-action";
    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => editCategory(category.id));
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn ghost danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeCategory(category.id));
    action.append(editBtn, removeBtn);

    card.appendChild(info);
    card.appendChild(action);
    ui.categoryList.appendChild(card);
  });
};

const renderTransactions = () => {
  const query = ui.searchInput.value.toLowerCase();
  const filterCategory = ui.filterCategory.value;
  const period = getPeriodInfo(state.viewingDate ? new Date(state.viewingDate) : new Date());
  const items = filterExpensesForPeriod(period)
    .filter((item) =>
      (!filterCategory || item.categoryId === filterCategory) &&
      (!query || item.note?.toLowerCase().includes(query))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = items.reduce((acc, item) => {
    const dateKey = item.date;
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  ui.transactionList.innerHTML = "";
  Object.keys(grouped).forEach((dateKey) => {
    const group = document.createElement("div");
    group.className = "transaction-group";
    group.innerHTML = `<div class="transaction-date">${dateFormatter.format(new Date(dateKey))}</div>`;

    grouped[dateKey].forEach((item) => {
      const category = state.categories.find((cat) => cat.id === item.categoryId);
      const row = document.createElement("div");
      row.className = "transaction-item";
      row.innerHTML = `
        <div class="transaction-meta">
          <strong>${formatCurrency(item.amount)}</strong>
          <span>${item.note || "No note"}</span>
          <span class="badge">${category ? category.name : ""}</span>
        </div>
      `;

      const actions = document.createElement("div");
      actions.className = "transaction-actions";
      const editBtn = document.createElement("button");
      editBtn.className = "btn ghost";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openExpenseDialog(item));
      const delBtn = document.createElement("button");
      delBtn.className = "btn ghost";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteExpense(item.id));
      actions.append(editBtn, delBtn);
      row.appendChild(actions);
      group.appendChild(row);
    });

    ui.transactionList.appendChild(group);
  });

  if (!items.length) {
    ui.transactionList.innerHTML = "<p class=\"muted\">No transactions yet. Add your first expense.</p>";
  }
};

const renderInsights = () => {
  if (state.expenses.length < 3) {
    ui.insights.hidden = true;
    return;
  }

  const currentPeriod = getPeriodInfo(state.viewingDate ? new Date(state.viewingDate) : new Date());
  const previousPeriod = getPreviousPeriodInfo(currentPeriod);
  const currentSpent = sumExpenses(filterExpensesForPeriod(currentPeriod));
  const lastSpent = sumExpenses(filterExpensesForPeriod(previousPeriod));
  const change = lastSpent ? ((currentSpent - lastSpent) / lastSpent) * 100 : null;

  const categoryTotals = state.categories.map((cat) => ({
    name: cat.name,
    spent: getCategorySpent(cat.id, currentPeriod)
  }));
  categoryTotals.sort((a, b) => b.spent - a.spent);

  ui.insightCards.innerHTML = "";
  const top = categoryTotals[0];
  const periodWord = state.incomeFrequency === "biweekly" ? "this period" : "this month";
  const lastPeriodWord = state.incomeFrequency === "biweekly" ? "last period" : "last month";
  if (top && top.spent > 0) {
    ui.insightCards.appendChild(createInsightCard(`Most spending`, `You spent ${formatCurrency(top.spent)} on ${top.name} ${periodWord}.`));
  }
  if (change !== null) {
    const verb = change > 0 ? "more" : "less";
    ui.insightCards.appendChild(createInsightCard("Period comparison", `You spent ${Math.abs(change).toFixed(0)}% ${verb} than ${lastPeriodWord}.`));
  }

  ui.insights.hidden = false;
};

const renderGoals = () => {
  if (!state.goal) {
    ui.goals.hidden = true;
    return;
  }

  const currentPeriod = getPeriodInfo(state.viewingDate ? new Date(state.viewingDate) : new Date());
  const spent = sumExpenses(filterExpensesForPeriod(currentPeriod));
  const income = state.income || 0;
  const saved = Math.max(0, income - spent);
  const target = income ? income * 0.2 : 500;
  const progress = target ? Math.min(100, (saved / target) * 100) : 0;

  ui.goalCards.innerHTML = "";
  const periodWord = state.incomeFrequency === "biweekly" ? "this period" : "this month";
  ui.goalCards.appendChild(createGoalCard("Savings", `${formatCurrency(saved)} saved ${periodWord}`, progress));
  ui.goals.hidden = false;
};

const createInsightCard = (title, copy) => {
  const card = document.createElement("div");
  card.className = "insight-card";
  card.innerHTML = `<strong>${title}</strong><p class="muted">${copy}</p>`;
  return card;
};

const createGoalCard = (title, copy, progress) => {
  const card = document.createElement("div");
  card.className = "goal-card";
  card.innerHTML = `
    <strong>${title}</strong>
    <p class="muted">${copy}</p>
    <div class="goal-progress"><span style="width: ${progress}%;"></span></div>
  `;
  return card;
};

const renderDataTools = () => {
  ui.dataTools.hidden = false;
};

const openExpenseDialog = (expense = null) => {
  editingExpenseId = expense ? expense.id : null;
  ui.expenseDialogTitle.textContent = expense ? "Edit expense" : "Add expense";
  ui.expenseAmount.value = expense ? expense.amount : "";
  ui.expenseCategory.value = expense ? expense.categoryId : state.categories[0]?.id || "";
  ui.expenseNote.value = expense ? expense.note || "" : "";
  ui.expenseDate.value = expense ? expense.date : todayIso();
  ui.deleteExpense.style.visibility = expense ? "visible" : "hidden";
  ui.expenseDialog.showModal();
};

const closeExpenseDialog = () => {
  ui.expenseDialog.close();
};

const editCategory = (categoryId) => {
  const category = state.categories.find((cat) => cat.id === categoryId);
  if (!category) return;
  editingCategoryId = categoryId;
  ui.editCategoryName.value = category.name;
  ui.editCategoryLimit.value = Number.isFinite(category.limit) ? category.limit : 0;
  const baseDate = state.viewingDate ? new Date(state.viewingDate) : new Date();
  ui.editCategoryMonthDay.value = monthDayToDateValue(category.monthDay, baseDate);
  ui.editCategoryDialog.showModal();
};

const closeEditCategoryDialog = () => {
  ui.editCategoryDialog.close();
};

const handleEditCategorySubmit = (event) => {
  event.preventDefault();
  const category = state.categories.find((cat) => cat.id === editingCategoryId);
  if (!category) return;
  const name = ui.editCategoryName.value.trim();
  if (!name) return;
  const limitValue = Number(ui.editCategoryLimit.value);
  const monthDayValue = getMonthDayFromDateString(ui.editCategoryMonthDay.value);
  category.name = name;
  category.limit = Number.isFinite(limitValue) ? limitValue : category.limit;
  category.monthDay = normalizeMonthDay(monthDayValue);
  saveAndRender();
  closeEditCategoryDialog();
  showToast("Category updated");
};

const removeCategory = (categoryId) => {
  const category = state.categories.find((cat) => cat.id === categoryId);
  if (!category) return;
  const proceed = window.confirm(
    `Remove ${category.name}? This will delete its expenses and cannot be undone.`
  );
  if (!proceed) return;
  state.categories = state.categories.filter((cat) => cat.id !== categoryId);
  state.expenses = state.expenses.filter((item) => item.categoryId !== categoryId);
  saveAndRender();
  showToast("Category removed");
};

const deleteExpense = (expenseId) => {
  state.expenses = state.expenses.filter((item) => item.id !== expenseId);
  saveAndRender();
  showToast("Expense removed");
};

const handleExpenseSubmit = (event) => {
  event.preventDefault();
  const amount = Number(ui.expenseAmount.value);
  if (!Number.isFinite(amount) || amount <= 0) return;

  const expense = {
    id: editingExpenseId || generateId(),
    amount,
    categoryId: ui.expenseCategory.value,
    note: ui.expenseNote.value.trim(),
    date: ui.expenseDate.value || todayIso()
  };

  if (editingExpenseId) {
    state.expenses = state.expenses.map((item) => (item.id === editingExpenseId ? expense : item));
    showToast("Expense updated");
  } else {
    state.expenses.push(expense);
    showToast("Expense added");
  }

  closeExpenseDialog();
  saveAndRender();
};

const handleOnboardingSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(ui.onboardingForm);
  const income = Number(formData.get("income"));
  const goal = formData.get("goal");
  const incomeFrequency = formData.get("incomeFrequency") || "monthly";
  const incomeStartDate = formData.get("incomeStartDate") || todayIso();
  const selected = onboardingCategories.filter((item) => item.selected);

  state.income = Number.isFinite(income) ? income : 0;
  state.incomeFrequency = incomeFrequency;
  state.incomeStartDate = incomeFrequency === "biweekly" ? incomeStartDate : todayIso();
  state.goal = goal || "";
  state.categories = selected.map((item) => ({
    id: item.id,
    name: item.name,
    limit: item.limit,
    monthDay: normalizeMonthDay(item.monthDay)
  }));
  state.onboardingComplete = true;

  saveAndRender();
  showToast("You’re all set");
};

const updateCategorySelectors = () => {
  ui.expenseCategory.innerHTML = "";
  ui.filterCategory.innerHTML = "<option value=\"\">All categories</option>";
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    ui.expenseCategory.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = category.id;
    filterOption.textContent = category.name;
    ui.filterCategory.appendChild(filterOption);
  });
};

const saveAndRender = () => {
  saveState();
  renderApp();
};

const renderApp = () => {
  ui.onboarding.hidden = state.onboardingComplete;
  ui.dashboard.hidden = !state.onboardingComplete;
  ui.transactions.hidden = !state.onboardingComplete;
  ui.openAddExpense.disabled = !state.onboardingComplete;

  if (!state.onboardingComplete) return;

  updateCategorySelectors();
  renderDashboard();
  renderTransactions();
  renderInsights();
  renderGoals();
  renderDataTools();
};

const shiftViewingDate = (direction) => {
  const current = state.viewingDate ? new Date(state.viewingDate) : new Date();
  if (state.incomeFrequency === "biweekly") {
    current.setDate(current.getDate() + (direction === "next" ? 14 : -14));
  } else {
    current.setMonth(current.getMonth() + (direction === "next" ? 1 : -1));
  }
  state.viewingDate = current.toISOString();
  saveAndRender();
};

const handleSettingsSubmit = (event) => {
  event.preventDefault();
  state.settings.accent = ui.accentColor.value;
  state.settings.fontScale = Number(ui.fontScale.value || 1);
  state.settings.highContrast = ui.highContrast.checked;
  state.settings.darkMode = ui.darkMode.checked;
  state.income = Number(ui.settingsIncome.value || 0);
  state.incomeFrequency = ui.settingsFrequency.value;
  state.incomeStartDate = state.incomeFrequency === "biweekly" ? (ui.settingsStartDate.value || todayIso()) : todayIso();
  state.viewingDate = new Date().toISOString();
  applySettings();
  saveAndRender();
  ui.settingsDialog.close();
  showToast("Preferences updated");
};

const applySettings = () => {
  setAccent(state.settings.accent);
  setFontScale(state.settings.fontScale);
  setHighContrast(state.settings.highContrast);
  setDarkMode(state.settings.darkMode);
  ui.accentColor.value = state.settings.accent;
  ui.settingsIncome.value = state.income || 0;
  ui.settingsFrequency.value = state.incomeFrequency;
  ui.settingsStartDate.value = state.incomeStartDate || todayIso();
  ui.incomeFrequency.value = state.incomeFrequency;
  ui.incomeStartDate.value = state.incomeStartDate || todayIso();
  toggleStartDateFields(state.incomeFrequency);
  ui.fontScale.value = String(state.settings.fontScale);
  ui.highContrast.checked = state.settings.highContrast;
  ui.darkMode.checked = state.settings.darkMode;
};

const applyAccentPreview = () => {
  const color = ui.accentColor.value;
  if (!color) return;
  state.settings.accent = color;
  setAccent(color);
  saveState();
  showToast("Accent updated");
};

const submitFeedback = () => {
  if (!FEEDBACK_EMAIL || FEEDBACK_EMAIL.includes("your-email")) {
    showToast("Set your feedback email in app.js");
    return;
  }
  const subject = encodeURIComponent("Budget Buddy Feedback");
  const body = encodeURIComponent("Hi! Here's my feedback:\n\n");
  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
};

const openUpdateNotes = () => {
  ui.updateNotesDialog.showModal();
  ui.updateNotesContent.textContent = "Loading latest notes...";
  if (!GITHUB_REPO || GITHUB_REPO.includes("YOUR_GITHUB_REPO")) {
    ui.updateNotesContent.textContent = "Set your GitHub repo in app.js to load update notes.";
    return;
  }
  fetchLatestCommit()
    .then((commit) => {
      if (!commit) {
        ui.updateNotesContent.textContent = "No commits found.";
        return;
      }
      const message = commit.commit?.message || "Latest update";
      const author = commit.commit?.author?.name || "Unknown author";
      const dateRaw = commit.commit?.author?.date || new Date().toISOString();
      const date = new Date(dateRaw).toLocaleString();
      const link = commit.html_url || "";
      ui.updateNotesContent.textContent = `${message}\n\nBy ${author} on ${date}${link ? `\n${link}` : ""}`;
    })
    .catch(() => {
      ui.updateNotesContent.textContent = "Could not load update notes. Check your repository settings.";
    });
};

const escapeCsvField = (field) => {
  const str = String(field || "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const exportCsv = () => {
  const rows = ["date,amount,category,note"];
  state.expenses.forEach((item) => {
    const category = state.categories.find((cat) => cat.id === item.categoryId);
    rows.push(`${item.date},${item.amount},${escapeCsvField(category ? category.name : "")},${escapeCsvField(item.note)}`);
  });
  downloadFile("calm-budget.csv", rows.join("\n"), "text/csv");
};

const exportJson = () => {
  downloadFile("calm-budget-backup.json", JSON.stringify(state, null, 2), "application/json");
};

const importBackup = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.assign(state, data);
      saveAndRender();
      showToast("Backup imported");
    } catch (error) {
      showToast("Could not import backup");
    }
  };
  reader.readAsText(file);
};

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
};

const resetApp = () => {
  const proceed = window.confirm("Start over? This will clear all data on this device.");
  if (!proceed) return;
  const backup = window.confirm("Would you like to back up your data first?");
  if (backup) {
    exportJson();
  }
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

const onboardingCategories = defaultCategorySelection();

const init = () => {
  loadState();
  if (state.categories.length) {
    state.categories = state.categories.map((category) => ({
      ...category,
      monthDay: normalizeMonthDay(category.monthDay)
    }));
  }
  if (!state.incomeStartDate) {
    state.incomeStartDate = todayIso();
  }
  if (!state.viewingDate) {
    state.viewingDate = new Date().toISOString();
  }
  renderOnboardingChips(onboardingCategories);
  applySettings();
  renderApp();

  ui.onboardingForm.addEventListener("submit", handleOnboardingSubmit);
  ui.openAddExpense.addEventListener("click", () => openExpenseDialog());
  ui.refreshApp.addEventListener("click", refreshAppForUpdates);
  ui.closeExpense.addEventListener("click", closeExpenseDialog);
  ui.expenseForm.addEventListener("submit", handleExpenseSubmit);
  ui.deleteExpense.addEventListener("click", () => {
    if (editingExpenseId) {
      deleteExpense(editingExpenseId);
      closeExpenseDialog();
    }
  });

  ui.searchInput.addEventListener("input", renderTransactions);
  ui.filterCategory.addEventListener("change", renderTransactions);

  ui.prevPeriod.addEventListener("click", () => shiftViewingDate("prev"));
  ui.nextPeriod.addEventListener("click", () => shiftViewingDate("next"));

  ui.addCategoryBtn.addEventListener("click", addOnboardingCategory);
  ui.settingsAddCategory.addEventListener("click", addSettingsCategory);

  ui.openSettings.addEventListener("click", () => ui.settingsDialog.showModal());
  ui.closeSettings.addEventListener("click", () => ui.settingsDialog.close());
  ui.settingsForm.addEventListener("submit", handleSettingsSubmit);
  ui.settingsFrequency.addEventListener("change", (event) => toggleStartDateFields(event.target.value));
  ui.incomeFrequency.addEventListener("change", (event) => toggleStartDateFields(event.target.value));
  ui.applyAccent.addEventListener("click", applyAccentPreview);
  ui.submitFeedback.addEventListener("click", submitFeedback);
  ui.openUpdateNotes.addEventListener("click", openUpdateNotes);
  ui.closeUpdateNotes.addEventListener("click", () => ui.updateNotesDialog.close());

  ui.exportCsv.addEventListener("click", exportCsv);
  ui.exportJson.addEventListener("click", exportJson);
  ui.importJson.addEventListener("change", importBackup);
  ui.resetApp.addEventListener("click", resetApp);

  ui.expenseDialog.addEventListener("close", () => {
    editingExpenseId = null;
  });

  ui.editCategoryForm.addEventListener("submit", handleEditCategorySubmit);
  ui.closeEditCategory.addEventListener("click", closeEditCategoryDialog);
  ui.cancelEditCategory.addEventListener("click", closeEditCategoryDialog);
  ui.editCategoryDialog.addEventListener("close", () => {
    editingCategoryId = null;
  });

  registerServiceWorker();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_UPDATED") {
        showToast("Your app has been updated");
        setTimeout(() => window.location.reload(), 700);
      }
    });
  }
};

init();
