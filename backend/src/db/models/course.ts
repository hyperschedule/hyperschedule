import type * as APIv4 from "hyperschedule-shared/api/v4";
import { Schema, model } from "mongoose";
// mongo db wants the primary key to specifically be named _id
export type DBSection = Omit<APIv4.Section, "identifier"> & {
    _id: APIv4.SectionIdentifier;
};

export const courseSchema = new Schema<APIv4.Course>({
    title: String,
    description: String,
    code: {
        department: String,
        courseNumber: Number,
        suffix: String,
        affiliation: String,
    },
    primaryAssociation: String,
    potentialError: Boolean,
});
export const scheduleSchema = new Schema<APIv4.Schedule>({
    startTime: Number,
    endTime: Number,
    days: [String],
    locations: [String],
});

export const sectionSchema = new Schema<DBSection>({
    _id: {
        department: String,
        courseNumber: Number,
        suffix: String,
        affiliation: String,
        sectionNumber: Number,
        year: Number,
        term: String,
        half: String,
    },
    course: courseSchema,
    courseAreas: [String],
    schedules: [scheduleSchema],
    permCount: Number,
    seatsFilled: Number,
    seatsTotal: Number,
    status: String,
    startDate: {
        year: Number,
        month: Number,
        day: Number,
    },
    endDate: {
        year: Number,
        month: Number,
        day: Number,
    },
    instructors: [
        {
            name: String,
        },
    ],
    potentialError: Boolean,
    credits: Number,
});

export const Section = model<DBSection>("Section", sectionSchema);
