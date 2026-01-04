import React from "react";

const Leaderboard = ({ users }) => {
    // Styles for top 3 positions
    const getRankStyle = (index) => {
        if (index === 0)
            return {
                borderLeft: "4px solid #FFD700",
                bg: "bg-warning bg-opacity-10",
            }; // Gold
        if (index === 1)
            return {
                borderLeft: "4px solid #C0C0C0",
                bg: "bg-secondary bg-opacity-10",
            }; // Silver
        if (index === 2)
            return {
                borderLeft: "4px solid #CD7F32",
                bg: "bg-danger bg-opacity-10",
            }; // Bronze
        return { borderLeft: "4px solid transparent", bg: "bg-white" };
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-bold d-flex align-items-center gap-2">
                <span>🏆</span> Top Contributors
            </div>
            <div className="list-group list-group-flush">
                {users && users.length > 0 ? (
                    users.map((user, index) => {
                        const style = getRankStyle(index);
                        return (
                            <div
                                key={user.id}
                                className={`list-group-item d-flex align-items-center justify-content-between py-3 ${style.bg}`}
                                style={{ borderLeft: style.borderLeft }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="fw-bold text-muted"
                                        style={{ width: "20px" }}
                                    >
                                        #{index + 1}
                                    </div>
                                    <div
                                        className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div
                                            className="fw-bold text-dark"
                                            style={{ fontSize: "0.95rem" }}
                                        >
                                            {user.name}
                                        </div>
                                        <div
                                            className="small text-muted"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {user.department || "General"}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-end">
                                    <div className="fw-bold text-primary">
                                        {user.points} pts
                                    </div>
                                    <div className="d-flex justify-content-end gap-1 mt-1">
                                        {user.badges &&
                                            user.badges.map((b) => (
                                                <span
                                                    key={b.id}
                                                    title={b.name}
                                                    style={{ cursor: "help" }}
                                                >
                                                    {b.icon}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-4 text-center text-muted small">
                        No contributions yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
