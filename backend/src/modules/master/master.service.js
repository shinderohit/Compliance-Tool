const prisma = require('../../config/prisma');

class MasterDataService {
    // ========== Industry ==========
    async createIndustry(data) {
        try {
            return await prisma.industryMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create industry: ${error.message}`);
        }
    }

    async getAllIndustries() {
        try {
            return await prisma.industryMaster.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch industries: ${error.message}`);
        }
    }

    async updateIndustry(id, data) {
        try {
            return await prisma.industryMaster.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update industry: ${error.message}`);
        }
    }

    async deleteIndustry(id) {
        try {
            return await prisma.industryMaster.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to delete industry: ${error.message}`);
        }
    }

    // ========== Business Type ==========
    async createBusinessType(data) {
        try {
            return await prisma.businessTypeMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create business type: ${error.message}`);
        }
    }

    async getAllBusinessTypes() {
        try {
            return await prisma.businessTypeMaster.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch business types: ${error.message}`);
        }
    }

    async updateBusinessType(id, data) {
        try {
            return await prisma.businessTypeMaster.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update business type: ${error.message}`);
        }
    }

    // ========== Department ==========
    async createDepartment(data) {
        try {
            return await prisma.departmentMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create department: ${error.message}`);
        }
    }

    async getAllDepartments() {
        try {
            return await prisma.departmentMaster.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch departments: ${error.message}`);
        }
    }

    async updateDepartment(id, data) {
        try {
            return await prisma.departmentMaster.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update department: ${error.message}`);
        }
    }

    // ========== Designation ==========
    async createDesignation(data) {
        try {
            return await prisma.designationMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create designation: ${error.message}`);
        }
    }

    async getAllDesignations() {
        try {
            return await prisma.designationMaster.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch designations: ${error.message}`);
        }
    }

    async updateDesignation(id, data) {
        try {
            return await prisma.designationMaster.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update designation: ${error.message}`);
        }
    }

    // ========== Compliance Frequency ==========
    async createFrequency(data) {
        try {
            return await prisma.complianceFrequencyMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create compliance frequency: ${error.message}`);
        }
    }

    async getAllFrequencies() {
        try {
            return await prisma.complianceFrequencyMaster.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch compliance frequencies: ${error.message}`);
        }
    }

    async updateFrequency(id, data) {
        try {
            return await prisma.complianceFrequencyMaster.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error(`Failed to update compliance frequency: ${error.message}`);
        }
    }

    // ========== Authority ==========
    async createAuthority(data) {
        try {
            return await prisma.authorityMaster.create({
                data,
                include: {
                    regulatoryBodies: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to create authority: ${error.message}`);
        }
    }

    async getAllAuthorities() {
        try {
            return await prisma.authorityMaster.findMany({
                include: {
                    regulatoryBodies: true,
                },
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch authorities: ${error.message}`);
        }
    }

    async updateAuthority(id, data) {
        try {
            return await prisma.authorityMaster.update({
                where: { id },
                data,
                include: {
                    regulatoryBodies: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update authority: ${error.message}`);
        }
    }

    // ========== Regulatory Body ==========
    async createRegulatoryBody(data) {
        try {
            return await prisma.regulatoryBodyMaster.create({
                data,
            });
        } catch (error) {
            throw new Error(`Failed to create regulatory body: ${error.message}`);
        }
    }

    async getAllRegulatoryBodies() {
        try {
            return await prisma.regulatoryBodyMaster.findMany({
                include: {
                    authority: true,
                },
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            throw new Error(`Failed to fetch regulatory bodies: ${error.message}`);
        }
    }

    async updateRegulatoryBody(id, data) {
        try {
            return await prisma.regulatoryBodyMaster.update({
                where: { id },
                data,
                include: {
                    authority: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update regulatory body: ${error.message}`);
        }
    }

    // ========== Holiday Calendar ==========
    async createHolidayCalendar(data) {
        try {
            return await prisma.holidayCalendar.create({
                data: {
                    name: data.name,
                    year: data.year,
                    holidays: {
                        create: data.holidays || [],
                    },
                },
                include: {
                    holidays: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to create holiday calendar: ${error.message}`);
        }
    }

    async getHolidayCalendars(year) {
        try {
            return await prisma.holidayCalendar.findMany({
                where: { year },
                include: {
                    holidays: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to fetch holiday calendars: ${error.message}`);
        }
    }

    async addHoliday(calendarId, data) {
        try {
            return await prisma.holiday.create({
                data: {
                    name: data.name,
                    date: new Date(data.date),
                    calendarId,
                },
            });
        } catch (error) {
            throw new Error(`Failed to add holiday: ${error.message}`);
        }
    }

    async removeHoliday(holidayId) {
        try {
            return await prisma.holiday.delete({
                where: { id: holidayId },
            });
        } catch (error) {
            throw new Error(`Failed to remove holiday: ${error.message}`);
        }
    }
}

module.exports = new MasterDataService();
