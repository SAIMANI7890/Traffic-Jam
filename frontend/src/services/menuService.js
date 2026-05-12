import api from "./api.js";

const menuService = {
  // Menu Items
  async getMenuItems(params = {}) {
    const { data } = await api.get("/api/menu/items", { params });
    return data;
  },

  async getMenuItem(id) {
    const { data } = await api.get(`/api/menu/items/${id}`);
    return data;
  },

  async createMenuItem(itemData) {
    const { data } = await api.post("/api/menu/items", itemData);
    return data;
  },

  async updateMenuItem(id, itemData) {
    const { data } = await api.put(`/api/menu/items/${id}`, itemData);
    return data;
  },

  async deleteMenuItem(id) {
    const { data } = await api.delete(`/api/menu/items/${id}`);
    return data;
  },

  // Categories
  async getCategories() {
    const { data } = await api.get("/api/menu/categories");
    return data;
  },

  async createCategory(categoryData) {
    const { data } = await api.post("/api/menu/categories", categoryData);
    return data;
  },

  async deleteCategory(id) {
    const { data } = await api.delete(`/api/menu/categories/${id}`);
    return data;
  },
};

export default menuService;
