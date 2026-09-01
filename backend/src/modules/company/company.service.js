const prisma = require('../../config/prisma');

class CompanyService {
    // ========== Company Profile ==========
    async updateCompanyProfile(companyId, data) {
        try {
            const nullable = (value) => (value === "" ? null : value);

            return await prisma.company.update({
                where: { id: companyId },
                data: {
                    name: data.name,
                    pan: nullable(data.pan),
                    gst: nullable(data.gst),
                    tan: nullable(data.tan),
                    cin: nullable(data.cin),
                    msme: nullable(data.msme),
                    iec: nullable(data.iec),
                    pf: nullable(data.pf),
                    esic: nullable(data.esic),
                    lwf: nullable(data.lwf),
                    pt: nullable(data.pt),
                    factoryLicense: nullable(data.factoryLicense),
                    tradeLicense: nullable(data.tradeLicense),
                    industryId: nullable(data.industryId),
                    businessTypeId: nullable(data.businessTypeId),
                    description: nullable(data.description),
                    website: nullable(data.website),
                    phone: nullable(data.phone),
                    address: nullable(data.address),
                    city: nullable(data.city),
                    state: nullable(data.state),
                    pincode: nullable(data.pincode),
                },
                include: {
                    industry: true,
                    businessType: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update company profile: ${error.message}`);
        }
    }

    async getCompanyProfile(companyId) {
        try {
            return await prisma.company.findUnique({
                where: { id: companyId },
                include: {
                    industry: true,
                    businessType: true,
                    branches: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            city: true,
                            state: true,
                        },
                    },
                    employees: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true,
                            designation: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to fetch company profile: ${error.message}`);
        }
    }

    // ========== Branches ==========
    async createBranch(companyId, data) {
        try {
            return await prisma.branch.create({
                data: {
                    ...data,
                    companyId,
                },
            });
        } catch (error) {
            throw new Error(`Failed to create branch: ${error.message}`);
        }
    }

    async updateBranch(branchId, data) {
        try {
            return await prisma.branch.update({
                where: { id: branchId },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update branch: ${error.message}`);
        }
    }

    async getBranchesForCompany(companyId) {
        try {
            return await prisma.branch.findMany({
                where: { companyId },
                include: {
                    employees: true,
                    compliances: {
                        select: { id: true, title: true, status: true, dueDate: true },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to fetch branches: ${error.message}`);
        }
    }

    async deleteBranch(branchId) {
        try {
            return await prisma.branch.delete({
                where: { id: branchId },
            });
        } catch (error) {
            throw new Error(`Failed to delete branch: ${error.message}`);
        }
    }

    // ========== Employees ==========
    async createEmployee(data) {
        try {
            return await prisma.employee.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    employeeCode: data.employeeCode,
                    companyId: data.companyId,
                    branchId: data.branchId,
                    departmentId: data.departmentId,
                    designationId: data.designationId,
                },
                include: {
                    department: true,
                    designation: true,
                    branch: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to create employee: ${error.message}`);
        }
    }

    async getEmployeesForCompany(companyId) {
        try {
            return await prisma.employee.findMany({
                where: { companyId },
                include: {
                    department: true,
                    designation: true,
                    branch: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to fetch employees: ${error.message}`);
        }
    }

    async getEmployeesForBranch(branchId) {
        try {
            return await prisma.employee.findMany({
                where: { branchId },
                include: {
                    department: true,
                    designation: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to fetch branch employees: ${error.message}`);
        }
    }

    async updateEmployee(employeeId, data) {
        try {
            return await prisma.employee.update({
                where: { id: employeeId },
                data,
                include: {
                    department: true,
                    designation: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update employee: ${error.message}`);
        }
    }

    async deleteEmployee(employeeId) {
        try {
            return await prisma.employee.delete({
                where: { id: employeeId },
            });
        } catch (error) {
            throw new Error(`Failed to delete employee: ${error.message}`);
        }
    }
}

module.exports = new CompanyService();
