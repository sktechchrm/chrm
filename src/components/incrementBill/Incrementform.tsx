import React from "react";
import AppButton from "../common/AppButton";
import {
  IncrementFormProps,
  EmployeeIncrement,
  calculateServiceAge,
  calculateBasicSalary,
  calculateProposedSalary
} from "./dataType";

export default function IncrementFormComponent({ increment, setIncrement }: IncrementFormProps) {

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncrement({ ...increment, subject: e.target.value });
  };

  const handleEmployeeChange = (index: number, field: keyof EmployeeIncrement, value: string) => {
    const newEmployees = [...increment.employees];
    newEmployees[index] = { ...newEmployees[index], [field]: value };

    if (field === 'dateOfJoining') {
      newEmployees[index].serviceAge = calculateServiceAge(value);
    }
    if (field === 'grossSalary') {
      newEmployees[index].basicSalary = calculateBasicSalary(value);
    }
    if (field === 'grossSalary' || field === 'proposedIncrement') {
      newEmployees[index].proposedSalary = calculateProposedSalary(
        newEmployees[index].grossSalary,
        newEmployees[index].proposedIncrement
      );
    }
    setIncrement({ ...increment, employees: newEmployees });
  };

  const addEmployee = () => {
    const newEmp = {
      slNo: 1,
      employeeName: "", employeeId: "", designation: "",
      department: "", dateOfJoining: "", serviceAge: "",
      basicSalary: "", grossSalary: "", lastIncrementDate: "",
      lastIncrementAmount: "", proposedIncrement: "", proposedSalary: "",
      effectiveFrom: "", recommendPromotion: "", remarks: ""
    };
    const reNumbered = [newEmp, ...increment.employees].map((emp, i) => ({ ...emp, slNo: i + 1 }));
    setIncrement({
      ...increment,
      employees: reNumbered,
    });
  };

  const removeEmployee = (index: number) => {
    if (increment.employees.length > 1) {
      const filtered     = increment.employees.filter((_, i) => i !== index);
      const reNumbered   = filtered.map((emp, i) => ({ ...emp, slNo: i + 1 }));
      setIncrement({ ...increment, employees: reNumbered });
    }
  };

  return (
    <div className="bg-white">

      <div className="p-4">

        {/* ── Subject (Date now lives in the ModuleShell header) ─────── */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">Subject *</label>
          <input
            type="text"
            value={increment.subject}
            onChange={handleSubjectChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Annual Salary Increment Proposal 2024"
            required
          />
        </div>

        {/* ── Add Employee (top, above the table) ──────────────────── */}
        <div className="mb-3 flex justify-end">
          <AppButton 
            style={{
              padding: '5px 14px', fontSize: 12, fontWeight: 700,
              border: '1px solid #34d399', borderRadius: 20,
              background: '#f0fdf4', color: '#065f46',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
            variant="add" onClick={addEmployee}
            >
            + Add Employee
            </AppButton>
        </div>

        {/* ── Employee table ──────────────────────────────────────── */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Sl</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Name</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">ID</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Designation</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Dept</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Join Date</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Service<br/><span className="text-xs font-normal">(Auto)</span></th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Current Basic<br/><span className="text-xs font-normal">(Auto)</span></th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Current Gross</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Last Inc. Date</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Last Inc. Amt</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Proposed Inc</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Proposed Sal<br/><span className="text-xs font-normal">(Auto)</span></th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Effective From</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Recommend Promotion</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-bold">Remarks</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {increment.employees.map((emp, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{emp.slNo}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.employeeName}
                      onChange={(e) => handleEmployeeChange(index, "employeeName", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[120px]"
                      placeholder="Name" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.employeeId}
                      onChange={(e) => handleEmployeeChange(index, "employeeId", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[80px]"
                      placeholder="ID" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.designation}
                      onChange={(e) => handleEmployeeChange(index, "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[100px]"
                      placeholder="Designation" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.department}
                      onChange={(e) => handleEmployeeChange(index, "department", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[80px]"
                      placeholder="Dept" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="date" value={emp.dateOfJoining}
                      onChange={(e) => handleEmployeeChange(index, "dateOfJoining", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[120px]"
                      required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.serviceAge} readOnly
                      className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded outline-none min-w-[70px]"
                      placeholder="Auto" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="number" value={emp.basicSalary} readOnly
                      className="w-full px-2 py-1 bg-blue-50 border border-gray-200 rounded outline-none min-w-[80px]"
                      placeholder="Auto" title="Auto-calculated: (Current Gross - 2450) / 1.5" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="number" value={emp.grossSalary}
                      onChange={(e) => handleEmployeeChange(index, "grossSalary", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[80px]"
                      placeholder="0" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.lastIncrementDate}
                      onChange={(e) => handleEmployeeChange(index, "lastIncrementDate", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[120px]" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="number" value={emp.lastIncrementAmount}
                      onChange={(e) => handleEmployeeChange(index, "lastIncrementAmount", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[80px]"
                      placeholder="0" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="number" value={emp.proposedIncrement}
                      onChange={(e) => handleEmployeeChange(index, "proposedIncrement", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[80px]"
                      placeholder="0" required />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="number"
                      value={Number(emp.proposedIncrement) === 0 ? "" : emp.proposedSalary}
                      readOnly
                      className="w-full px-2 py-1 bg-green-50 border border-gray-200 rounded outline-none min-w-[80px]"
                      placeholder="Auto" title="Auto-calculated: Current Gross + Proposed Increment" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.effectiveFrom}
                      onChange={(e) => handleEmployeeChange(index, "effectiveFrom", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[120px]" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.recommendPromotion || ""}
                      onChange={(e) => handleEmployeeChange(index, "recommendPromotion", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[100px]"
                      placeholder="Recommend Promotion" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input type="text" value={emp.remarks}
                      onChange={(e) => handleEmployeeChange(index, "remarks", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[100px]"
                      placeholder="Remarks" />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {increment.employees.length > 1 && (
                      <button type="button" onClick={() => removeEmployee(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
}