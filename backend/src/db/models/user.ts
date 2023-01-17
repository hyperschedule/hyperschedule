import { Schema, model } from "mongoose";
import type {
    User as UserType,
    UserSchedule,
} from "hyperschedule-shared/api/v4";
import { v4 as uuid4 } from "uuid";
import { CURRENT_TERM } from "../../current-term";

const DEFAULT_SCHEDULE_NAME = "schedule1";

const scheduleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sections: [
            {
                identifier: {
                    department: {
                        type: String,
                        required: true,
                    },
                    courseNumber: {
                        type: Number,
                        required: true,
                    },
                    suffix: {
                        type: String,
                        required: true,
                    },
                    affiliation: {
                        type: String,
                        required: true,
                    },
                    sectionNumber: {
                        type: Number,
                        required: true,
                    },
                    year: { type: Number, required: true },
                    term: { type: String, required: true },
                    half: { type: String, required: true },
                },
                selected: Boolean,
            },
        ],
    },
    { _id: false, minimize: false },
);

const termSchema = new Schema<Record<string, Record<string, UserSchedule>>>(
    {
        term: { type: String, required: true },
        schedules: { type: Map, of: scheduleSchema, required: true },
    },
    { _id: false, minimize: false },
);

export const userSchema = new Schema<UserType>(
    {
        _id: { type: String, default: uuid4 },
        terms: {
            type: Map,
            of: {
                type: termSchema,
            },
            required: true,
        },
        activeSchedule: { type: String, default: DEFAULT_SCHEDULE_NAME },
        activeTerm: { type: String, default: CURRENT_TERM },
    },
    { minimize: false },
);

export const User = model("user", userSchema);
