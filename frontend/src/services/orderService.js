import api from "./api.js";

const orderService = {
  async getOrders(params = {}) {
    const { data } = await api.get("/api/orders", { params });
    return data;
  },

  async getOrder(id) {
    const { data } = await api.get(`/api/orders/${id}`);
    return data;
  },

  async createOrder(orderData) {
    const { data } = await api.post("/api/orders", orderData);
    return data;
  },

  async updateOrderStatus(id, status) {
    const { data } = await api.patch(`/api/orders/${id}/status`, { status });
    return data;
  },

  async updateOrderItems(id, items) {
    const { data } = await api.patch(`/api/orders/${id}/items`, { items });
    return data;
  },

  async deleteOrder(id) {
    const { data } = await api.delete(`/api/orders/${id}`);
    return data;
  },

  async getOrderStats() {
    const { data } = await api.get("/api/orders/stats");
    return data;
  },

  async toggleItemDelivered(orderId, itemIndex, delivered) {
    const { data } = await api.patch(`/api/orders/${orderId}/item-delivered`, {
      itemIndex,
      delivered,
    });
    return data;
  },

  async getKitchenOrders() {
    const { data } = await api.get("/api/orders/kitchen/all");
    return data;
  },

  async updateKitchenStatus(orderId, itemIndex, kitchenStatus) {
    const { data } = await api.patch(`/api/orders/${orderId}/kitchen-status`, {
      itemIndex,
      kitchenStatus,
    });
    return data;
  },
};

export default orderService;
