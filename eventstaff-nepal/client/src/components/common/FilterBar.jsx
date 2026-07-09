import { useTranslation } from "react-i18next";
import { ROLES } from "../../utils/constants";

const FilterLabel = ({ children }) => (
  <label
    className="block text-xs font-semibold uppercase tracking-widest mb-2"
    style={{
      color: "var(--text-dim)",
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    {children}
  </label>
);

export default function FilterBar({
  filters,
  onFilterChange,
  isOrganizer,
  onSearchSubmit,
  onClearFilters,
}) {
  const { t } = useTranslation();

  return (
    <div className="glass-card p-6 animate-fade-in border border-[color:var(--border)] rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <span className="label text-[0.65rem]">
          {t("common.filters", "Filters")}
        </span>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs transition-colors duration-150 text-[color:var(--text-dim)] hover:text-[color:var(--accent)]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            {t("common.clear_all", "Clear all")}
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit();
        }}
        className="mb-6"
      >
        <FilterLabel>{t("common.search", "Search")}</FilterLabel>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder={
              isOrganizer ? "Name, skills..." : "Event name, location..."
            }
            className="input-field w-full text-sm pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 text-[color:var(--text-dim)] hover:text-[color:var(--accent)]"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      <div className="space-y-5">
        <div>
          <FilterLabel>{isOrganizer ? "Skills" : "Role Type"}</FilterLabel>
          <div className="relative">
            <select
              value={filters.role || ""}
              onChange={(e) => onFilterChange("role", e.target.value)}
              className="input-field w-full text-sm cursor-pointer"
            >
              <option
                value=""
                className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
              >
                {isOrganizer ? "All Skills" : "All Roles"}
              </option>
              {ROLES.map((r) => (
                <option
                  key={r}
                  value={r}
                  className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                >
                  {r}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-dim)]">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {!isOrganizer && (
          <div>
            <FilterLabel>{t("common.date", "Date")}</FilterLabel>
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => onFilterChange("date", e.target.value)}
              className="input-field w-full text-sm"
              style={{ colorScheme: "dark light" }}
            />
          </div>
        )}

        {isOrganizer && (
          <>
            <div>
              <FilterLabel>{t("common.rating", "Rating")}</FilterLabel>
              <div className="relative">
                <select
                  value={filters.rating || ""}
                  onChange={(e) => onFilterChange("rating", e.target.value)}
                  className="input-field w-full text-sm cursor-pointer"
                >
                  <option
                    value=""
                    className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                  >
                    {t("common.any_rating", "Any Rating")}
                  </option>
                  <option
                    value="4"
                    className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                  >
                    4+ Stars
                  </option>
                  <option
                    value="3"
                    className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                  >
                    3+ Stars
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-dim)]">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <FilterLabel>
                {t("common.availability", "Availability")}
              </FilterLabel>
              <div className="relative">
                <select
                  value={filters.availability || ""}
                  onChange={(e) =>
                    onFilterChange("availability", e.target.value)
                  }
                  className="input-field w-full text-sm cursor-pointer"
                >
                  <option
                    value=""
                    className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                  >
                    {t("common.any_status", "Any Status")}
                  </option>
                  <option
                    value="available"
                    className="bg-[color:var(--card-bg)] text-[color:var(--text-main)]"
                  >
                    {t("common.available_now", "Available Now")}
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-dim)]">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
