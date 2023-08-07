export function formatTime24(secondsSinceMidnight: number) {
    const hour = Math.floor(secondsSinceMidnight / 3600);
    const minute = Math.floor((secondsSinceMidnight % 3600) / 60);
    return `${hour}:${minute.toString().padStart(2, "0")}`;
}
