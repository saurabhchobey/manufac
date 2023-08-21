interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  constructor(public ceo: Employee) {
    this.history = [];
    this.future = [];
  }

  private history: {
    action: string;
    employeeID: number;
    supervisorID: number;
  }[];
  private future: {
    action: string;
    employeeID: number;
    supervisorID: number;
  }[];

  move(employeeID: number, supervisorID: number): void {
    const employee = this.findEmployee(this.ceo, employeeID);
    const supervisor = this.findEmployee(this.ceo, supervisorID);

    if (employee && supervisor) {
      // Save the current state for undo
      this.history.push({ action: "move", employeeID, supervisorID });
      this.future = [];

      // Remove the employee from their current supervisor's subordinates
      const currentSupervisor = this.findSupervisor(this.ceo, employeeID);
      if (currentSupervisor) {
        currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
          (sub) => sub.uniqueId !== employeeID
        );
      }

      // Move the employee and transfer their existing subordinates
      supervisor.subordinates.push(employee);
      this.transferSubordinates(employee, supervisor);
    } else {
      throw new Error("Employee or Supervisor not found");
    }
  }

  undo(): void {
    if (this.history.length > 0) {
      const lastMove = this.history.pop();
      if (lastMove) {
        const { employeeID, supervisorID } = lastMove;
        this.future.push({ action: "move", employeeID, supervisorID });
        this.move(employeeID, supervisorID);
      }
    }
  }

  redo(): void {
    if (this.future.length > 0) {
      const nextMove = this.future.pop();
      if (nextMove) {
        const { employeeID, supervisorID } = nextMove;
        this.history.push({ action: "move", employeeID, supervisorID });
        this.move(employeeID, supervisorID);
      }
    }
  }

  private findEmployee(root: Employee, uniqueId: number): Employee | undefined {
    if (root.uniqueId === uniqueId) {
      return root;
    }

    for (const subordinate of root.subordinates) {
      const result = this.findEmployee(subordinate, uniqueId);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  private findSupervisor(
    root: Employee,
    uniqueId: number
  ): Employee | undefined {
    for (const subordinate of root.subordinates) {
      if (subordinate.uniqueId === uniqueId) {
        return root;
      }

      const result = this.findSupervisor(subordinate, uniqueId);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  private transferSubordinates(
    employee: Employee,
    newSupervisor: Employee
  ): void {
    for (const subordinate of employee.subordinates) {
      newSupervisor.subordinates.push(subordinate);
      this.transferSubordinates(subordinate, newSupervisor);
    }
    employee.subordinates = [];
  }
}

console.log("saurabh");

// Example usage:
// const app = new EmployeeOrgApp(ceo);
// app.move(5, 14); // Move Bob (uniqueId 5) to be subordinate of Georgina (uniqueId 14)
// app.undo(); // Undo the move action
// app.redo(); // Redo the move action
