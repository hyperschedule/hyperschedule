#!/usr/bin/env python3

from selenium import webdriver
from bs4 import BeautifulSoup

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
rows = body.find_all('tr')

raw_courses = []

for row in rows:
    if not ('class' in row.attrs and 'subItem' not in row.attrs['class']):
        continue
    elements = row.find_all('td')
    add, course_code, name, faculty, seats, status, schedule, credits, begin, end = elements
    raw_courses.append({
        'course_code': course_code.text,
        'course_name': name.text,
        'faculty': faculty.text,
        'seats': seats.text,
        'status': status.text,
        'schedule': schedule.text,
        'credits': credits.text,
        'begin_date': begin.text,
        'end_date': end.text,
    })
