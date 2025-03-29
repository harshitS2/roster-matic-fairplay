
import { 
  Employee, 
  EmployeeRole, 
  Gender, 
  LeaveRequest, 
  RosterMonth, 
  ShiftAssignment, 
  ShiftType 
} from "./types";
import { addDays, format, getDaysInMonth, isSameDay, isWeekend } from "date-fns";

// Default employees
export const defaultEmployees: Employee[] = [
  { id: "1", name: "John Smith", role: EmployeeRole.L1, gender: Gender.Male },
  { id: "2", name: "Michael Johnson", role: EmployeeRole.L1, gender: Gender.Male },
  { id: "3", name: "Robert Williams", role: EmployeeRole.L1, gender: Gender.Male },
  { id: "4", name: "David Brown", role: EmployeeRole.L1, gender: Gender.Male },
  { id: "5", name: "Emma Davis", role: EmployeeRole.L1, gender: Gender.Female, constraints: { onlyMorningShift: true } },
  { id: "6", name: "William Miller", role: EmployeeRole.L2, gender: Gender.Male, constraints: { noNightShift: true } },
  { id: "7", name: "James Wilson", role: EmployeeRole.L2, gender: Gender.Male, constraints: { noNightShift: true } },
];

// Function to create dates array for a given month
export function getDatesInMonth(year: number, month: number): Date[] {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const dates: Date[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  
  return dates;
}

// Function to check if an employee is on leave on a specific date
export function isEmployeeOnLeave(employeeId: string, date: Date, leaves: LeaveRequest[]): boolean {
  return leaves.some(leave => 
    leave.employeeId === employeeId && isSameDay(leave.date, date)
  );
}

// Function to check if an employee worked night shift the previous day
export function workedNightShiftYesterday(
  employeeId: string, 
  date: Date, 
  assignments: ShiftAssignment[]
): boolean {
  const yesterday = addDays(date, -1);
  
  return assignments.some(assignment => 
    assignment.employeeId === employeeId && 
    isSameDay(assignment.date, yesterday) &&
    assignment.shiftType === ShiftType.Night
  );
}

// Function to count the number of consecutive working days
export function getConsecutiveWorkingDays(
  employeeId: string,
  endDate: Date,
  assignments: ShiftAssignment[]
): number {
  let count = 0;
  let currentDate = endDate;
  
  while (true) {
    const hasAssignment = assignments.some(assignment => 
      assignment.employeeId === employeeId && 
      isSameDay(assignment.date, currentDate) &&
      assignment.shiftType !== ShiftType.Off &&
      assignment.shiftType !== ShiftType.Leave
    );
    
    if (!hasAssignment) break;
    
    count++;
    currentDate = addDays(currentDate, -1);
  }
  
  return count;
}

// Function to get an employee's shift on a specific date
export function getEmployeeShift(
  employeeId: string,
  date: Date,
  assignments: ShiftAssignment[]
): ShiftType | null {
  const assignment = assignments.find(a => 
    a.employeeId === employeeId && isSameDay(a.date, date)
  );
  
  return assignment ? assignment.shiftType : null;
}

// Function to count shifts by type for an employee in a date range
export function countShiftsByType(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  shiftType: ShiftType,
  assignments: ShiftAssignment[]
): number {
  return assignments.filter(assignment => 
    assignment.employeeId === employeeId &&
    assignment.shiftType === shiftType &&
    assignment.date >= startDate &&
    assignment.date <= endDate
  ).length;
}

// Basic algorithm to generate a roster - this is simplified and does not implement all rules
export function generateRoster(year: number, month: number, employees: Employee[], leaves: LeaveRequest[]): RosterMonth {
  const dates = getDatesInMonth(year, month);
  const assignments: ShiftAssignment[] = [];
  const l1Employees = employees.filter(e => e.role === EmployeeRole.L1);
  const l2Employees = employees.filter(e => e.role === EmployeeRole.L2);
  const femaleL1 = l1Employees.find(e => e.gender === Gender.Female && e.constraints?.onlyMorningShift);
  const maleL1s = l1Employees.filter(e => e.gender === Gender.Male);
  
  // Track which week in the pattern (6-day or 5-day) each employee is in
  const employeeWeekPatterns: Record<string, { isLongWeek: boolean, weekStartDate: Date }> = {};
  employees.forEach(emp => {
    employeeWeekPatterns[emp.id] = { isLongWeek: true, weekStartDate: dates[0] };
  });
  
  // First, assign female L1 to morning shifts
  if (femaleL1) {
    let shouldWork = true; // Start with working (6-day week)
    
    dates.forEach((date, index) => {
      // Every 6 or 5 days, toggle the working pattern
      if (index % 7 === 0 && index > 0) {
        shouldWork = !shouldWork;
      }
      
      // Check if it's a Saturday and in a 5-day week
      const isSaturdayInShortWeek = date.getDay() === 6 && !shouldWork;
      const isOnLeave = isEmployeeOnLeave(femaleL1.id, date, leaves);
      
      if (isOnLeave) {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Leave
        });
        
        // Here we need to assign someone else to the morning shift
        // This is a simplified version - in reality, we need more complex logic
        const availableL1 = maleL1s.find(e => 
          !isEmployeeOnLeave(e.id, date, leaves) && 
          !workedNightShiftYesterday(e.id, date, assignments)
        );
        
        if (availableL1) {
          assignments.push({
            date,
            employeeId: availableL1.id,
            shiftType: ShiftType.Morning
          });
        }
      } else if (!isSaturdayInShortWeek) {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Morning
        });
      } else {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Off
        });
      }
    });
  }
  
  // Now assign male L1 engineers to shifts
  let l1ShiftIndex = 0;
  const shiftRotation = [ShiftType.Morning, ShiftType.Afternoon, ShiftType.Night];
  
  dates.forEach(date => {
    // Skip when it's Saturday in a 5-day week or when it's a Sunday - simplified
    const isSunday = date.getDay() === 0;
    const isJustThreeEngineers = isSunday;
    
    // For this simplified version, we'll just evenly distribute shifts
    maleL1s.forEach((employee, empIndex) => {
      // Skip if already assigned (in case of female L1 replacement)
      const existingAssignment = assignments.find(a => 
        a.employeeId === employee.id && isSameDay(a.date, date)
      );
      
      if (existingAssignment) return;
      
      // Skip the 4th engineer on Sundays and certain Saturdays
      if (isJustThreeEngineers && empIndex === 3) {
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: ShiftType.Off
        });
        return;
      }
      
      // Check if on leave
      if (isEmployeeOnLeave(employee.id, date, leaves)) {
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: ShiftType.Leave
        });
        return;
      }
      
      // Check if should get a day off based on 6-5-6-5-6 pattern
      // This is simplified for now
      
      // Assign shift based on rotation
      const shiftIndex = (l1ShiftIndex + empIndex) % shiftRotation.length;
      const shiftType = shiftRotation[shiftIndex];
      
      assignments.push({
        date,
        employeeId: employee.id,
        shiftType
      });
    });
    
    l1ShiftIndex = (l1ShiftIndex + 1) % shiftRotation.length;
  });
  
  // Last, assign L2 engineers to shifts (only morning and afternoon)
  const l2ShiftRotation = [ShiftType.Morning, ShiftType.Afternoon];
  let l2ShiftIndex = 0;
  
  dates.forEach(date => {
    l2Employees.forEach((employee, empIndex) => {
      // Check if on leave
      if (isEmployeeOnLeave(employee.id, date, leaves)) {
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: ShiftType.Leave
        });
        return;
      }
      
      // Check if should get a day off based on 6-5-6-5-6 pattern
      // This is simplified for now
      const isSaturday = date.getDay() === 6;
      const isFiveDayWeek = false; // Simplified, should be calculated
      
      if (isSaturday && isFiveDayWeek) {
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: ShiftType.Off
        });
        return;
      }
      
      // Assign shift based on rotation
      const shiftIndex = (l2ShiftIndex + empIndex) % l2ShiftRotation.length;
      const shiftType = l2ShiftRotation[shiftIndex];
      
      assignments.push({
        date,
        employeeId: employee.id,
        shiftType
      });
    });
    
    l2ShiftIndex = (l2ShiftIndex + 1) % l2ShiftRotation.length;
  });
  
  return {
    year,
    month,
    assignments,
    leaves
  };
}

// Export to Excel function will be added
export function exportToExcel(roster: RosterMonth, employees: Employee[]): void {
  alert("Export functionality will be implemented soon!");
  console.log("Exporting roster:", roster);
}
