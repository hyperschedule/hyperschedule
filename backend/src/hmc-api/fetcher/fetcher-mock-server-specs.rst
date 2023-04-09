=========================
Fetcher Mock Server Specs
=========================

The intention of the fetcher mock server is so we can test various elements of the fetcher
without having to actually send request to the school server.

---------
CLI flags
---------

The mock server can be started with a CLI flag :code:`-d`/:code:`--delay` with an optional argument. If this flag is included without
an argument, all request to the server that would return 200 would be delayed randomly by at least 10 seconds and at
most 5 minutes before the first byte of response header is sent. This is to simulate the amount of time the school
server may take to respond. The endpoint :code:`course-raw` should be delayed by at least 4 minutes and at most 4 minutes
and 35 seconds.

Optionally, this flag will take a positive integer :code:`n` and delay all response universally by :code:`n` seconds. This
is to make debugging and unit testing slightly faster. The mock server may assume :code:`n` is a reasonable valued number
without further checks.

---------
Endpoints
---------

GET :code:`/:endpoint`

Example:
GET :code:`/alt-staff?YEAR=2022&SESSION=FA`

Returns the corresponding file stored in :code:`hyperschedule-data` module. Returns :code:`404 Not Found` if the
corresponding file does not exist.

Path params
-----------

:endpoint:
    :type: string
    :value: name of the endpoint, as defined in `src/hmc-api/fetcher/endpoints.ts`

Name of the endpoint

Query params
------------

All query parameters are optional. Return the file matching :code:`CURRENT_TERM` if no query parameter is specified.

:YEAR:
  :type: number
  :value: The year of the request. If this field is present, :code:`SESSION` must also be present
:SESSION:
  :type: String enum, one of :code:`SU`, :code:`SP`, or :code:`FA`
  :value: The semester requested. If this field is present, :code:`YEAR` must also be present
:CATALOG:
  :type: String of catalog matching regex :code:`UG\d{2}`
  :value: The catalog being requested. If this field is present, neither :code:`YEAR` nor :code:`SESSION` can be present


Request Header
--------------

All requests must contain the :code:`Authorization` header. This value must be string equivalent to the value defined in
:code:`endpoints.ts`. Return :code:`401 Unauthorized` if the value is absent or different.

Response Header
---------------

All responses must contain the correct :code:`Content-Type` header based on file type. In practice this should be
:code:`text/plain` for :code:`courseRaw` and :code:`application/json` for everything else.

---------------
Example Request
---------------

.. code:: http

    GET /course-area HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate, br
    Authorization: local dev
    Connection: close
    Host: localhost

----------------
Example Response
----------------

.. code:: http

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 155

    [
        {
            "catalog": "UG22",
            "course_areas": [
                "2COR",
                "2FYA"
            ],
            "course_code": "CORE001  SC"
        }
    ]

