export const STATUS_COLORS = {
  Completed: "#3CD856",
  Pending: "#FFCF23",
  Overdue: "#FF4D6D",
};

export const RISK_COLORS = {
  Low: "#FF4D6D",
  High: "#6C63FF",
};

export const CHART_COLORS = {
  ink: "#1F2559",
  muted: "#8B91B2",
  purple: "#6C63FF",
  violet: "#A855F7",
  blue: "#2EA7FF",
  green: "#3CD856",
  red: "#FF4D6D",
  yellow: "#FFCF23",
  orange: "#FF8A65",
  mint: "#28D9B1",
  grid: "#EEF1F8",
  panel: "#FFFFFF",
  canvas: "#F8FAFF",
};

export function hasChartData(data) {
  return (
    Array.isArray(data) &&
    data.some((item) =>
      Object.values(item).some((value) => Number(value) > 0),
    )
  );
}

export const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #EEF1F8",
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(31, 37, 89, 0.12)",
  color: CHART_COLORS.ink,
};
