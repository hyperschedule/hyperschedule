export type School = "POM" | "HMC" | "PTZ" | "CMC" | "SCR" | "KGI" | "CGU"
export type Term = "FA" | "SU" | "SP"
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
export type LogicType = "AND" | "OR" | "NOT"
export type RequisiteType = "Pre" | "Co"

export type Course = {
    title: string
    description: string
    courseCode: string
    sectionNumber: number

    term: Term
    year: number
    school: School
    credits: number
    permCount: number

    seatsTotal: number
    // seats available will be capped at 0. No negative seats
    seatsAvailable: number
    seatsTaken: number

    schedules: Schedule[]

    // "yyyy:mm:dd"
    startDate: string
    // "yyyy:mm:dd"
    endDate: string

    notes: string

    instructors: Instructor[]

    requisite: Requisite
}

export type Schedule = {
    // "hh:mm:ss"
    startTime: string
    // "hh:mm:ss"
    endTime: string

    days: Weekday[]
    location: Location
}

export type Location = {
    buildingName: string
    school: School
    roomName: string
}

export type Instructor = {
    name: string
    email: string
}

export type Requisite = {
    course: string
    term: Term
    year: number
    logicGroup: LogicGroup | null
}

type RequisiteCourse = {
    type: "Requisite"
    requisiteType: RequisiteType
    courseCode: string
}

type SectionRequirement = {
    type: "Section"
    info: string
}

export type LogicGroup = {
    type: "LogicGroup"
    logicType: LogicType
    items: LogicGroupItem[]
}

type LogicGroupItem = LogicGroup | RequisiteCourse|SectionRequirement
