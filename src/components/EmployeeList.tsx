
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Employee, EmployeeRole, Gender } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface EmployeeListProps {
  employees: Employee[];
  onAddLeave: (employeeId: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onAddLeave }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Constraints</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>
                  <Badge variant={employee.role === EmployeeRole.L1 ? "default" : "secondary"}>
                    {employee.role}
                  </Badge>
                </TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>
                  {employee.constraints?.onlyMorningShift && (
                    <Badge variant="outline" className="bg-shift-morning text-white mr-1">
                      Morning Only
                    </Badge>
                  )}
                  {employee.constraints?.noNightShift && (
                    <Badge variant="outline" className="bg-shift-night/20 border-shift-night text-shift-night">
                      No Night Shift
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAddLeave(employee.id)}
                  >
                    Add Leave
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
