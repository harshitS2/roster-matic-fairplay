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

// Function to check if a date is a Sunday
function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

// Function to check if a date is a Saturday
function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

// Function to determine if an employee should have a day off based on 6-5-6-5-6 pattern
function shouldHaveDayOff(employeeId: string, date: Date, startDate: Date, assignments: ShiftAssignment[]): boolean {
  // For simplicity, we'll determine week type (6-day or 5-day) based on the week number in the month
  const weekNumber = Math.floor((date.getDate() - 1) / 7) + 1;
  const isFiveDayWeek = weekNumber % 2 === 0; // Alternating pattern: week 1 (6-day), week 2 (5-day), etc.
  
  // In a 5-day week, employees get Saturday off
  return isFiveDayWeek && isSaturday(date);
}

// Basic algorithm to generate a roster - with weekly round-robin shifts
export function generateRoster(year: number, month: number, employees: Employee[], leaves: LeaveRequest[]): RosterMonth {
  const dates = getDatesInMonth(year, month);
  const assignments: ShiftAssignment[] = [];
  const l1Employees = employees.filter(e => e.role === EmployeeRole.L1);
  const l2Employees = employees.filter(e => e.role === EmployeeRole.L2);
  const femaleL1 = l1Employees.find(e => e.gender === Gender.Female && e.constraints?.onlyMorningShift);
  const maleL1s = l1Employees.filter(e => e.gender === Gender.Male);
  
  // First assign all employees OFF on Sundays
  dates.forEach(date => {
    if (isSunday(date)) {
      employees.forEach(employee => {
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: ShiftType.Off
        });
      });
    }
  });
  
  // Assign females to morning shifts (only on non-Sundays)
  if (femaleL1) {
    let isLongWeek = true; // Start with 6-day week
    let weekCounter = 0;
    let currentWeekStart = new Date(dates[0]);
    
    dates.forEach((date, index) => {
      // Skip if already assigned (e.g., Sunday)
      const existingAssignment = assignments.find(a => 
        a.employeeId === femaleL1.id && isSameDay(a.date, date)
      );
      
      if (existingAssignment) return;
      
      // Check if we're starting a new week (Monday)
      if (date.getDay() === 1 || index === 0) {
        weekCounter++;
        currentWeekStart = new Date(date);
        // Toggle between 6-day and 5-day weeks
        if (weekCounter > 1) {
          isLongWeek = !isLongWeek;
        }
      }
      
      // Check if it's a Saturday in a 5-day week
      const isSaturdayInShortWeek = isSaturday(date) && !isLongWeek;
      const isOnLeave = isEmployeeOnLeave(femaleL1.id, date, leaves);
      
      if (isOnLeave) {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Leave
        });
        
        // Here we need to assign someone else to the morning shift
        if (!isSunday(date)) {
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
        }
      } else if (isSaturdayInShortWeek) {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Off
        });
      } else {
        assignments.push({
          date,
          employeeId: femaleL1.id,
          shiftType: ShiftType.Morning
        });
      }
    });
  }
  
  // Now assign male L1 engineers to shifts with weekly round-robin pattern
  // We'll assign them in full week blocks (M, A, N, Off) on rotation
  const shiftRotation = [ShiftType.Morning, ShiftType.Afternoon, ShiftType.Night, ShiftType.Off];
  
  // Group dates by week
  const weeklyDates: Date[][] = [];
  let currentWeek: Date[] = [];
  
  dates.forEach((date, index) => {
    // Start a new week on Monday or first day of month
    if (date.getDay() === 1 || index === 0) {
      if (currentWeek.length > 0) {
        weeklyDates.push([...currentWeek]);
      }
      currentWeek = [date];
    } else {
      currentWeek.push(date);
    }
    
    // Handle last week
    if (index === dates.length - 1) {
      weeklyDates.push([...currentWeek]);
    }
  });
  
  // Assign shifts for each week
  weeklyDates.forEach((week, weekIndex) => {
    const isShortWeek = (weekIndex % 2) === 1; // Every other week is a 5-day week
    
    maleL1s.forEach((employee, empIndex) => {
      // Determine this employee's shift type for the week
      const weeklyShiftType = shiftRotation[(weekIndex + empIndex) % shiftRotation.length];
      
      week.forEach(date => {
        // Skip if already assigned (e.g., Sunday)
        const existingAssignment = assignments.find(a => 
          a.employeeId === employee.id && isSameDay(a.date, date)
        );
        
        if (existingAssignment) return;
        
        // Check if on leave
        if (isEmployeeOnLeave(employee.id, date, leaves)) {
          assignments.push({
            date,
            employeeId: employee.id,
            shiftType: ShiftType.Leave
          });
          return;
        }
        
        // If it's a Saturday in a 5-day week, give day off
        if (isSaturday(date) && isShortWeek) {
          assignments.push({
            date,
            employeeId: employee.id,
            shiftType: ShiftType.Off
          });
          return;
        }
        
        // Otherwise assign the weekly shift type
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: weeklyShiftType
        });
      });
    });
  });
  
  // Last, assign L2 engineers to shifts (only morning and afternoon, and never on Sundays)
  const l2ShiftRotation = [ShiftType.Morning, ShiftType.Afternoon];
  
  // Assign L2 engineers to shifts with weekly rotation
  weeklyDates.forEach((week, weekIndex) => {
    const isShortWeek = (weekIndex % 2) === 1; // Every other week is a 5-day week
    
    l2Employees.forEach((employee, empIndex) => {
      // Determine this employee's shift type for the week
      const weeklyShiftType = l2ShiftRotation[(weekIndex + empIndex) % l2ShiftRotation.length];
      
      week.forEach(date => {
        // Skip if already assigned (e.g., Sunday)
        const existingAssignment = assignments.find(a => 
          a.employeeId === employee.id && isSameDay(a.date, date)
        );
        
        if (existingAssignment) return;
        
        // Check if on leave
        if (isEmployeeOnLeave(employee.id, date, leaves)) {
          assignments.push({
            date,
            employeeId: employee.id,
            shiftType: ShiftType.Leave
          });
          return;
        }
        
        // If it's a Saturday in a 5-day week, give day off
        if (isSaturday(date) && isShortWeek) {
          assignments.push({
            date,
            employeeId: employee.id,
            shiftType: ShiftType.Off
          });
          return;
        }
        
        // Otherwise assign the weekly shift type
        assignments.push({
          date,
          employeeId: employee.id,
          shiftType: weeklyShiftType
        });
      });
    });
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
