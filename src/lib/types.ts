
export enum ShiftType {
  Morning = 'M',
  Afternoon = 'A',
  Night = 'N',
  Off = 'O',
  Leave = 'L'
}

export enum EmployeeRole {
  L1 = 'L1',
  L2 = 'L2'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  gender: Gender;
  constraints?: {
    onlyMorningShift?: boolean;
    noNightShift?: boolean;
  };
}

export interface ShiftAssignment {
  date: Date;
  employeeId: string;
  shiftType: ShiftType;
}

export interface LeaveRequest {
  employeeId: string;
  date: Date;
}

export interface RosterMonth {
  year: number;
  month: number; // 0-11 (JavaScript months)
  assignments: ShiftAssignment[];
  leaves: LeaveRequest[];
}
