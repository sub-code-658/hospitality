import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import EventCard from "../components/events/EventCard";
import StaffCard from "../components/StaffCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import InviteModal from "../components/InviteModal";
import FilterBar from "../components/common/FilterBar";
import { ROLES } from "../utils/constants";

export default function EventsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const isOrganizer = user?.role === "organizer" || user?.role === "admin";
  const pageTitle = isOrganizer ? "Find Staff" : "Browse Events";
  const pageSubtitle = isOrganizer
    ? "Discover and invite talented hospitality professionals"
    : "Find and apply to upcoming hospitality opportunities across Nepal";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    role: searchParams.get("role") || "",
    date: searchParams.get("date") || "",
    status: "active",
    rating: "",
    availability: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleInvite = (worker) => {
    setSelectedWorker(worker);
    setIsInviteModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [filters, pagination.currentPage, isOrganizer]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      params.append("page", pagination.currentPage);
      params.append("limit", 12);

      if (isOrganizer) {
        if (filters.role) params.append("skills", filters.role);
        if (filters.rating) params.append("rating", filters.rating);
        if (filters.availability)
          params.append("availability", filters.availability);
        const res = await api.get(`/auth/workers?${params.toString()}`);
        setItems(res.data.workers || []);
        if (res.data.totalPages)
          setPagination({
            currentPage: res.data.page,
            totalPages: res.data.totalPages,
            totalCount: res.data.total,
          });
      } else {
        if (filters.role) params.append("role", filters.role);
        if (filters.date) params.append("date", filters.date);
        if (filters.status) params.append("status", filters.status);
        const res = await api.get(`/events?${params.toString()}`);
        setItems(res.data.events || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch {
      addToast(`Failed to load ${isOrganizer ? "staff" : "events"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      role: "",
      date: "",
      status: "active",
      rating: "",
      availability: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const FilterLabel = ({ children }) => (
    <label
      className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "#6b7280", fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      {children}
    </label>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <p className="label mb-3">{t("common.explore", "Explore")}</p>
        <h1
          className="font-serif mb-2"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "var(--text)",
            fontWeight: 400,
            lineHeight: 1.1,
          }}
        >
          {pageTitle}
        </h1>
        <p
          className="text-sm"
          style={{
            color: "var(--text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {pageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearchSubmit={fetchData}
              onClearFilters={clearFilters}
              isOrganizer={isOrganizer}
            />

            {/* Post event CTA for organisers */}
            {isOrganizer && (
              <Link
                to="/post-event"
                className="btn-primary w-full mt-8 py-3 text-xs text-center inline-block"
              >
                + Post Event
              </Link>
            )}
          </div>
        </aside>

        {/* Results grid */}
        <div className="lg:col-span-3">
          {/* Result count */}
          {!loading && items.length > 0 && (
            <p
              className="text-xs mb-5"
              style={{
                color: "var(--text-dim)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {pagination.totalCount}{" "}
              {isOrganizer
                ? "staff"
                : `event${pagination.totalCount !== 1 ? "s" : ""}`}{" "}
              found
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon="◆"
              title={isOrganizer ? "No staff found" : "No events found"}
              description="Try adjusting your filters or check back later for new opportunities."
              action={clearFilters}
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((item, i) => (
                  <div
                    key={item._id || item.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
                  >
                    {isOrganizer ? (
                      <StaffCard
                        worker={item}
                        onInvite={() => handleInvite(item)}
                      />
                    ) : (
                      <EventCard event={item} />
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage - 1,
                      }))
                    }
                    disabled={pagination.currentPage === 1}
                    className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-30"
                  >
                    {t("common.previous", "← Previous")}
                  </button>
                  <span
                    className="text-xs px-4"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage + 1,
                      }))
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-30"
                  >
                    {t("common.next", "Next →")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        worker={selectedWorker}
      />
    </div>
  );
}
