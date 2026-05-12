import api from "./api.js";

const layoutService = {
  async getLayouts(params = {}) {
    const { data } = await api.get("/api/layouts", { params });
    return data;
  },

  async getLayout(id) {
    const { data } = await api.get(`/api/layouts/${id}`);
    return data;
  },

  async createLayout(layoutData) {
    const { data } = await api.post("/api/layouts", layoutData);
    return data;
  },

  async updateLayout(id, layoutData) {
    const { data } = await api.put(`/api/layouts/${id}`, layoutData);
    return data;
  },

  async toggleLayoutActive(id) {
    const { data } = await api.patch(`/api/layouts/${id}/toggle`);
    return data;
  },

  async deleteLayout(id) {
    const { data } = await api.delete(`/api/layouts/${id}`);
    return data;
  },
};

export default layoutService;
