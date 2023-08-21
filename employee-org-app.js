var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.ceo = ceo;
        this.history = [];
        this.future = [];
    }
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        var employee = this.findEmployee(this.ceo, employeeID);
        var supervisor = this.findEmployee(this.ceo, supervisorID);
        if (employee && supervisor) {
            // Save the current state for undo
            this.history.push({ action: "move", employeeID: employeeID, supervisorID: supervisorID });
            this.future = [];
            // Remove the employee from their current supervisor's subordinates
            var currentSupervisor = this.findSupervisor(this.ceo, employeeID);
            if (currentSupervisor) {
                currentSupervisor.subordinates = currentSupervisor.subordinates.filter(function (sub) { return sub.uniqueId !== employeeID; });
            }
            // Move the employee and transfer their existing subordinates
            supervisor.subordinates.push(employee);
            this.transferSubordinates(employee, supervisor);
        }
        else {
            throw new Error("Employee or Supervisor not found");
        }
    };
    EmployeeOrgApp.prototype.undo = function () {
        if (this.history.length > 0) {
            var lastMove = this.history.pop();
            if (lastMove) {
                var employeeID = lastMove.employeeID, supervisorID = lastMove.supervisorID;
                this.future.push({ action: "move", employeeID: employeeID, supervisorID: supervisorID });
                this.move(employeeID, supervisorID);
            }
        }
    };
    EmployeeOrgApp.prototype.redo = function () {
        if (this.future.length > 0) {
            var nextMove = this.future.pop();
            if (nextMove) {
                var employeeID = nextMove.employeeID, supervisorID = nextMove.supervisorID;
                this.history.push({ action: "move", employeeID: employeeID, supervisorID: supervisorID });
                this.move(employeeID, supervisorID);
            }
        }
    };
    EmployeeOrgApp.prototype.findEmployee = function (root, uniqueId) {
        if (root.uniqueId === uniqueId) {
            return root;
        }
        for (var _i = 0, _a = root.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            var result = this.findEmployee(subordinate, uniqueId);
            if (result) {
                return result;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.findSupervisor = function (root, uniqueId) {
        for (var _i = 0, _a = root.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            if (subordinate.uniqueId === uniqueId) {
                return root;
            }
            var result = this.findSupervisor(subordinate, uniqueId);
            if (result) {
                return result;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.transferSubordinates = function (employee, newSupervisor) {
        for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            newSupervisor.subordinates.push(subordinate);
            this.transferSubordinates(subordinate, newSupervisor);
        }
        employee.subordinates = [];
    };
    return EmployeeOrgApp;
}());
console.log("saurabh");
// Example usage:
// const app = new EmployeeOrgApp(ceo);
// app.move(5, 14); // Move Bob (uniqueId 5) to be subordinate of Georgina (uniqueId 14)
// app.undo(); // Undo the move action
// app.redo(); // Redo the move action
