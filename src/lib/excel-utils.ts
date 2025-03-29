
import { utils, writeFile, WorkSheet, WorkBook } from 'xlsx';
import { format } from 'date-fns';
import { Employee, RosterMonth, ShiftAssignment, ShiftType } from './types';

export function exportRosterToExcel(roster: RosterMonth, employees: Employee[]) {
  // Create worksheet for the roster
  const ws: WorkSheet = utils.aoa_to_sheet([]);
  
  // Add title
  const title = `Shift Roster - ${format(new Date(roster.year, roster.month), 'MMMM yyyy')}`;
  utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
  
  // Get dates for the month
  const daysInMonth = new Date(roster.year, roster.month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(roster.year, roster.month, i + 1));
  
  // Create header row with dates
  const headerRow = ['Employee Name', 'Role'];
  dates.forEach(date => {
    headerRow.push(format(date, 'dd (EEE)'));
  });
  utils.sheet_add_aoa(ws, [headerRow], { origin: 'A3' });
  
  // Add employee rows with shifts
  const employeeRows: any[][] = [];
  
  employees.forEach((employee, index) => {
    const row = [employee.name, employee.role];
    
    dates.forEach(date => {
      const assignment = roster.assignments.find(a => 
        a.employeeId === employee.id && 
        a.date.getDate() === date.getDate() &&
        a.date.getMonth() === date.getMonth() &&
        a.date.getFullYear() === date.getFullYear()
      );
      
      row.push(assignment ? assignment.shiftType : ShiftType.Off);
    });
    
    employeeRows.push(row);
  });
  
  utils.sheet_add_aoa(ws, employeeRows, { origin: 'A4' });
  
  // Create workbook and add the worksheet
  const wb: WorkBook = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Shift Roster');
  
  // Save the workbook
  writeFile(wb, `Shift_Roster_${format(new Date(roster.year, roster.month), 'MMMM_yyyy')}.xlsx`);
}
