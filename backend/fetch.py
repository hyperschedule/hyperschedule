#!/usr/bin/env python3

from selenium import webdriver
from bs4 import BeautifulSoup
from dateutil.parser import parse as parse_date
import datetime as dt
import re

browser = webdriver.Chrome()

url = 'https://portal.hmc.edu/ICS/Portal_Homepage.jnz?portlet=Course_Schedules&screen=Advanced+Course+Search&screenType=next'
browser.get(url)

title = browser.find_element_by_id('pg0_V_txtTitleRestrictor')
title.clear()
title.send_keys('*')

search = browser.find_element_by_id('pg0_V_btnSearch')
search.click()

show_all = browser.find_element_by_id('pg0_V_lnkShowAll')
show_all.click()

html = browser.page_source
soup = BeautifulSoup(html, 'lxml')

table = soup.find(id='pg0_V_dgCourses')
body = table.find('tbody')
rows = body.find_all('tr', recursive=False)

raw_courses = []

for row in rows:
    if 'style' in row.attrs and row.attrs['style'] == 'display:none;':
        continue
    elements = row.find_all('td')
    add, course_code, name, faculty, seats, status, schedule, credits, begin, end = elements
    raw_courses.append({
        'course_code': course_code.text,
        'course_name': name.text,
        'faculty': faculty.text,
        'seats': seats.text,
        'status': status.text,
        'schedule': [stime.text for stime in schedule.find_all('li')],
        'credits': credits.text,
        'begin_date': begin.text,
        'end_date': end.text,
    })

courses = []

for raw_course in raw_courses:
    course_code = raw_course['course_code'].strip()
    course_regex = r'([A-Z]+) *?([0-9]+) *([A-Z]*[0-9]?) *([A-Z]{2})-([0-9]+)'
    department, course_number, num_suffix, school, section = re.match(
        course_regex, course_code).groups()
    course_number = int(course_number)
    section = int(section)
    course_name = raw_course['course_name'].strip()
    faculty = re.split(r'\s*\n\s*', raw_course['faculty'].strip())
    open_seats, total_seats = map(
        int, re.match(r'([0-9]+)/([0-9]+)', raw_course['seats']).groups())
    course_status = raw_course['status'].lower()
    schedule_regex = r'(?:([MTWRFSU]+)\xa0)?([0-9]+:[0-9]+(?: ?[AP]M)?) - ([0-9]+:[0-9]+ ?[AP]M); ([A-Za-z0-9, ]+)'
    schedule = []
    for slot in raw_course['schedule']:
        if slot.startswith('0:00 - 0:00 AM'):
            continue
        match = re.match(schedule_regex, slot)
        assert match, ("Couldn't parse schedule: " + repr(slot) +
                       ' (for course {})'.format(repr(course_code)))
        days, start, end, location = match.groups()
        if days:
            days = list(set(days))
            assert days
            for day in days:
                assert day in 'MTWRFSU'
        else:
            days = []
        if not start.endswith('AM') or start.endswith('PM'):
            start += end[-2:]
        start = parse_date(start).time()
        end = parse_date(end).time()
        location = ' '.join(location.strip().split())
        schedule.append({
            'days': days,
            'location': location,
            'start_time': start,
            'end_time': end,
        })
    quarter_credits = round(float(raw_course['credits']) / 0.25)
    begin_date = parse_date(raw_course['begin_date']).date()
    end_date = parse_date(raw_course['end_date']).date()
    # First half-semester courses start before February 1
    first_half = begin_date < dt.date(begin_date.year, 2, 1)
    # Second half-semester courses end after April 1
    second_half = end_date > dt.date(end_date.year, 4, 1)
    assert first_half or second_half
    courses.append({
        'department': department,
        'course_number': course_number,
        'course_code_suffix': num_suffix,
        'school': school,
        'section': section,
        'course_name': course_name,
        'faculty': faculty,
        'open_seats': open_seats,
        'total_seats': total_seats,
        'course_status': course_status,
        'schedule': schedule,
        'quarter_credits': quarter_credits,
        'first_half_semester': first_half,
        'second_half_semester': second_half,
    })
