import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "@/services/apiService";
import { ToastContainer, toast } from "react-toastify";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import Leaderboard from "./LeaderBoard";

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Chart Data States ---
    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);

    // --- Colors for Charts ---
    const COLORS = ["#20c997", "#6c757d", "#ffc107", "#dc3545"]; // Teal, Grey, Yellow, Red

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);

                // 1. Prepare Pie Chart Data (Distribution)
                setPieData([
                    { name: "Published", value: data.counts.published },
                    { name: "Drafts", value: data.counts.drafts },
                ]);

                // 2. Prepare Bar Chart Data (Action Items)
                setBarData([
                    {
                        name: "Pending Review",
                        value: data.counts.pending,
                        color: "#ffc107",
                    },
                    {
                        name: "Flagged / Outdated",
                        value: data.counts.flagged,
                        color: "#dc3545",
                    },
                ]);
            } catch (error) {
                console.error("Dashboard error:", error);
                toast.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getStatusBadge = (status) => {
        const map = {
            PUBLISHED: "bg-success",
            PENDING_REVIEW: "bg-warning text-dark",
            DRAFT: "bg-secondary",
            FLAGGED_OUTDATED: "bg-danger",
        };
        return map[status] || "bg-light text-dark border";
    };

    if (loading)
        return (
            <div className="p-5 text-center text-muted">
                Loading command center...
            </div>
        );

    return (
        <div className="container-fluid p-4">
            <ToastContainer />

            <div className="mb-4">
                <h3 className="fw-bold text-dark">Overview</h3>
                <p className="text-muted">
                    Welcome to the Digital Knowledge Network (DKN) System
                </p>
            </div>

            {/* --- 1. KPI Cards --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div
                        className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: "4px solid #003366" }}
                    >
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">
                                Total Users
                            </h6>
                            <h2 className="mb-0 fw-bold text-dark">
                                {stats?.counts.users}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <Leaderboard users={stats?.leaderboard} />
                </div>
                <div className="col-md-3">
                    <div
                        className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: "4px solid #20c997" }}
                    >
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">
                                Total Assets
                            </h6>
                            <h2 className="mb-0 fw-bold text-dark">
                                {stats?.counts.assets}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div
                        className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: "4px solid #ffc107" }}
                    >
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">
                                Pending Review
                            </h6>
                            <h2 className="mb-0 fw-bold text-dark">
                                {stats?.counts.pending}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div
                        className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: "4px solid #dc3545" }}
                    >
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">
                                Flagged Issues
                            </h6>
                            <h2 className="mb-0 fw-bold text-dark">
                                {stats?.counts.flagged}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. ANALYTICS GRAPHS (New Section) --- */}
            <div className="row g-4 mb-4">
                {/* GRAPH 1: Pie Chart (Content Health) */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 fw-bold">
                            📖 Content Distribution
                        </div>
                        <div className="card-body" style={{ height: "300px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* GRAPH 2: Bar Chart (Action Items) */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 fw-bold">
                            ⚠️ Governance Action Items
                        </div>
                        <div className="card-body" style={{ height: "300px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        stroke="#8884d8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <Tooltip cursor={{ fill: "transparent" }} />
                                    <Bar
                                        dataKey="value"
                                        name="Count"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. Recent Activity Table --- */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Recent Uploads</h6>
                    <Link
                        to="/dashboard/assets"
                        className="small text-decoration-none"
                    >
                        View All &rarr;
                    </Link>
                </div>
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase">
                                <th className="ps-4">Asset Title</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recent_activity.length > 0 ? (
                                stats.recent_activity.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4">
                                            <Link
                                                to={`/dashboard/assets/${item.id}`}
                                                className="fw-bold text-dark text-decoration-none"
                                            >
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="small">{item.author}</td>
                                        <td>
                                            <span
                                                className={`badge ${getStatusBadge(
                                                    item.status
                                                )} fw-normal`}
                                            >
                                                {item.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="small text-muted">
                                            {item.date}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-4 text-muted"
                                    >
                                        No recent activity.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
