package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

type env struct {
	db *pgxpool.Pool
}

func (env *env) handler(
	ctx context.Context,
	req events.APIGatewayProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	resp, err := env.fetchV3(ctx)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "sorry something went wrong",
		}, err
	}

	body, err := json.Marshal(resp)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "failed to serialize json",
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(body),
	}, nil
}

func main() {
	pool, err := pgxpool.Connect(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatalf("failed to initialize db connection: %v", err)
	}

	env := &env{
		db: pool,
	}

	lambda.Start(env.handler)
}

type V3 struct {
	Data  *V3CourseData `json:"data"`
	Until int64         `json:"until"`
	Error *string       `json:"error"`
	Full  bool          `json:"full"`
}

type V3CourseData struct {
	Terms   map[string]*V3Term   `json:"terms"`
	Courses map[string]*V3Course `json:"courses"`
}

type V3Term struct {
	Code    string        `json:"termCode"`
	SortKey []interface{} `json:"termSortKey"`
	Name    string        `json:"termName"`
}

type V3Course struct {
	Code               string        `json:"courseCode"`
	Name               string        `json:"courseName"`
	SortKey            []interface{} `json:"courseSortKey"`
	MutualExclusionKey []interface{} `json:"courseMutualExclusionKey"`
	Description        string        `json:"courseDescription"`
	Instructors        []string      `json:"courseInstructors"`
	Term               string        `json:"courseTerm"`
	Schedule           []*V3Schedule `json:"courseSchedule"`
	Credits            float32       `json:"courseCredits"`
	SeatsTotal         int           `json:"courseSeatsTotal"`
	SeatsFilled        int           `json:"courseSeatsFilled"`
	WaitlistLength     *int          `json:"courseWaitlistLength"`
	EnrollmentStatus   string        `json:"courseEnrollmentStatus"`
}

type V3Schedule struct {
	Days      string `json:"scheduleDays"`
	StartTime string `json:"scheduleStartTime"`
	EndTime   string `json:"scheduleEndTime"`
	StartDate string `json:"scheduleStartDate"`
	EndDate   string `json:"scheduleEndDate"`
	TermCount int    `json:"scheduleTermCount"`
	Terms     []int  `json:"scheduleTerms"`
	Location  string `json:"scheduleLocation"`
}

func v3ScheduleLess(s1, s2 *V3Schedule) bool {
	return s1.Days < s2.Days || s1.Days == s2.Days &&
		(s1.StartTime < s2.StartTime || s1.StartTime == s2.StartTime &&
			(s1.EndTime < s2.EndTime || s1.EndTime == s2.EndTime &&
				s1.Location <= s2.Location))
}

func (e *env) fetchV3(ctx context.Context) (*V3, error) {
	semester := "FA2021"

	// we get very early preview data, which means the "latest" detected semester
	// might actually be SP2022 when we want FA2021, so for now this
	// detect-latest thing, while smart, isn't what we want, and I can't think of
	// anything much better than hard-code the "current" semester

	//rowsLatest, err := tx.Query(`
	//  SELECT "semester" FROM "term"
	//  ORDER BY "date_end" DESC, "date_start" ASC
	//  LIMIT 1;
	//`)
	//if err != nil {
	//	return nil, fmt.Errorf("failed to retrieve latest semester: %w", err)
	//}
	//defer rowsLatest.Close()
	//if !rowsLatest.Next() {
	//	// should not occur
	//	return nil, fmt.Errorf("no semesters found :(")
	//}
	//var semester string
	//if err := rowsLatest.Scan(&semester); err != nil {
	//	return nil, fmt.Errorf("failed to read latest semester: %w", err)
	//}
	//rowsLatest.Close()

	batch := &pgx.Batch{}

	batch.Queue(`SELECT "code", "semester" FROM "term"`)

	batch.Queue(`
    SELECT
      "course"."department"
    , "course"."code"
    , "course"."campus"
    , "section"."section"
    , "term"."code"
    , "course"."name"
    , "course"."description"
    , "section"."quarter_credits"::float / 4
    , "section"."seats_capacity"
    , "section"."seats_enrolled"
    , "section"."status"
    FROM "section"
    JOIN "course" ON "course"."id" = "section"."course_id"
    JOIN "term" ON "term"."code" = "section"."term_code"
    WHERE "term"."semester" = $1 AND "section"."deleted_at" IS NULL
  `, semester)

	batch.Queue(`
    SELECT
      "course"."department"
      || ' ' || "course"."code"
      || ' ' || "course"."campus"
      || '-' || to_char("section"."section", 'FM00')
    , "staff"."name_first" || ' ' || "staff"."name_last"
    FROM "section_staff"
    JOIN "staff" ON "staff"."id" = "section_staff"."staff_id"
    JOIN "section" ON "section"."id" = "section_staff"."section_id"
    JOIN "course" ON "course"."id" = "section"."course_id"
    JOIN "term" ON "term"."code" = "section"."term_code"
    WHERE "term"."semester" = $1 AND "section_staff"."deleted_at" IS NULL
  `, semester)

	batch.Queue(`
    SELECT
      "course"."department"
      || ' ' || "course"."code"
      || ' ' || "course"."campus"
      || '-' || to_char("section"."section", 'FM00')
    , "section_schedule"."days"
    , "section_schedule"."time_start"
    , "section_schedule"."time_end"
    , "section_schedule"."location"
    , "term"."code"
    , "term"."semester"
    , "term"."date_start"
    , "term"."date_end"
    FROM "section_schedule"
    JOIN "section" ON "section"."id" = "section_schedule"."section_id"
    JOIN "course" ON "course"."id" = "section"."course_id"
    JOIN "term" ON "term"."code" = "section"."term_code"
    WHERE "term"."semester" = $1 AND "section_schedule"."deleted_at" IS NULL
  `, semester)

	results := e.db.SendBatch(ctx, batch)
	defer results.Close()

	rowsTerms, err := results.Query()
	if err != nil {
		return nil, fmt.Errorf("failed to query terms: %w", err)
	}
	defer rowsTerms.Close()

	terms := make(map[string]*V3Term)
	for rowsTerms.Next() {
		var code, semester string
		if err := rowsTerms.Scan(&code, &semester); err != nil {
			return nil, fmt.Errorf("failed to scan term row: %w", err)
		}
		terms[code] = &V3Term{
			Code:    code,
			SortKey: []interface{}{code, semester},
			Name:    semester,
		}
	}
	rowsTerms.Close()

	rowsCourses, err := results.Query()
	if err != nil {
		return nil, err
	}
	defer rowsCourses.Close()

	courses := make(map[string]*V3Course)
	for rowsCourses.Next() {
		var (
			courseDept,
			courseCode,
			courseCampus string
			section int
			termCode,
			courseName,
			courseDesc string
			credits float32
			seatsCapacity,
			seatsEnrolled int
			status string
		)

		if err := rowsCourses.Scan(
			&courseDept,
			&courseCode,
			&courseCampus,
			&section,
			&termCode,
			&courseName,
			&courseDesc,
			&credits,
			&seatsCapacity,
			&seatsEnrolled,
			&status,
		); err != nil {
			return nil, fmt.Errorf("failed to query courses: %w", err)
		}

		fullCode := fmt.Sprintf(
			"%s %s %s-%02d",
			courseDept, courseCode, courseCampus, section,
		)
		courses[fullCode] = &V3Course{
			Code:    fullCode,
			Name:    courseName,
			SortKey: []interface{}{fullCode},
			MutualExclusionKey: []interface{}{fmt.Sprintf(
				"%s %s %s",
				courseDept, courseCode, courseCampus,
			)},
			Description:      courseDesc,
			Instructors:      []string{},
			Term:             termCode,
			Schedule:         []*V3Schedule{},
			Credits:          credits,
			SeatsTotal:       seatsCapacity,
			SeatsFilled:      seatsEnrolled,
			EnrollmentStatus: status,
		}
	}
	rowsCourses.Close()

	rowsInstructors, err := results.Query()
	if err != nil {
		return nil, fmt.Errorf("failed to query instructors: %w", err)
	}
	defer rowsInstructors.Close()

	for rowsInstructors.Next() {
		var code, instructor string
		if err := rowsInstructors.Scan(&code, &instructor); err != nil {
			return nil, fmt.Errorf("failed to scan section instructor row: %w", err)
		}

		course, ok := courses[code]
		if !ok {
			// should never actually occur, per foreign-key constraint in our db, but
			// better safe than panic
			return nil, fmt.Errorf(
				"instructor references nonexistent course code %#v", code,
			)
		}
		course.Instructors = append(course.Instructors, instructor)
	}
	rowsInstructors.Close()

	rowsSchedules, err := results.Query()
	if err != nil {
		return nil, fmt.Errorf("failed to query section schedules: %w", err)
	}
	defer rowsSchedules.Close()

	for rowsSchedules.Next() {
		var (
			code string
			days uint8
			timeStart,
			timeEnd time.Time
			location string
			term,
			semester string
			dateStart,
			dateEnd time.Time
		)
		if err := rowsSchedules.Scan(
			&code,
			&days,
			&timeStart,
			&timeEnd,
			&location,
			&term,
			&semester,
			&dateStart,
			&dateEnd,
		); err != nil {
			return nil, err
		}

		// dirty hack, because db stores no data about specific partitioning of
		// semesters, only individual term codes, so we _assume_ semesters are only
		// ever partitioned into (up to) 2 terms and infer which half it is based
		// on the term code suffix
		termCount := 1
		terms := []int{0}
		if term != semester {
			termCount = 2
			if strings.HasSuffix(term, "F2") || strings.HasSuffix(term, "P2") {
				terms = []int{1}
			}
		}

		course, ok := courses[code]
		if !ok {
			// shouldn't happen per foreign-key constraint, but checking here to be
			// extra safe
			return nil, fmt.Errorf(
				"schedule references invalid course code %#v", code,
			)
		}
		course.Schedule = append(course.Schedule, &V3Schedule{
			Days:      daysString(days),
			StartTime: fmtTime(timeStart),
			EndTime:   fmtTime(timeEnd),
			StartDate: fmtDate(dateStart),
			EndDate:   fmtDate(dateEnd),
			TermCount: termCount,
			Terms:     terms,
			Location:  location,
		})
	}
	rowsSchedules.Close()

	for _, course := range courses {
		sort.StringSlice(course.Instructors).Sort()
		sort.Slice(course.Schedule, func(i, j int) bool {
			return v3ScheduleLess(course.Schedule[i], course.Schedule[j])
		})
	}

	return &V3{
		Data: &V3CourseData{
			Terms:   terms,
			Courses: courses,
		},
		Until: time.Now().Unix(),
		Error: nil,
		Full:  true,
	}, nil
}

const days = "UMTWRFS"

func daysString(bits uint8) string {
	s := make([]rune, 0, 3)
	for i, c := range days {
		if (bits>>i)&1 == 1 {
			s = append(s, c)
		}
	}
	return string(s)
}

func fmtTime(t time.Time) string {
	return t.Format("15:04")
}

func fmtDate(t time.Time) string {
	return t.Format("2006-01-02")
}
