// Request definitions verified against backend Swagger on 2026-09-10.
export const HR_API_CONTRACT = {
  "GET /api/hr/announcements/summary": {
    "params": []
  },
  "GET /api/hr/announcements": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Audience",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "POST /api/hr/announcements": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "nullable": true
        },
        "content": {
          "type": "string",
          "nullable": true
        },
        "audience": {
          "type": "string",
          "nullable": true
        },
        "publishDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        },
        "expiryDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/announcements/{announcementId}": {
    "params": []
  },
  "PUT /api/hr/announcements/{announcementId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "nullable": true
        },
        "content": {
          "type": "string",
          "nullable": true
        },
        "audience": {
          "type": "string",
          "nullable": true
        },
        "status": {
          "type": "string",
          "nullable": true
        },
        "publishDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        },
        "expiryDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "DELETE /api/hr/announcements/{announcementId}": {
    "params": []
  },
  "GET /api/hr/announcements/options": {
    "params": []
  },
  "GET /api/hr/announcements/export": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Audience",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/hr/attendance/summary": {
    "params": []
  },
  "GET /api/hr/attendance/overview": {
    "params": [
      {
        "name": "Range",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date"
      }
    ]
  },
  "GET /api/hr/attendance/distribution": {
    "params": [
      {
        "name": "date",
        "type": "string",
        "format": "date"
      }
    ]
  },
  "GET /api/hr/attendance": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Date",
        "type": "string",
        "format": "date"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Role",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/hr/attendance/{attendanceId}": {
    "params": []
  },
  "PUT /api/hr/attendance/{attendanceId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "nullable": true
        },
        "checkIn": {
          "type": "string",
          "nullable": true
        },
        "checkOut": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "POST /api/hr/attendance/mark": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "employeeId": {
          "type": "string",
          "nullable": true
        },
        "date": {
          "type": "string",
          "format": "date"
        },
        "checkIn": {
          "type": "string",
          "nullable": true
        },
        "checkOut": {
          "type": "string",
          "nullable": true
        },
        "status": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/attendance/employee/{employeeId}": {
    "params": [
      {
        "name": "startDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "endDate",
        "type": "string",
        "format": "date"
      }
    ]
  },
  "GET /api/hr/attendance/export": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Date",
        "type": "string",
        "format": "date"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Role",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/hr/attendance/filters": {
    "params": []
  },
  "GET /api/hr/calendar/events": {
    "params": [
      {
        "name": "FromDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "ToDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EventType",
        "type": "string"
      },
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "CourseId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "BatchId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "EmployeeId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "StudentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "PageNumber",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "PageSize",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "POST /api/hr/calendar/events": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "eventType": {
          "type": "string",
          "nullable": true
        },
        "title": {
          "type": "string",
          "nullable": true
        },
        "description": {
          "type": "string",
          "nullable": true
        },
        "startDateTime": {
          "type": "string",
          "format": "date-time"
        },
        "endDateTime": {
          "type": "string",
          "format": "date-time"
        },
        "location": {
          "type": "string",
          "nullable": true
        },
        "meetingLink": {
          "type": "string",
          "nullable": true
        },
        "allDay": {
          "type": "boolean"
        },
        "color": {
          "type": "string",
          "nullable": true
        },
        "courseId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "batchId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "employeeId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "studentId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/calendar/events/{eventId}": {
    "params": []
  },
  "PUT /api/hr/calendar/events/{eventId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "eventType": {
          "type": "string",
          "nullable": true
        },
        "title": {
          "type": "string",
          "nullable": true
        },
        "description": {
          "type": "string",
          "nullable": true
        },
        "startDateTime": {
          "type": "string",
          "format": "date-time"
        },
        "endDateTime": {
          "type": "string",
          "format": "date-time"
        },
        "location": {
          "type": "string",
          "nullable": true
        },
        "meetingLink": {
          "type": "string",
          "nullable": true
        },
        "allDay": {
          "type": "boolean"
        },
        "color": {
          "type": "string",
          "nullable": true
        },
        "courseId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "batchId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "employeeId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "studentId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "DELETE /api/hr/calendar/events/{eventId}": {
    "params": []
  },
  "GET /api/hr/calendar/events/upcoming": {
    "params": [
      {
        "name": "limit",
        "type": "integer",
        "format": "int32",
        "default": 5
      }
    ]
  },
  "GET /api/hr/calendar/events/stats": {
    "params": []
  },
  "GET /api/hr/calendar/holidays": {
    "params": [
      {
        "name": "fromDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "toDate",
        "type": "string",
        "format": "date-time"
      }
    ]
  },
  "GET /api/hr/calendar/leaves": {
    "params": [
      {
        "name": "fromDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "toDate",
        "type": "string",
        "format": "date-time"
      }
    ]
  },
  "GET /api/hr/calendar/classes": {
    "params": [
      {
        "name": "fromDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "toDate",
        "type": "string",
        "format": "date-time"
      }
    ]
  },
  "GET /api/hr/dashboard": {
    "params": []
  },
  "GET /api/hr/employees/summary": {
    "params": []
  },
  "GET /api/hr/employees": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Role",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "SortBy",
        "type": "string"
      },
      {
        "name": "SortOrder",
        "type": "string"
      }
    ]
  },
  "POST /api/hr/employees": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "nullable": true
        },
        "lastName": {
          "type": "string",
          "nullable": true
        },
        "email": {
          "type": "string",
          "nullable": true
        },
        "phone": {
          "type": "string",
          "nullable": true
        },
        "role": {
          "type": "string",
          "nullable": true
        },
        "departmentId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "designation": {
          "type": "string",
          "nullable": true
        },
        "employmentType": {
          "type": "string",
          "nullable": true
        },
        "joiningDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/employees/department-distribution": {
    "params": []
  },
  "GET /api/hr/employees/type-distribution": {
    "params": []
  },
  "GET /api/hr/employees/attendance-overview": {
    "params": []
  },
  "GET /api/hr/employees/{employeeId}": {
    "params": []
  },
  "PUT /api/hr/employees/{employeeId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "nullable": true
        },
        "lastName": {
          "type": "string",
          "nullable": true
        },
        "email": {
          "type": "string",
          "nullable": true
        },
        "phone": {
          "type": "string",
          "nullable": true
        },
        "role": {
          "type": "string",
          "nullable": true
        },
        "departmentId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        },
        "designation": {
          "type": "string",
          "nullable": true
        },
        "employmentType": {
          "type": "string",
          "nullable": true
        },
        "joiningDate": {
          "type": "string",
          "format": "date-time",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "DELETE /api/hr/employees/{employeeId}": {
    "params": []
  },
  "PATCH /api/hr/employees/{employeeId}/status": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/departments": {
    "params": []
  },
  "GET /api/hr/roles": {
    "params": []
  },
  "GET /api/hr/leave/summary": {
    "params": []
  },
  "GET /api/hr/leave": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "LeaveType",
        "type": "string"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "POST /api/hr/leave": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "employeeId": {
          "type": "string",
          "nullable": true
        },
        "leaveType": {
          "type": "string",
          "nullable": true
        },
        "fromDate": {
          "type": "string",
          "format": "date"
        },
        "toDate": {
          "type": "string",
          "format": "date"
        },
        "reason": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/leave/{leaveId}": {
    "params": []
  },
  "PUT /api/hr/leave/{leaveId}/approve": {
    "params": []
  },
  "PUT /api/hr/leave/{leaveId}/reject": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "rejectionReason": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/leave/employee/{employeeId}": {
    "params": []
  },
  "GET /api/hr/leave/balance/{employeeId}": {
    "params": []
  },
  "GET /api/hr/leave/types": {
    "params": []
  },
  "GET /api/hr/performance/summary": {
    "params": [
      {
        "name": "period",
        "type": "string",
        "default": "6M"
      }
    ]
  },
  "GET /api/hr/performance/trend": {
    "params": []
  },
  "GET /api/hr/performance/by-role": {
    "params": []
  },
  "GET /api/hr/performance": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Role",
        "type": "string"
      },
      {
        "name": "PerformanceFilter",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "POST /api/hr/performance": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "employeeId": {
          "type": "string",
          "nullable": true
        },
        "period": {
          "type": "string",
          "nullable": true
        },
        "performanceScore": {
          "type": "number",
          "format": "double"
        },
        "targetCompletion": {
          "type": "number",
          "format": "double"
        },
        "notes": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/performance/{performanceId}": {
    "params": []
  },
  "PUT /api/hr/performance/{performanceId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "period": {
          "type": "string",
          "nullable": true
        },
        "performanceScore": {
          "type": "number",
          "format": "double",
          "nullable": true
        },
        "targetCompletion": {
          "type": "number",
          "format": "double",
          "nullable": true
        },
        "notes": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/performance/employee/{employeeId}": {
    "params": []
  },
  "GET /api/hr/performance/filters": {
    "params": []
  },
  "GET /api/hr/performance/export": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "DepartmentId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Role",
        "type": "string"
      },
      {
        "name": "PerformanceFilter",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/hr/resources/summary": {
    "params": []
  },
  "GET /api/hr/resources": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Category",
        "type": "string"
      },
      {
        "name": "FileType",
        "type": "string"
      },
      {
        "name": "UploadedBy",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "POST /api/hr/resources": {
    "params": [],
    "mime": "multipart/form-data",
    "schema": {
      "type": "object",
      "properties": {
        "File": {
          "type": "string",
          "format": "binary"
        },
        "Name": {
          "type": "string"
        },
        "Category": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        }
      }
    }
  },
  "GET /api/hr/resources/{resourceId}": {
    "params": []
  },
  "PUT /api/hr/resources/{resourceId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "nullable": true
        },
        "category": {
          "type": "string",
          "nullable": true
        },
        "description": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "DELETE /api/hr/resources/{resourceId}": {
    "params": []
  },
  "GET /api/hr/resources/{resourceId}/download": {
    "params": []
  },
  "GET /api/hr/resources/{resourceId}/preview": {
    "params": []
  },
  "GET /api/hr/resources/categories": {
    "params": []
  },
  "GET /api/hr/resources/file-types": {
    "params": []
  },
  "GET /api/hr/resources/uploaders": {
    "params": []
  },
  "GET /api/hr/resources/export": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Category",
        "type": "string"
      },
      {
        "name": "FileType",
        "type": "string"
      },
      {
        "name": "UploadedBy",
        "type": "string"
      },
      {
        "name": "StartDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "EndDate",
        "type": "string",
        "format": "date-time"
      },
      {
        "name": "Page",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "Limit",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/hr/settings/profile": {
    "params": []
  },
  "PUT /api/hr/settings/profile": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "nullable": true
        },
        "lastName": {
          "type": "string",
          "nullable": true
        },
        "email": {
          "type": "string",
          "nullable": true
        },
        "phone": {
          "type": "string",
          "nullable": true
        },
        "countryCode": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "POST /api/hr/settings/profile/photo": {
    "params": [],
    "mime": "multipart/form-data",
    "schema": {
      "type": "object",
      "properties": {
        "photo": {
          "type": "string",
          "format": "binary"
        }
      }
    }
  },
  "GET /api/hr/settings/notifications": {
    "params": []
  },
  "PUT /api/hr/settings/notifications": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "leaveRequests": {
          "type": "boolean"
        },
        "attendanceAlerts": {
          "type": "boolean"
        },
        "employeeUpdates": {
          "type": "boolean"
        },
        "batchScheduleUpdates": {
          "type": "boolean"
        },
        "performanceUpdates": {
          "type": "boolean"
        },
        "instituteAnnouncements": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/settings/security": {
    "params": []
  },
  "PUT /api/hr/settings/security/password": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "currentPassword": {
          "type": "string",
          "nullable": true
        },
        "newPassword": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/hr/settings/security/sessions": {
    "params": []
  },
  "DELETE /api/hr/settings/security/sessions/{sessionId}": {
    "params": []
  },
  "POST /api/hr/settings/security/2fa/enable": {
    "params": []
  },
  "POST /api/hr/settings/security/2fa/disable": {
    "params": []
  },
  "GET /api/hr/settings/permissions": {
    "params": []
  },
  "GET /api/hr/settings/permissions/modules": {
    "params": []
  },
  "GET /api/hr/settings/appearance": {
    "params": []
  },
  "PUT /api/hr/settings/appearance": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "darkMode": {
          "type": "boolean"
        },
        "compactView": {
          "type": "boolean"
        },
        "sidebarCollapsedByDefault": {
          "type": "boolean"
        },
        "accentColor": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/students/summary": {
    "params": []
  },
  "GET /api/students": {
    "params": [
      {
        "name": "Search",
        "type": "string"
      },
      {
        "name": "Status",
        "type": "string"
      },
      {
        "name": "CourseId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "BatchId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "MentorId",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "SortBy",
        "type": "string"
      },
      {
        "name": "Descending",
        "type": "boolean"
      },
      {
        "name": "PageNumber",
        "type": "integer",
        "format": "int32"
      },
      {
        "name": "PageSize",
        "type": "integer",
        "format": "int32"
      }
    ]
  },
  "GET /api/students/{studentId}": {
    "params": []
  },
  "PUT /api/students/{studentId}": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "nullable": true
        },
        "lastName": {
          "type": "string",
          "nullable": true
        },
        "email": {
          "type": "string",
          "nullable": true
        },
        "phone": {
          "type": "string",
          "nullable": true
        },
        "courseId": {
          "type": "integer",
          "format": "int32"
        },
        "batchId": {
          "type": "integer",
          "format": "int32"
        },
        "mentorId": {
          "type": "integer",
          "format": "int32",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "DELETE /api/students/{studentId}": {
    "params": []
  },
  "PATCH /api/students/{studentId}/status": {
    "params": [],
    "mime": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": false
    }
  },
  "GET /api/students/{studentId}/enrollments": {
    "params": []
  }
}
