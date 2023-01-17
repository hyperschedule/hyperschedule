import type * as APIv4 from "hyperschedule-shared/api/v4";
import { Schema, model } from "mongoose";
// mongo db wants the primary key to specifically be named _id
export type DBSection = Omit<APIv4.Section, "identifier"> & {
    _id: APIv4.SectionIdentifier;
};
// allows empty string
Schema.Types.String.checkRequired((v) => v !== null);

export const courseSchema = new Schema<APIv4.Course>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        code: {
            department: { type: String, required: true },
            courseNumber: { type: Number, required: true },
            suffix: { type: String, required: true },
            affiliation: { type: String, required: true },
        },
        primaryAssociation: { type: String, required: true },
        potentialError: { type: Boolean, required: true },
    },
    { _id: false },
);

export const sectionSchema = new Schema<DBSection>({
    _id: {
        department: { type: String, required: true },
        courseNumber: { type: Number, required: true },
        suffix: { type: String, required: true },
        affiliation: { type: String, required: true },
        sectionNumber: { type: Number, required: true },
        year: { type: Number, required: true },
        term: { type: String, required: true },
        half: { type: String, required: true },
    },
    course: courseSchema,
    courseAreas: { type: [String], required: true },
    schedules: [
        {
            type: {
                startTime: { type: Number, required: true },
                endTime: { type: Number, required: true },
                days: { type: [String], required: true },
                locations: { type: [String], required: true },
            },
            required: true,
        },
    ],
    permCount: { type: Number, required: true },
    seatsFilled: { type: Number, required: true },
    seatsTotal: { type: Number, required: true },
    status: { type: String, required: true },
    startDate: {
        year: { type: Number, required: true },
        month: { type: Number, required: true },
        day: { type: Number, required: true },
    },
    endDate: {
        year: { type: Number, required: true },
        month: { type: Number, required: true },
        day: { type: Number, required: true },
    },
    instructors: [
        {
            name: { type: String, required: true },
        },
    ],
    potentialError: { type: Boolean, required: true },
    credits: { type: Number, required: true },
});

export const Section = model<DBSection>("Section", sectionSchema);
