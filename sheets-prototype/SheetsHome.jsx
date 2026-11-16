import React, { useMemo, useState } from "react";

const INITIAL_SETS = [
  { id: "live", name: "Live set", parentId: null, order: 0, color: "#8FB2E8" },
  { id: "acoustic", name: "Acoustic", parentId: null, order: 1, color: "#39A58A" },
  { id: "morning", name: "Morning set", parentId: "acoustic", order: 2, color: "#D49A55" },
  { id: "ideas", name: "Ideas", parentId: null, order: 3, color: "#9A83D8" },
];

const INITIAL_SHEETS = [
  {
    id: "midnight-drive",
    title: "Midnight Drive",
    key: "Am",
    mode: "minor",
    favorite: true,
    updatedAt: 6,
    createdAt: 2,
    setIds: ["live", "ideas"],
    sections: [
      {
        name: "Verse",
        kind: "melodic",
        notes: ["A", "C", "D", "E", "G"],
        chords: ["Am", "D", "F", "G7"],
        color: "#26A58A",
      },
      {
        name: "Chorus",
        kind: "harmonic",
        chords: ["C", "G", "Am", "E7"],
        color: "#E0508F",
      },
    ],
  },
  {
    id: "salt-wind",
    title: "Salt Wind",
    key: "E",
    mode: "major",
    favorite: false,
    updatedAt: 5,
    createdAt: 1,
    setIds: ["acoustic", "morning"],
    sections: [
      {
        name: "Intro",
        kind: "harmonic",
        chords: ["E", "A", "C#m", "B"],
        color: "#7A5CFF",
      },
    ],
  },
  {
    id: "paper-lanterns",
    title: "Paper Lanterns",
    key: "C",
    mode: "major",
    favorite: false,
    updatedAt: 4,
    createdAt: 3,
    setIds: ["ideas"],
    sections: [
      {
        name: "Bridge",
        kind: "hybrid",
        notes: ["C", "D", "E", "G"],
        chords: ["C", "G", "Am", "F"],
        color: "#3F7BE8",
      },
    ],
  },
  {
    id: "blue-hour",
    title: "Blue Hour",
    key: "F#m",
    mode: "minor",
    favorite: true,
    updatedAt: 3,
    createdAt: 4,
    setIds: ["live"],
    sections: [
      {
        name: "Verse",
        kind: "harmonic",
        chords: ["F#m", "D", "A", "E"],
        color: "#D18A63",
      },
    ],
  },
];

const COLORS = {
  bg: "#101722",
  bgTop: "#151E2B",
  panel: "#192332",
  panelRaised: "#202C3E",
  well: "#0B111A",
  line: "rgba(225,235,250,.09)",
  text: "#F0F3F8",
  muted: "#8793A7",
  faint: "#657187",
  accent: "#91B5E9",
};

const PC = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, F: 5, "F#": 6, Gb: 6, G: 7,
  "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

const SHARP = [
  "C", "C♯", "D", "D♯", "E", "F",
  "F♯", "G", "G♯", "A", "A♯", "B",
];

const FLAT = [
  "C", "D♭", "D", "E♭", "E", "F",
  "G♭", "G", "A♭", "A", "B♭", "B",
];

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

function pitchClass(note) {
  const match = String(note).match(/^([A-G])([#b♯♭]?)/);
  if (!match) return null;

  const accidental = match[2]
    .replace("♯", "#")
    .replace("♭", "b");

  return PC[match[1] + accidental] ?? null;
}

function spellPitch(pc, preferFlat = false) {
  const scale = preferFlat ? FLAT : SHARP;
  return scale[((pc % 12) + 12) % 12];
}

function transposeRoot(root, fromKey, toKey) {
  const rootPc = pitchClass(root);
  const fromPc = pitchClass(fromKey);
  const toPc = pitchClass(toKey);

  if (rootPc === null || fromPc === null || toPc === null) {
    return root;
  }

  const preferFlat = /b|♭/.test(toKey);

  return spellPitch(
    rootPc + toPc - fromPc,
    preferFlat
  );
}

function transposeChord(chord, fromKey, toKey) {
  const match = String(chord).match(
    /^([A-G](?:#|b|♯|♭)?)(.*)$/
  );

  if (!match) return chord;

  return (
    transposeRoot(match[1], fromKey, toKey) +
    match[2]
  );
}

function transposeSheet(sheet, newKey) {
  const oldKey = sheet.key;

  return {
    ...sheet,
    key: newKey,
    sections: sheet.sections.map(section => ({
      ...section,

      notes: section.notes?.map(note =>
        transposeRoot(note, oldKey, newKey)
      ),

      chords: section.chords?.map(chord =>
        transposeChord(chord, oldKey, newKey)
      ),
    })),
  };
}

function nashvilleChord(chord, key, mode) {
  const match = String(chord).match(
    /^([A-G](?:#|b|♯|♭)?)(.*)$/
  );

  const tonic = pitchClass(key);

  if (!match || tonic === null) return chord;

  const root = pitchClass(match[1]);

  if (root === null) return chord;

  const scale = mode === "minor"
    ? MINOR_SCALE
    : MAJOR_SCALE;

  const intervals = mode === "minor"
    ? ["1", "2", "♭3", "4", "5", "♭6", "♭7"]
    : ["1", "2", "3", "4", "5", "6", "7"];

  const distance = (root - tonic + 12) % 12;

  let closest = 0;
  let smallestDifference = Infinity;

  scale.forEach((interval, index) => {
    const difference = Math.abs(interval - distance);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closest = index;
    }
  });

  let degree = intervals[closest];

  if (smallestDifference !== 0) {
    const accidental =
      distance < scale[closest] ? "♭" : "♯";

    degree = accidental + (closest + 1);
  }

  return degree + match[2];
}

function displayChord(chord, sheet, notation) {
  if (notation === "letters") return chord;

  return nashvilleChord(
    chord,
    sheet.key,
    sheet.mode
  );
}

function Icon({ name, size = 16 }) {
  const paths = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.4" />
        <path d="m16 16 4 4" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2" />
        <circle cx="15" cy="17" r="2" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    back: <path d="m14.5 5-7 7 7 7" />,
    sort: (
      <>
        <path d="M4 7h16M7 12h10M10 17h4" />
      </>
    ),
    grip: (
      <>
        <circle cx="8" cy="6" r="1" />
        <circle cx="16" cy="6" r="1" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="16" cy="12" r="1" />
        <circle cx="8" cy="18" r="1" />
        <circle cx="16" cy="18" r="1" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Preview({ sheet, notation, melodyNames }) {
  const section = sheet.sections[0];

  if (!section) return null;

  const source = section.chords || section.notes || [];

  const items = source.slice(0, 6).map(item => {
    if (section.chords) {
      return displayChord(item, sheet, notation);
    }

    if (notation === "numbers" && !melodyNames) {
      return item;
    }

    return item;
  });

  return (
    <div className={`preview preview-${section.kind}`}>
      {items.map((item, index) => (
        <span
          className={
            section.chords
              ? "preview-chord"
              : "preview-note"
          }
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SheetRow({
  sheet,
  active,
  notation,
  melodyNames,
  onSelect,
  onFavorite,
  onDragStart,
}) {
  return (
    <div
      className={`sheet-row ${active ? "is-active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      draggable
      onDragStart={onDragStart}
    >
      <span className="drag-handle">
        <Icon name="grip" size={13} />
      </span>

      <div className="sheet-title-block">
        <span className="sheet-title">
          {sheet.title}
        </span>

        <span className="sheet-meta">
          {sheet.sections.map(section => section.name).join(" · ")}
        </span>
      </div>

      <Preview
        sheet={sheet}
        notation={notation}
        melodyNames={melodyNames}
      />

      <button
        type="button"
        className={`favorite-button ${
          sheet.favorite ? "is-favorite" : ""
        }`}
        aria-label={
          sheet.favorite
            ? "Remove favorite"
            : "Add favorite"
        }
        onClick={event => {
          event.stopPropagation();
          onFavorite();
        }}
      >
        {sheet.favorite ? "★" : "☆"}
      </button>

      <span className="key-pill">
        {sheet.key}
      </span>

      <span className="row-chevron">
        <Icon name="chevron" size={14} />
      </span>
    </div>
  );
}

function SetTree({
  sets,
  selected,
  onSelect,
  onCreate,
  onMove,
  draggedSet,
  setDraggedSet,
}) {
  const children = useMemo(() => {
    const map = {};

    sets.forEach(set => {
      const key = set.parentId || "root";

      if (!map[key]) map[key] = [];

      map[key].push(set);
    });

    Object.values(map).forEach(items => {
      items.sort((a, b) => a.order - b.order);
    });

    return map;
  }, [sets]);

  function renderBranch(parentId = "root", depth = 0) {
    return (children[parentId] || []).map(set => (
      <React.Fragment key={set.id}>
        <button
          className={`set-row ${
            selected === set.id ? "selected" : ""
          }`}
          style={{
            "--depth": depth,
            "--set-color": set.color,
          }}
          onClick={() => onSelect(set.id)}
          draggable
          onDragStart={event => {
            setDraggedSet(set.id);
            event.dataTransfer.setData(
              "text/set-id",
              set.id
            );
          }}
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();

            const id =
              event.dataTransfer.getData("text/set-id") ||
              draggedSet;

            if (id && id !== set.id) {
              onMove(id, set.id);
            }

            setDraggedSet(null);
          }}
        >
          <span className="set-marker" />
          <span className="set-name">{set.name}</span>
          {(children[set.id] || []).length > 0 && (
            <span className="set-child-mark">⌄</span>
          )}
        </button>

        {renderBranch(set.id, depth + 1)}
      </React.Fragment>
    ));
  }

  return (
    <div className="set-tree">
      <button
        className={`set-row system-row ${
          selected === "all" ? "selected" : ""
        }`}
        onClick={() => onSelect("all")}
      >
        <span className="system-symbol">▦</span>
        <span className="set-name">All</span>
      </button>

      <button
        className={`set-row system-row ${
          selected === "favorites" ? "selected" : ""
        }`}
        onClick={() => onSelect("favorites")}
      >
        <span className="system-symbol">★</span>
        <span className="set-name">Favorites</span>
      </button>

      <div className="sets-divider" />

      {renderBranch()}

      <button
        className="new-set-row"
        onClick={onCreate}
      >
        <Icon name="plus" size={14} />
        New Set
      </button>
    </div>
  );
}

export default function SheetsHome({
  onBackToMixer = () => {},
  onOpenSheet = () => {},
}) {
  const [sheets, setSheets] = useState(INITIAL_SHEETS);
  const [sets, setSets] = useState(INITIAL_SETS);

  const [selectedSet, setSelectedSet] = useState("all");
  const [activeSheet, setActiveSheet] = useState(
    "midnight-drive"
  );

  const [query, setQuery] = useState("");
  const [notation, setNotation] = useState("letters");
  const [melodyNames, setMelodyNames] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sort, setSort] = useState("modified");
  const [sortOpen, setSortOpen] = useState(false);

  const [draggedSet, setDraggedSet] = useState(null);
  const [draggedSheet, setDraggedSheet] = useState(null);

  const visibleSheets = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = sheets.filter(sheet => {
      const inSet =
        selectedSet === "all" ||
        (
          selectedSet === "favorites"
            ? sheet.favorite
            : sheet.setIds.includes(selectedSet)
        );

      const inSearch =
        !q ||
        sheet.title.toLowerCase().includes(q) ||
        sheet.key.toLowerCase().includes(q) ||
        sheet.sections.some(section =>
          section.name.toLowerCase().includes(q) ||
          (section.chords || []).some(chord =>
            chord.toLowerCase().includes(q)
          )
        );

      return inSet && inSearch;
    });

    if (sort === "modified") {
      list.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    if (sort === "created") {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sort === "az") {
      list.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sort === "za") {
      list.sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }

    return list;
  }, [sheets, selectedSet, query, sort]);

  const matchingSets = useMemo(() => {
    const q = query.trim().toLowerCase();

    return q
      ? sets.filter(set =>
          set.name.toLowerCase().includes(q)
        )
      : [];
  }, [sets, query]);

  function toggleFavorite(id) {
    setSheets(current =>
      current.map(sheet =>
        sheet.id === id
          ? { ...sheet, favorite: !sheet.favorite }
          : sheet
      )
    );
  }

  function createSet() {
    const name = window.prompt("Set name");

    if (!name?.trim()) return;

    const id = `set-${Date.now()}`;

    setSets(current => [
      ...current,
      {
        id,
        name: name.trim(),
        parentId: null,
        color: COLORS.accent,
        order: current.length,
      },
    ]);

    setSelectedSet(id);
  }

  function moveSet(sourceId, targetId) {
    setSets(current =>
      current.map(set =>
        set.id === sourceId
          ? { ...set, parentId: targetId }
          : set
      )
    );
  }

  function addSheetToSet(setId) {
    if (!draggedSheet) return;

    setSheets(current =>
      current.map(sheet =>
        sheet.id === draggedSheet
          ? {
              ...sheet,
              setIds: sheet.setIds.includes(setId)
                ? sheet.setIds
                : [...sheet.setIds, setId],
            }
          : sheet
      )
    );

    setDraggedSheet(null);
  }

  function createSheet() {
    const id = `sheet-${Date.now()}`;

    const next = {
      id,
      title: "Untitled sheet",
      key: "C",
      mode: "major",
      favorite: false,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      setIds:
        selectedSet !== "all" &&
        selectedSet !== "favorites"
          ? [selectedSet]
          : [],
      sections: [
        {
          name: "Intro",
          kind: "harmonic",
          color: "#64748B",
          chords: [],
        },
      ],
    };

    setSheets(current => [next, ...current]);
    setActiveSheet(id);
  }

  return (
    <div className="sheets-root">
      <div className="sheets-canvas">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="back-button"
              onClick={onBackToMixer}
              aria-label="Back to mixer"
            >
              <Icon name="back" />
            </button>

            <div className="brand-label">
              <span className="brand-mark">Æ</span>
              <span>Sheets</span>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={15} />

              <input
                value={query}
                onChange={event =>
                  setQuery(event.target.value)
                }
                placeholder="Search all Sheets and Sets…"
              />
            </label>

            <button
              className={`settings-button ${
                settingsOpen ? "on" : ""
              }`}
              onClick={() =>
                setSettingsOpen(value => !value)
              }
              aria-label="Settings"
            >
              <Icon name="settings" size={17} />
            </button>
          </div>
        </header>

        <main className="library-layout">
          <aside className="sets-pane">
            <div className="pane-heading">
              <span>COLLECTIONS</span>

              <button
                onClick={createSet}
                aria-label="Create Set"
              >
                <Icon name="plus" size={14} />
              </button>
            </div>

            <SetTree
              sets={sets}
              selected={selectedSet}
              onSelect={setSelectedSet}
              onCreate={createSet}
              onMove={moveSet}
              draggedSet={draggedSet}
              setDraggedSet={setDraggedSet}
            />

            <div className="set-drop-hint">
              Drag a Sheet onto a Set to add it
            </div>
          </aside>

          <section
            className="sheets-pane"
            onDragOver={event => event.preventDefault()}
          >
            <div className="sheets-toolbar">
              <div className="current-heading">
                <span className="current-title">
                  {query
                    ? "Search results"
                    : selectedSet === "all"
                      ? "All Sheets"
                      : selectedSet === "favorites"
                        ? "Favorites"
                        : sets.find(
                            set => set.id === selectedSet
                          )?.name || "Sheets"}
                </span>

                <span className="count">
                  {visibleSheets.length}
                </span>
              </div>

              <div className="toolbar-actions">
                <div className="sort-wrap">
                  <button
                    className="sort-button"
                    onClick={() =>
                      setSortOpen(value => !value)
                    }
                  >
                    <Icon name="sort" size={14} />
                    <span>Sort</span>
                    <span className="sort-current">
                      {{
                        modified: "Recent",
                        created: "Created",
                        az: "A–Z",
                        za: "Z–A",
                      }[sort]}
                    </span>
                  </button>

                  {sortOpen && (
                    <div className="sort-menu">
                      {[
                        ["modified", "Recently modified"],
                        ["created", "Recently created"],
                        ["az", "Name A–Z"],
                        ["za", "Name Z–A"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={
                            sort === value ? "chosen" : ""
                          }
                          onClick={() => {
                            setSort(value);
                            setSortOpen(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="new-sheet-button"
                  onClick={createSheet}
                >
                  <Icon name="plus" size={14} />
                  New Sheet
                </button>
              </div>
            </div>

            {matchingSets.length > 0 && (
              <div className="search-set-results">
                <span className="search-group-label">
                  SETS
                </span>

                {matchingSets.map(set => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSet(set.id)}
                  >
                    <span
                      className="set-marker"
                      style={{ "--set-color": set.color }}
                    />
                    {set.name}
                    <Icon name="chevron" size={12} />
                  </button>
                ))}
              </div>
            )}

            <div className="sheet-list-heading">
              <span>SHEET</span>
              <span>PREVIEW</span>
              <span>KEY</span>
            </div>

            <div
              className="sheet-list"
              onDragOver={event => event.preventDefault()}
            >
              {visibleSheets.map(sheet => (
                <div
                  key={sheet.id}
                  onDragStart={() =>
                    setDraggedSheet(sheet.id)
                  }
                  onDragEnd={() => setDraggedSheet(null)}
                >
                  <SheetRow
                    sheet={sheet}
                    active={activeSheet === sheet.id}
                    notation={notation}
                    melodyNames={melodyNames}
                    onSelect={() => {
                      setActiveSheet(sheet.id);
                      onOpenSheet(sheet.id);
                    }}
                    onFavorite={() =>
                      toggleFavorite(sheet.id)
                    }
                  />
                </div>
              ))}

              {visibleSheets.length === 0 && (
                <div className="empty-state">
                  <strong>No Sheets found</strong>
                  <span>
                    {query
                      ? "Try another title, chord or Set name."
                      : "This collection is empty."}
                  </span>
                </div>
              )}
            </div>

            <div className="list-footer">
              <span>
                {visibleSheets.length} Sheets
              </span>
              <span>Click a row to open</span>
            </div>
          </section>
        </main>

        {settingsOpen && (
          <div className="settings-popover">
            <div className="popover-title">
              <strong>Sheets settings</strong>

              <button
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="setting-label">
              CHORD NOTATION
            </div>

            <div className="segmented">
              <button
                className={
                  notation === "letters" ? "active" : ""
                }
                onClick={() => setNotation("letters")}
              >
                Letters <small>A–G</small>
              </button>

              <button
                className={
                  notation === "numbers" ? "active" : ""
                }
                onClick={() => setNotation("numbers")}
              >
                Nashville <small>1–7</small>
              </button>
            </div>

            <div className="setting-label melody-label">
              MELODY IN NASHVILLE MODE
            </div>

            <button
              className="switch-row"
              onClick={() =>
                setMelodyNames(value => !value)
              }
              disabled={notation !== "numbers"}
            >
              <span>
                <strong>Keep note names</strong>
                <small>
                  Show C, D, E instead of scale degrees
                </small>
              </span>

              <span
                className={`switch ${
                  melodyNames && notation === "numbers"
                    ? "checked"
                    : ""
                }`}
              >
                <i />
              </span>
            </button>

            <p className="setting-note">
              Notation changes display only. Musical data
              and transposition remain separate.
            </p>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .sheets-root {
          width: 100%;
          height: 100%;
          min-height: 260px;
          overflow: hidden;
          background: ${COLORS.bg};
          font-family: Inter, system-ui, sans-serif;
          color: ${COLORS.text};
        }

        .sheets-canvas {
          width: 100%;
          height: 100%;
          min-width: 620px;
          padding: 15px 20px 16px;
          background:
            radial-gradient(
              ellipse at 55% -30%,
              rgba(143,181,233,.09),
              transparent 58%
            ),
            linear-gradient(
              180deg,
              ${COLORS.bgTop},
              ${COLORS.bg}
            );
        }

        .topbar {
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid ${COLORS.line};
          padding: 0 2px 10px;
        }

        .topbar-left,
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        button { font: inherit; }

        .back-button,
        .settings-button {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.1);
          background: linear-gradient(
            180deg,
            #2B384C,
            #1C2737
          );
          color: #DDE6F4;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08),
            0 2px 5px rgba(0,0,0,.24);
        }

        .back-button:active,
        .settings-button:active {
          transform: scale(.94);
        }

        .brand-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 750;
          letter-spacing: -.35px;
        }

        .brand-mark {
          font-family: Georgia, serif;
          font-size: 22px;
          color: ${COLORS.accent};
        }

        .search-box {
          width: 260px;
          height: 31px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 9px;
          background: rgba(7,12,19,.48);
          color: ${COLORS.muted};
        }

        .search-box:focus-within {
          border-color: rgba(145,181,233,.45);
          box-shadow: 0 0 0 2px rgba(145,181,233,.07);
        }

        .search-box input {
          min-width: 0;
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: ${COLORS.text};
          font-size: 11px;
        }

        .search-box input::placeholder {
          color: ${COLORS.faint};
        }

        .settings-button.on {
          border-color: rgba(145,181,233,.45);
          color: ${COLORS.accent};
        }

        .library-layout {
          height: calc(100% - 43px);
          display: grid;
          grid-template-columns: 28% minmax(0,1fr);
          padding-top: 13px;
          min-height: 0;
        }

        .sets-pane {
          position: relative;
          min-width: 0;
          padding: 0 15px 26px 2px;
          border-right: 1px solid ${COLORS.line};
          display: flex;
          flex-direction: column;
        }

        .pane-heading {
          height: 27px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0 8px 0 7px;
          color: ${COLORS.muted};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.15px;
        }

        .pane-heading button {
          border: 0;
          background: transparent;
          color: ${COLORS.muted};
          padding: 0;
          cursor: pointer;
        }

        .set-tree {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: auto;
          min-height: 0;
        }

        .set-row {
          position: relative;
          height: 30px;
          flex: none;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 8px 0
            calc(8px + var(--depth,0) * 14px);
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #AEB9CA;
          text-align: left;
          cursor: pointer;
          font-size: 11px;
        }

        .set-row:hover {
          background: rgba(255,255,255,.035);
          color: #fff;
        }

        .set-row.selected {
          background: linear-gradient(
            90deg,
            rgba(145,181,233,.16),
            rgba(145,181,233,.055)
          );
          color: #F2F6FC;
        }

        .set-row.selected::before {
          content: "";
          position: absolute;
          left: 2px;
          width: 2px;
          height: 18px;
          border-radius: 2px;
          background: ${COLORS.accent};
        }

        .set-marker {
          width: 7px;
          height: 7px;
          border-radius: 2px;
          background: var(--set-color);
          flex: none;
        }

        .set-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .set-child-mark {
          color: ${COLORS.faint};
          font-size: 13px;
        }

        .system-row { font-weight: 650; }

        .system-symbol {
          width: 7px;
          text-align: center;
          color: ${COLORS.muted};
          font-size: 12px;
        }

        .sets-divider {
          height: 1px;
          background: ${COLORS.line};
          margin: 7px 8px;
        }

        .new-set-row {
          height: 30px;
          margin: 7px 4px 0;
          padding: 0 7px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: ${COLORS.muted};
          font-size: 10px;
          text-align: left;
          cursor: pointer;
        }

        .new-set-row:hover {
          color: ${COLORS.accent};
          background: rgba(255,255,255,.035);
        }

        .set-drop-hint {
          position: absolute;
          bottom: 2px;
          left: 8px;
          color: #586579;
          font-size: 8px;
        }

        .sheets-pane {
          min-width: 0;
          padding-left: 17px;
          display: flex;
          flex-direction: column;
        }

        .sheets-toolbar {
          height: 35px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .current-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .current-title {
          font-size: 15px;
          font-weight: 760;
          letter-spacing: -.35px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .count {
          font-size: 9px;
          color: ${COLORS.muted};
          background: rgba(255,255,255,.06);
          padding: 3px 6px;
          border-radius: 99px;
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-wrap { position: relative; }

        .sort-button {
          height: 25px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 7px;
          background: rgba(255,255,255,.025);
          color: #B4C0D0;
          font-size: 9px;
          cursor: pointer;
        }

        .sort-current {
          color: ${COLORS.muted};
          margin-left: 2px;
        }

        .sort-menu {
          position: absolute;
          z-index: 5;
          right: 0;
          top: 29px;
          width: 145px;
          padding: 5px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 9px;
          background: #202B3B;
          box-shadow: 0 8px 22px rgba(0,0,0,.4);
        }

        .sort-menu button {
          width: 100%;
          padding: 7px 8px;
          border: 0;
          border-radius: 5px;
          text-align: left;
          background: transparent;
          color: #C4CEDD;
          font-size: 10px;
          cursor: pointer;
        }

        .sort-menu button:hover,
        .sort-menu button.chosen {
          background: rgba(145,181,233,.13);
          color: #fff;
        }

        .new-sheet-button {
          height: 25px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          border: 1px solid rgba(145,181,233,.28);
          border-radius: 7px;
          background: rgba(145,181,233,.12);
          color: #D8E7FA;
          font-size: 9px;
          font-weight: 650;
          cursor: pointer;
        }

        .new-sheet-button:hover {
          background: rgba(145,181,233,.2);
        }

        .sheet-list-heading {
          height: 24px;
          display: grid;
          grid-template-columns:
            minmax(120px,1fr)
            minmax(160px,1.1fr)
            42px;
          align-items: center;
          padding: 0 31px 0 13px;
          color: #647187;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          border-bottom: 1px solid ${COLORS.line};
        }

        .sheet-list-heading span:nth-child(2) {
          padding-left: 6px;
        }

        .sheet-list {
          min-height: 0;
          overflow: auto;
          display: flex;
          flex-direction: column;
        }

        .sheet-row {
          height: 47px;
          min-height: 47px;
          display: grid;
          grid-template-columns:
            13px
            minmax(115px,1fr)
            minmax(160px,1.1fr)
            24px
            39px
            13px;
          align-items: center;
          column-gap: 7px;
          padding: 0 7px 0 4px;
          border-bottom: 1px solid
            rgba(225,235,250,.075);
          background: transparent;
          cursor: pointer;
          transition: background .14s ease;
        }

        .sheet-row:hover {
          background: rgba(255,255,255,.027);
        }

        .sheet-row.is-active {
          background: linear-gradient(
            90deg,
            rgba(145,181,233,.12),
            rgba(145,181,233,.035)
          );
          box-shadow: inset 2px 0 0 ${COLORS.accent};
        }

        .drag-handle {
          color: #536177;
          display: grid;
          place-items: center;
          cursor: grab;
        }

        .sheet-title-block {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sheet-title {
          font-size: 11px;
          font-weight: 650;
          color: #E3E9F2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sheet-meta {
          font-size: 8px;
          color: #748197;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview {
          height: 28px;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
          padding: 0 7px;
          border-left: 1px solid
            rgba(255,255,255,.055);
        }

        .preview-chord,
        .preview-note {
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          white-space: nowrap;
        }

        .preview-chord {
          font-weight: 550;
          color: #CBD7E8;
        }

        .preview-note { color: #AFC4E2; }

        .preview-melodic .preview-note {
          position: relative;
          padding-top: 7px;
        }

        .preview-melodic .preview-note::before {
          content: "";
          position: absolute;
          top: 1px;
          left: 50%;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: ${COLORS.accent};
        }

        .preview-hybrid .preview-chord:nth-child(odd) {
          color: #E0C69B;
        }

        .favorite-button {
          width: 22px;
          height: 25px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #59667B;
          font-size: 15px;
          cursor: pointer;
        }

        .favorite-button:hover,
        .favorite-button.is-favorite {
          color: #D6B36E;
        }

        .key-pill {
          min-width: 34px;
          padding: 4px 5px;
          text-align: center;
          border-radius: 6px;
          background: linear-gradient(
            180deg,
            #303D52,
            #222E40
          );
          border: 1px solid rgba(255,255,255,.08);
          color: #E1EAF7;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          font-weight: 650;
        }

        .row-chevron {
          color: #59677C;
          display: grid;
          place-items: center;
        }

        .list-footer {
          height: 23px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #566276;
          font-size: 8px;
        }

        .empty-state {
          flex: 1;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: ${COLORS.muted};
        }

        .empty-state strong {
          font-size: 13px;
          color: #DDE5F0;
        }

        .empty-state span { font-size: 9px; }

        .search-set-results {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 25px;
          border-bottom: 1px solid ${COLORS.line};
        }

        .search-group-label {
          font-size: 8px;
          letter-spacing: 1px;
          color: ${COLORS.muted};
          font-weight: 800;
        }

        .search-set-results button {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: rgba(255,255,255,.04);
          border-radius: 5px;
          padding: 4px 7px;
          color: #CAD4E3;
          font-size: 9px;
          cursor: pointer;
        }

        .settings-popover {
          position: absolute;
          z-index: 10;
          top: 53px;
          right: 18px;
          width: 280px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 13px;
          background: linear-gradient(
            180deg,
            #253247,
            #182332
          );
          box-shadow:
            0 12px 28px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,255,255,.07);
        }

        .popover-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          font-size: 12px;
        }

        .popover-title button {
          width: 22px;
          height: 22px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.07);
          color: #D8E1EE;
          font-size: 16px;
          cursor: pointer;
        }

        .setting-label {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          color: ${COLORS.muted};
          margin-bottom: 7px;
        }

        .segmented {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          padding: 3px;
          border-radius: 8px;
          background: ${COLORS.well};
        }

        .segmented button {
          height: 30px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #9EABBF;
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
        }

        .segmented button small {
          font-family: "IBM Plex Mono", monospace;
          font-size: 8px;
          margin-left: 4px;
          opacity: .7;
        }

        .segmented button.active {
          background: linear-gradient(
            180deg,
            #3A4A65,
            #2B3950
          );
          color: #F2F6FC;
          box-shadow: 0 1px 3px rgba(0,0,0,.35);
        }

        .melody-label { margin-top: 15px; }

        .switch-row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0 2px;
          border: 0;
          background: transparent;
          text-align: left;
          color: #DDE5F0;
          cursor: pointer;
        }

        .switch-row:disabled {
          opacity: .42;
          cursor: default;
        }

        .switch-row > span:first-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .switch-row strong {
          font-size: 10px;
          font-weight: 600;
        }

        .switch-row small {
          font-size: 8px;
          color: ${COLORS.muted};
        }

        .switch {
          width: 28px;
          height: 16px;
          border-radius: 99px;
          background: #3A4658;
          padding: 2px;
          transition: background .16s;
        }

        .switch i {
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #CBD4E2;
          transition: transform .16s;
        }

        .switch.checked { background: #6489B8; }

        .switch.checked i {
          transform: translateX(12px);
          background: #fff;
        }

        .setting-note {
          margin: 12px 0 0;
          padding-top: 9px;
          border-top: 1px solid ${COLORS.line};
          font-size: 8px;
          line-height: 1.45;
          color: #7D8BA0;
        }

        @media (max-width: 700px) {
          .sheets-canvas {
            min-width: 0;
            padding: 12px;
          }

          .library-layout {
            grid-template-columns: 31% minmax(0,1fr);
          }

          .sets-pane { padding-right: 8px; }
          .sheets-pane { padding-left: 9px; }

          .search-box { width: 190px; }

          .sheet-row {
            grid-template-columns:
              0
              minmax(90px,1fr)
              minmax(105px,1fr)
              20px
              34px
              10px;
            column-gap: 4px;
          }

          .drag-handle { display: none; }
          .preview { gap: 7px; }
        }
      `}</style>
    </div>
  );
}
