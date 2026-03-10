import { Employee, AttendanceRecord, Project, Task, Invoice, Payment, PayrollRecord } from "./types"
import { storage } from "./storage"

export interface SearchResult {
    id: string
    type: "employee" | "attendance" | "project" | "task" | "invoice" | "payment" | "payroll"
    title: string
    subtitle: string
    metadata?: string
    data: any
}

export interface SearchQuery {
    rawQuery: string
    entities: string[]
    timeReference?: {
        type: "absolute" | "relative"
        date?: string
        startDate?: string
        endDate?: string
    }
    filters: {
        status?: string
        role?: string
        location?: string
        client?: string
    }
}

/**
 * Parse natural language query into structured search query
 */
export function parseQuery(query: string): SearchQuery {
    const lowerQuery = query.toLowerCase()
    const searchQuery: SearchQuery = {
        rawQuery: query,
        entities: [],
        filters: {}
    }

    // Detect entity types
    if (lowerQuery.includes("people") || lowerQuery.includes("employee") || lowerQuery.includes("worker") || lowerQuery.includes("staff")) {
        searchQuery.entities.push("employee")
    }
    if (lowerQuery.includes("attendance") || lowerQuery.includes("reported") || lowerQuery.includes("worked") || lowerQuery.includes("present")) {
        searchQuery.entities.push("attendance")
    }
    if (lowerQuery.includes("project")) {
        searchQuery.entities.push("project")
    }
    if (lowerQuery.includes("task")) {
        searchQuery.entities.push("task")
    }
    if (lowerQuery.includes("invoice")) {
        searchQuery.entities.push("invoice")
    }
    if (lowerQuery.includes("payment")) {
        searchQuery.entities.push("payment")
    }
    if (lowerQuery.includes("payroll") || lowerQuery.includes("salary") || lowerQuery.includes("wage")) {
        searchQuery.entities.push("payroll")
    }

    // Parse time references
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (lowerQuery.includes("yesterday")) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        searchQuery.timeReference = {
            type: "absolute",
            date: yesterday.toISOString().split("T")[0]
        }
    } else if (lowerQuery.includes("today")) {
        searchQuery.timeReference = {
            type: "absolute",
            date: today.toISOString().split("T")[0]
        }
    } else if (lowerQuery.includes("this week")) {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        searchQuery.timeReference = {
            type: "relative",
            startDate: startOfWeek.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0]
        }
    } else if (lowerQuery.includes("last week")) {
        const startOfLastWeek = new Date(today)
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        searchQuery.timeReference = {
            type: "relative",
            startDate: startOfLastWeek.toISOString().split("T")[0],
            endDate: endOfLastWeek.toISOString().split("T")[0]
        }
    } else if (lowerQuery.includes("this month")) {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        searchQuery.timeReference = {
            type: "relative",
            startDate: startOfMonth.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0]
        }
    }

    // Parse status filters
    if (lowerQuery.includes("overdue")) {
        searchQuery.filters.status = "overdue"
    } else if (lowerQuery.includes("pending")) {
        searchQuery.filters.status = "pending"
    } else if (lowerQuery.includes("completed") || lowerQuery.includes("done")) {
        searchQuery.filters.status = "completed"
    } else if (lowerQuery.includes("active")) {
        searchQuery.filters.status = "active"
    } else if (lowerQuery.includes("paid")) {
        searchQuery.filters.status = "paid"
    }

    // Parse role filters
    if (lowerQuery.includes("admin")) {
        searchQuery.filters.role = "admin"
    } else if (lowerQuery.includes("manager")) {
        searchQuery.filters.role = "manager"
    } else if (lowerQuery.includes("worker")) {
        searchQuery.filters.role = "worker"
    }

    return searchQuery
}

/**
 * Search employees based on query
 */
function searchEmployees(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const employees = storage.employees.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    employees.forEach(emp => {
        let matches = false
        let relevance = 0

        // Name matching
        if (emp.fullName.toLowerCase().includes(lowerQuery)) {
            matches = true
            relevance += 10
        }

        // Role matching
        if (parsedQuery.filters.role && emp.role === parsedQuery.filters.role) {
            matches = true
            relevance += 5
        }

        // Generic search terms
        if (lowerQuery.includes("employee") || lowerQuery.includes("people") || lowerQuery.includes("staff")) {
            matches = true
            relevance += 1
        }

        // Active status
        if (lowerQuery.includes("active") && emp.isActive) {
            matches = true
            relevance += 3
        } else if (lowerQuery.includes("inactive") && !emp.isActive) {
            matches = true
            relevance += 3
        }

        if (matches) {
            results.push({
                id: emp.id,
                type: "employee",
                title: emp.fullName,
                subtitle: `${emp.role.charAt(0).toUpperCase() + emp.role.slice(1)} • ${emp.isActive ? 'Active' : 'Inactive'}`,
                metadata: `Joined ${new Date(emp.joinDate).toLocaleDateString()}`,
                data: emp
            })
        }
    })

    return results
}

/**
 * Search attendance records based on query
 */
function searchAttendance(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const attendance = storage.attendance.getAll(userId)
    const employees = storage.employees.getAll(userId)
    const results: SearchResult[] = []

    attendance.forEach(record => {
        let matches = false

        // Date matching
        if (parsedQuery.timeReference?.date && record.date === parsedQuery.timeReference.date) {
            matches = true
        } else if (parsedQuery.timeReference?.startDate && parsedQuery.timeReference?.endDate) {
            if (record.date >= parsedQuery.timeReference.startDate && record.date <= parsedQuery.timeReference.endDate) {
                matches = true
            }
        }

        // Status matching
        if (query.toLowerCase().includes("present") && record.status === "present") {
            matches = true
        } else if (query.toLowerCase().includes("absent") && record.status === "absent") {
            matches = true
        } else if (query.toLowerCase().includes("leave") && record.status === "leave") {
            matches = true
        }

        if (matches) {
            const employee = employees.find(e => e.id === record.employeeId)
            results.push({
                id: record.id,
                type: "attendance",
                title: employee?.fullName || "Unknown Employee",
                subtitle: `${record.status.charAt(0).toUpperCase() + record.status.slice(1)} • ${new Date(record.date).toLocaleDateString()}`,
                metadata: record.hoursWorked ? `${record.hoursWorked} hours worked` : undefined,
                data: record
            })
        }
    })

    return results
}

/**
 * Search projects based on query
 */
function searchProjects(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const projects = storage.projects.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    projects.forEach(project => {
        let matches = false
        let relevance = 0

        // Name matching
        if (project.name.toLowerCase().includes(lowerQuery)) {
            matches = true
            relevance += 10
        }

        // Client matching
        if (project.clientName.toLowerCase().includes(lowerQuery)) {
            matches = true
            relevance += 8
        }

        // Location matching
        if (project.location.toLowerCase().includes(lowerQuery)) {
            matches = true
            relevance += 5
        }

        // Status matching
        if (parsedQuery.filters.status && project.status === parsedQuery.filters.status) {
            matches = true
            relevance += 5
        }

        if (matches) {
            results.push({
                id: project.id,
                type: "project",
                title: project.name,
                subtitle: `${project.clientName} • ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`,
                metadata: project.location,
                data: project
            })
        }
    })

    return results
}

/**
 * Search tasks based on query
 */
function searchTasks(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const tasks = storage.tasks.getAll(userId)
    const projects = storage.projects.getAll(userId)
    const employees = storage.employees.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    tasks.forEach(task => {
        let matches = false

        // Title matching
        if (task.title.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Description matching
        if (task.description?.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Status matching
        if (parsedQuery.filters.status) {
            const statusMap: Record<string, string> = {
                "completed": "done",
                "done": "done",
                "pending": "todo",
                "todo": "todo",
                "active": "in-progress",
                "in-progress": "in-progress"
            }
            if (statusMap[parsedQuery.filters.status] === task.status) {
                matches = true
            }
        }

        // Assignee matching
        if (task.assignedEmployees.length > 0) {
            task.assignedEmployees.forEach(empId => {
                const emp = employees.find(e => e.id === empId)
                if (emp && emp.fullName.toLowerCase().includes(lowerQuery)) {
                    matches = true
                }
            })
        }

        if (matches) {
            const project = projects.find(p => p.id === task.projectId)
            const assigneeNames = task.assignedEmployees
                .map(id => employees.find(e => e.id === id)?.fullName)
                .filter(Boolean)
                .join(", ")

            results.push({
                id: task.id,
                type: "task",
                title: task.title,
                subtitle: `${project?.name || "Unknown Project"} • ${task.status}`,
                metadata: assigneeNames || "Unassigned",
                data: task
            })
        }
    })

    return results
}

/**
 * Search invoices based on query
 */
function searchInvoices(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const invoices = storage.invoices.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    invoices.forEach(invoice => {
        let matches = false

        // Invoice number matching
        if (invoice.invoiceNumber.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Client matching
        if (invoice.clientName.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Status matching
        if (parsedQuery.filters.status && invoice.status === parsedQuery.filters.status) {
            matches = true
        }

        // Date matching
        if (parsedQuery.timeReference?.date && invoice.date === parsedQuery.timeReference.date) {
            matches = true
        } else if (parsedQuery.timeReference?.startDate && parsedQuery.timeReference?.endDate) {
            if (invoice.date >= parsedQuery.timeReference.startDate && invoice.date <= parsedQuery.timeReference.endDate) {
                matches = true
            }
        }

        if (matches) {
            results.push({
                id: invoice.id,
                type: "invoice",
                title: `Invoice ${invoice.invoiceNumber}`,
                subtitle: `${invoice.clientName} • ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`,
                metadata: `GHS ${invoice.total.toLocaleString()}`,
                data: invoice
            })
        }
    })

    return results
}

/**
 * Search payments based on query
 */
function searchPayments(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const payments = storage.payments.getAll(userId)
    const projects = storage.projects.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    payments.forEach(payment => {
        let matches = false

        // Reference matching
        if (payment.reference?.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Method matching
        if (lowerQuery.includes(payment.method.replace("_", " "))) {
            matches = true
        }

        // Status matching
        if (parsedQuery.filters.status && payment.status.includes(parsedQuery.filters.status)) {
            matches = true
        }

        // Date matching
        if (parsedQuery.timeReference?.date && payment.date === parsedQuery.timeReference.date) {
            matches = true
        } else if (parsedQuery.timeReference?.startDate && parsedQuery.timeReference?.endDate) {
            if (payment.date >= parsedQuery.timeReference.startDate && payment.date <= parsedQuery.timeReference.endDate) {
                matches = true
            }
        }

        if (matches) {
            const project = projects.find(p => p.id === payment.projectId)
            results.push({
                id: payment.id,
                type: "payment",
                title: `Payment - ${payment.method.replace("_", " ").toUpperCase()}`,
                subtitle: `${project?.name || "Unknown Project"} • ${new Date(payment.date).toLocaleDateString()}`,
                metadata: `GHS ${payment.amount.toLocaleString()}`,
                data: payment
            })
        }
    })

    return results
}

/**
 * Search payroll records based on query
 */
function searchPayroll(query: string, parsedQuery: SearchQuery, userId?: string): SearchResult[] {
    const payroll = storage.payroll.getAll(userId)
    const employees = storage.employees.getAll(userId)
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    payroll.forEach(record => {
        let matches = false

        // Status matching
        if (parsedQuery.filters.status && record.status === parsedQuery.filters.status) {
            matches = true
        }

        // Employee matching
        const employee = employees.find(e => e.id === record.employeeId)
        if (employee && employee.fullName.toLowerCase().includes(lowerQuery)) {
            matches = true
        }

        // Generic payroll search
        if (lowerQuery.includes("payroll") || lowerQuery.includes("salary") || lowerQuery.includes("wage")) {
            matches = true
        }

        if (matches) {
            results.push({
                id: record.id,
                type: "payroll",
                title: `Payroll - ${employee?.fullName || "Unknown Employee"}`,
                subtitle: `Period ${record.period} • ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`,
                metadata: `GHS ${record.totalAmount.toLocaleString()}`,
                data: record
            })
        }
    })

    return results
}

/**
 * Main search function that orchestrates all searches
 */
export function performSearch(query: string, userId?: string): SearchResult[] {
    if (!query.trim()) return []

    const parsedQuery = parseQuery(query)
    const results: SearchResult[] = []

    // If specific entities are mentioned, search only those
    if (parsedQuery.entities.length > 0) {
        if (parsedQuery.entities.includes("employee")) {
            results.push(...searchEmployees(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("attendance")) {
            results.push(...searchAttendance(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("project")) {
            results.push(...searchProjects(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("task")) {
            results.push(...searchTasks(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("invoice")) {
            results.push(...searchInvoices(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("payment")) {
            results.push(...searchPayments(query, parsedQuery, userId))
        }
        if (parsedQuery.entities.includes("payroll")) {
            results.push(...searchPayroll(query, parsedQuery, userId))
        }
    } else {
        // Search all entities
        results.push(...searchEmployees(query, parsedQuery, userId))
        results.push(...searchAttendance(query, parsedQuery, userId))
        results.push(...searchProjects(query, parsedQuery, userId))
        results.push(...searchTasks(query, parsedQuery, userId))
        results.push(...searchInvoices(query, parsedQuery, userId))
        results.push(...searchPayments(query, parsedQuery, userId))
        results.push(...searchPayroll(query, parsedQuery, userId))
    }

    // Limit results per category
    const maxPerCategory = 10
    const categorized = results.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        if (acc[result.type].length < maxPerCategory) {
            acc[result.type].push(result)
        }
        return acc
    }, {} as Record<string, SearchResult[]>)

    // Flatten back to array
    return Object.values(categorized).flat()
}
