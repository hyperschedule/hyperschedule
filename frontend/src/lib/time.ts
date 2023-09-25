export function formatTime24(secondsSinceMidnight: number) {
    const hour = Math.floor(secondsSinceMidnight / 3600);
    const minute = Math.floor((secondsSinceMidnight % 3600) / 60);
    return `${hour}:${minute.toString().padStart(2, "0")}`;
}

export function formatTime12(secondsSinceMidnight: number) {
    const hour = Math.floor(secondsSinceMidnight / 3600);
    const minute = Math.floor((secondsSinceMidnight % 3600) / 60);
    if (hour > 11)
        return `${hour === 12 ? 12 : hour - 12}:${minute
            .toString()
            .padStart(2, "0")}pm`;
    return `${hour}:${minute.toString().padStart(2, "0")}am`;
}
