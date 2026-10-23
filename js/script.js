const COLORS = {
  Chest: "var(--chest)",
  Back: "var(--back)",
  Legs: "var(--legs)",
  Shoulders: "var(--shoulders)",
  Arms: "var(--arms)",
  Core: "var(--core)",
};

const STORAGE_KEY = "iron-log-entries";

let entries = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    /* storage unavailable, app still works for this session */
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function volumeOf(e) {
  return e.weight * e.sets * e.reps;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addEntry() {
  const exercise = document.getElementById("exercise").value.trim();
  const group = document.getElementById("group").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const sets = parseInt(document.getElementById("sets").value, 10);
  const reps = parseInt(document.getElementById("reps").value, 10);
  const error = document.getElementById("error");

  if (!exercise) { error.textContent = "Enter an exercise name."; return; }
  if (isNaN(weight) || weight < 0) { error.textContent = "Enter a weight of 0 kg or more."; return; }
  if (isNaN(sets) || sets < 1) { error.textContent = "Enter at least 1 set."; return; }
  if (isNaN(reps) || reps < 1) { error.textContent = "Enter at least 1 rep."; return; }

  error.textContent = "";
  entries.push({ id: Date.now(), date: todayKey(), exercise, group, weight, sets, reps });
  save();
  render();

  document.getElementById("exercise").value = "";
  document.getElementById("exercise").focus();
}

function deleteEntry(id) {
  entries = entries.filter((e) => e.id !== id);
  save();
  render();
}

function render() {
  const today = entries.filter((e) => e.date === todayKey());

  // list
  const list = document.getElementById("entries");
  list.replaceChildren();
  [...today].reverse().forEach((e) => {
    const li = el("li", "entry");

    const bar = el("span", "bar");
    bar.style.background = COLORS[e.group];

    const info = el("div");
    info.append(
      el("p", "name", e.exercise),
      el("p", "meta", `${e.group} · ${e.sets} × ${e.reps} at ${e.weight} kg`)
    );

    const vol = el("span", "vol", `${volumeOf(e)} kg`);

    const del = el("button", "del", "Delete");
    del.type = "button";
    del.setAttribute("aria-label", `Delete ${e.exercise}`);
    del.addEventListener("click", () => deleteEntry(e.id));

    li.append(bar, info, vol, del);
    list.append(li);
  });
  document.getElementById("empty").hidden = today.length > 0;

  // volume summary
  const byGroup = {};
  let total = 0;
  today.forEach((e) => {
    const v = volumeOf(e);
    total += v;
    byGroup[e.group] = (byGroup[e.group] || 0) + v;
  });

  document.getElementById("vol-total").textContent = total.toLocaleString();

  const bar = document.getElementById("vol-bar");
  const legend = document.getElementById("vol-legend");
  bar.replaceChildren();
  legend.replaceChildren();

  Object.keys(byGroup).forEach((g) => {
    const seg = el("span");
    seg.style.width = `${(byGroup[g] / total) * 100}%`;
    seg.style.background = COLORS[g];
    bar.append(seg);

    const item = el("li");
    const dot = el("i");
    dot.style.background = COLORS[g];
    item.append(dot, document.createTextNode(`${g} ${byGroup[g].toLocaleString()} kg`));
    legend.append(item);
  });
}

document.getElementById("today").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});
document.getElementById("add-btn").addEventListener("click", addEntry);

render();
const themeBtn = document.getElementById("theme-btn");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  try { localStorage.setItem("iron-log-theme", theme); } catch (e) {}
}

themeBtn.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

let savedTheme = "light";
try { savedTheme = localStorage.getItem("iron-log-theme") || "light"; } catch (e) {}
applyTheme(savedTheme);