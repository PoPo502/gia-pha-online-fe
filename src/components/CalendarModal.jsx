import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { calendarService } from "../services/calendar.service.js";
import { formatError } from "../lib/api.js";
import { Solar, Lunar } from "lunar-javascript";

export default function CalendarModal({ isOpen, onClose }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [anniversaries, setAnniversaries] = useState([]);
    const [birthdays, setBirthdays] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // Tính toán danh sách ngày cần hiển thị trên lưới lịch (Từ T2 -> CN)
    const getDaysInMonthForGrid = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const days = [];

        // Điều chỉnh t2 -> cn. getDay() trả về CN=0, T2=1... 
        // Lịch VN: T2 là đầu tuần.
        let startPadding = firstDayOfMonth.getDay() - 1;
        if (startPadding < 0) startPadding = 6; // Nếu là CN thì thụt vào 6 ô

        // Những ngày của tháng trước (in mờ)
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year: year,
                isCurrentMonth: false
            });
        }

        // Những ngày của tháng hiện tại
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({
                day: i,
                month: month,
                year: year,
                isCurrentMonth: true
            });
        }

        // Những ngày của tháng sau để cho tròn lưới (thường là 42 ô = 6 hàng)
        const currentGridSize = days.length;
        const totalCells = Math.ceil(currentGridSize / 7) * 7;
        const remaining = totalCells - currentGridSize;

        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                month: month + 1,
                year: year,
                isCurrentMonth: false
            });
        }

        // Bổ sung thông tin Âm Lịch cho mỗi ngày
        return days.map(d => {
            const solarDate = new Date(d.year, d.month, d.day);
            const solar = Solar.fromDate(solarDate);
            const lunar = solar.getLunar();

            // Xử lý hiển thị ngày Âm: mùng 1 nên hiện "1/Tháng", các ngày khác hiện số
            let lunarLabel = lunar.getDay().toString();
            if (lunar.getDay() === 1) {
                lunarLabel = `1/${lunar.getMonth()}${lunar.getMonth() < 0 ? ' (Nhuận)' : ''}`;
            }

            return {
                ...d,
                lunarDay: lunar.getDay(),
                lunarMonth: lunar.getMonth(),
                lunarYear: lunar.getYear(),
                lunarLabel: lunarLabel,
                isToday: solarDate.toDateString() === new Date().toDateString()
            };
        });
    };

    const daysGrid = getDaysInMonthForGrid(currentDate);

    // Tải sự kiện giỗ chạp trong tháng
    useEffect(() => {
        if (!isOpen) return;

        const loadMonthEvents = async () => {
            setLoadingEvents(true);
            try {
                // Gọi api lay ngay giỗ và sinh nhật (backend đang dùng tham số month)
                const monthParam = currentDate.getMonth() + 1; // Backend thường xài 1-12
                const [anniv, birth] = await Promise.all([
                    calendarService.anniversaries(monthParam),
                    calendarService.birthdays(monthParam)
                ]);
                setAnniversaries(anniv || []);
                setBirthdays(birth || []);
            } catch (e) {
                console.error(formatError(e));
            } finally {
                setLoadingEvents(false);
            }
        };

        loadMonthEvents();
    }, [currentDate, isOpen]);


    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    if (!isOpen) return null;

    const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    return (
        <div className="modal-overlay" style={{ zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="modal-content" style={{ maxWidth: 900, width: "95%", borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", maxHeight: "90vh", overflowY: "auto" }}>
                <div className="modal-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ background: "var(--primary-light)", color: "var(--primary)", width: 44, height: 44 }}>
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-dark)" }}>Lịch Âm Toàn Tập</h3>
                            <div className="small" style={{ color: "var(--text-light)" }}>Tra cứu lịch vạn niên và sự kiện dòng họ</div>
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-light)" }}>
                        <X size={28} />
                    </button>
                </div>

                <div className="row" style={{ alignItems: "flex-start", gap: 32 }}>
                    {/* KHU VỰC LỊCH GRID */}
                    <div style={{ flex: 2 }}>
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: 24, color: "var(--text-dark)" }}>
                                Tháng {currentDate.getMonth() + 1}, Năm {currentDate.getFullYear()}
                            </h2>
                            <div className="row" style={{ gap: 8 }}>
                                <button className="btn outline" onClick={goToToday} style={{ borderRadius: 8 }}>Hôm nay</button>
                                <button className="btn outline" onClick={prevMonth} style={{ borderRadius: 8, padding: "8px" }}><ChevronLeft size={20} /></button>
                                <button className="btn outline" onClick={nextMonth} style={{ borderRadius: 8, padding: "8px" }}><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        {/* Tiêu đề Ngày trong tuần */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "8px" }}>
                            {WEEKDAYS.map(day => (
                                <div key={day} style={{ textAlign: "center", fontWeight: 700, color: (day === "CN" || day === "T7") ? "var(--danger)" : "var(--text-light)", fontSize: 13 }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Các ô ngày */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                            {daysGrid.map((d, index) => {
                                // Kiểm tra xem ngày này có sự kiện nào ko (giả lập highlight)
                                const isWeekend = index % 7 === 5 || index % 7 === 6;

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            position: "relative",
                                            padding: "8px",
                                            borderRadius: "12px",
                                            border: d.isToday ? "2px solid var(--primary)" : "1px solid var(--border)",
                                            background: d.isToday ? "var(--primary-light)" : "var(--surface)",
                                            minHeight: "80px",
                                            opacity: d.isCurrentMonth ? 1 : 0.4,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = d.isToday ? "var(--primary)" : "var(--border)"; }}
                                    >
                                        <div style={{ fontSize: 22, fontWeight: 700, color: isWeekend ? "var(--danger)" : "var(--text-dark)", lineHeight: 1 }}>
                                            {d.day}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: d.lunarDay === 1 || d.lunarDay === 15 ? "var(--primary)" : "var(--text-light)", marginTop: 6 }}>
                                            {d.lunarLabel}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* KHU VỰC SỰ KIỆN TRONG THÁNG */}
                    <div style={{ flex: 1, borderLeft: "1px solid var(--border)", paddingLeft: 32 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 20, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8 }}>
                            <Gift size={20} color="var(--primary)" />
                            Sự kiện tháng {currentDate.getMonth() + 1}
                        </h3>

                        {loadingEvents ? (
                            <div className="small" style={{ color: "var(--text-light)" }}>Đang tải...</div>
                        ) : (
                            <div className="stack" style={{ gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                                        LỊCH GIỖ
                                    </div>
                                    {anniversaries.length > 0 ? (
                                        anniversaries.map((a, idx) => (
                                            <div key={idx} style={{ padding: "12px", background: "var(--surface-hover)", borderRadius: 8, marginBottom: 8 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>Ngày Âm: {a.lunarDay}/{a.lunarMonth}</div>
                                                <div style={{ fontSize: 14, color: "var(--text-dark)" }}>{a.title}</div>
                                            </div>
                                        ))
                                    ) : <div className="small" style={{ color: "var(--text-light)" }}>Không có ngày giỗ nào.</div>}
                                </div>

                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                                        SINH NHẬT
                                    </div>
                                    {birthdays.length > 0 ? (
                                        birthdays.map((b, idx) => (
                                            <div key={idx} style={{ padding: "12px", background: "rgba(14, 165, 233, 0.05)", borderLeft: "3px solid #0ea5e9", borderRadius: 8, marginBottom: 8 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: "#0ea5e9", marginBottom: 4 }}>Ngày {b.solarDay}/{b.solarMonth}</div>
                                                <div style={{ fontSize: 14, color: "var(--text-dark)" }}>{b.title}</div>
                                            </div>
                                        ))
                                    ) : <div className="small" style={{ color: "var(--text-light)" }}>Không có sinh nhật nào.</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
