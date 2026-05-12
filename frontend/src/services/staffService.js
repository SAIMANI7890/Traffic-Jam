import api from "./api.js";

const staffService = {
  async getStaffUsers() {
    const { data } = await api.get("/api/staff");
    return data;
  },

  async getStaffUser(id) {
    const { data } = await api.get(`/api/staff/${id}`);
    return data;
  },

  async createStaffUser(staffData) {
    const { data } = await api.post("/api/staff", staffData);
    return data;
  },

  async updateStaffUser(id, staffData) {
    const { data } = await api.put(`/api/staff/${id}`, staffData);
    return data;
  },

  async deleteStaffUser(id) {
    const { data } = await api.delete(`/api/staff/${id}`);
    return data;
  },
};

export default staffService;
