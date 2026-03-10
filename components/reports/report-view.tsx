"use client"

import type { Employee, AttendanceRecord, PayrollRecord } from "@/lib/types"
import { Building2, Mail, Phone, MapPin } from "lucide-react"
import type React from "react"

interface ReportViewProps {
    type: "profile" | "attendance" | "payroll"
    employee: Employee
    attendanceData?: AttendanceRecord[]
    payrollData?: PayrollRecord[]
    dateRange: { start: string; end: string }
}

export function ReportView({ type, employee, attendanceData, payrollData, dateRange }: ReportViewProps) {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:w-full print:max-w-none">
            {/* Header */}
            <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">BuildTrack</h1>
                    <div className="text-sm space-y-1 text-gray-600">
                        <p className="flex items-center gap-2"><MapPin size={14} /> Accra, Ghana</p>
                        <p className="flex items-center gap-2"><Phone size={14} /> +233 24 123 4567</p>
                        <p className="flex items-center gap-2"><Mail size={14} /> admin@buildtrack.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800 uppercase">
                        {type === "profile" ? "Employee Profile" : type === "attendance" ? "Attendance Report" : "Payroll Report"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Generated: {currentDate}</p>
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 text-left w-64">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Employee</p>
                        <p className="font-bold text-lg">{employee.fullName}</p>
                        <p className="text-sm text-gray-600">{employee.role} | {employee.ghanaCardId}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">

                {/* Profile Details Section */}
                {type === "profile" && (
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold border-b border-gray-300 mb-4 pb-2">Personal Information</h3>
                            <dl className="space-y-3">
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="col-span-2 font-medium">{employee.fullName}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Ghana Card ID</dt>
                                    <dd className="col-span-2 font-medium">{employee.ghanaCardId}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                    <dd className="col-span-2 font-medium capitalize">{employee.role}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                                    <dd className="col-span-2 font-medium">GHS {employee.hourlyRate}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                                    <dd className="col-span-2 font-medium">{employee.joinDate}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="col-span-2 font-medium">
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold border-b border-gray-300 mb-4 pb-2">Payment Details</h3>
                            <dl className="space-y-3">
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">MoMo Network</dt>
                                    <dd className="col-span-2 font-medium">{employee.momoNetwork || "N/A"}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">MoMo Number</dt>
                                    <dd className="col-span-2 font-medium">{employee.momoNumber || "N/A"}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                                    <dd className="col-span-2 font-medium text-gray-700">{employee.momoName || "N/A"}</dd>
                                </div>
                                <div className="grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Insurance</dt>
                                    <dd className="col-span-2 font-medium">{employee.healthInsurance || "N/A"}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {/* Attendance Table */}
                {type === "attendance" && attendanceData && (
                    <div>
                        <div className="mb-4 flex gap-4 text-sm">
                            <div className="bg-gray-100 px-3 py-1 rounded">
                                <span className="text-gray-500">From:</span> <span className="font-medium">{dateRange.start}</span>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded">
                                <span className="text-gray-500">To:</span> <span className="font-medium">{dateRange.end}</span>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded">
                                <span className="text-gray-500">Total Records:</span> <span className="font-medium">{attendanceData.length}</span>
                            </div>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-2 text-sm font-bold uppercase text-gray-600">Date</th>
                                    <th className="py-2 text-sm font-bold uppercase text-gray-600">Day</th>
                                    <th className="py-2 text-sm font-bold uppercase text-gray-600">Status</th>
                                    <th className="py-2 text-sm font-bold uppercase text-gray-600 text-right">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.length > 0 ? attendanceData.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-200">
                                        <td className="py-2">{record.date}</td>
                                        <td className="py-2 text-gray-600">{new Date(record.date).toLocaleDateString("en-US", { weekday: "short" })}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium
                        ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="py-2 text-right">{record.hoursWorked || 0}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">No attendance records found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payroll Table */}
                {type === "payroll" && payrollData && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="py-2 text-sm font-bold uppercase text-gray-600">Period</th>
                                <th className="py-2 text-sm font-bold uppercase text-gray-600 text-right">Hours</th>
                                <th className="py-2 text-sm font-bold uppercase text-gray-600 text-right">Rate</th>
                                <th className="py-2 text-sm font-bold uppercase text-gray-600 text-right">Amount</th>
                                <th className="py-2 text-sm font-bold uppercase text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollData.length > 0 ? payrollData.map((record) => (
                                <tr key={record.id} className="border-b border-gray-200">
                                    <td className="py-2 font-medium">{record.period}</td>
                                    <td className="py-2 text-right">{record.totalHours}</td>
                                    <td className="py-2 text-right">{record.ratePerHour.toFixed(2)}</td>
                                    <td className="py-2 text-right font-bold">GHS {record.totalAmount.toFixed(2)}</td>
                                    <td className="py-2 pl-4">
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium
                         ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">No payroll records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-8 hidden print:block">
                <div className="border-t border-gray-300 pt-4 flex justify-between text-xs text-gray-500">
                    <p>Printed on {currentDate}</p>
                    <p>Page 1 of 1</p>
                </div>
            </div>
        </div>
    )
}
