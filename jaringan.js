// network.js - Social Network System

class SocialNetwork {
  constructor() {
    this.users = new Map();
    this.connections = new Map(); // userId -> Set of connected userIds
    this.pendingRequests = new Map(); // userId -> Set of pending request userIds
  }

  // ============ USER MANAGEMENT ============
  addUser(userId, userData) {
    if (this.users.has(userId)) return false;
    this.users.set(userId, userData);
    this.connections.set(userId, new Set());
    this.pendingRequests.set(userId, new Set());
    return true;
  }

  getUser(userId) {
    return this.users.get(userId) || null;
  }

  // ============ CONNECTION REQUESTS ============
  sendRequest(fromId, toId) {
    if (fromId === toId) return { success: false, message: "Cannot request yourself" };
    if (!this.users.has(fromId) || !this.users.has(toId)) {
      return { success: false, message: "User not found" };
    }
    if (this.connections.get(fromId).has(toId)) {
      return { success: false, message: "Already connected" };
    }
    if (this.pendingRequests.get(toId).has(fromId)) {
      return { success: false, message: "Request already sent" };
    }

    this.pendingRequests.get(toId).add(fromId);
    return { success: true, message: "Request sent" };
  }

  acceptRequest(userId, requesterId) {
    if (!this.pendingRequests.get(userId).has(requesterId)) {
      return { success: false, message: "No pending request" };
    }

    // Add bidirectional connection
    this.connections.get(userId).add(requesterId);
    this.connections.get(requesterId).add(userId);
    this.pendingRequests.get(userId).delete(requesterId);

    return { success: true, message: "Request accepted" };
  }

  rejectRequest(userId, requesterId) {
    if (!this.pendingRequests.get(userId).has(requesterId)) {
      return { success: false, message: "No pending request" };
    }
    this.pendingRequests.get(userId).delete(requesterId);
    return { success: true, message: "Request rejected" };
  }

  // ============ CONNECTION MANAGEMENT ============
  getConnections(userId) {
    return this.connections.has(userId) ? [...this.connections.get(userId)] : [];
  }

  getPendingRequests(userId) {
    return this.pendingRequests.has(userId) ? [...this.pendingRequests.get(userId)] : [];
  }

  removeConnection(userId, targetId) {
    if (!this.connections.get(userId)?.has(targetId)) {
      return { success: false, message: "Not connected" };
    }
    this.connections.get(userId).delete(targetId);
    this.connections.get(targetId).delete(userId);
    return { success: true, message: "Connection removed" };
  }

  // ============ SUGGESTIONS (Friends of Friends) ============
  getSuggestions(userId, limit = 5) {
    const connections = this.connections.get(userId) || new Set();
    const suggestions = new Map();

    for (const friendId of connections) {
      const friendConnections = this.connections.get(friendId) || new Set();
      for (const candidateId of friendConnections) {
        if (candidateId === userId) continue;
        if (connections.has(candidateId)) continue;
        suggestions.set(candidateId, (suggestions.get(candidateId) || 0) + 1);
      }
    }

    return [...suggestions.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, score]) => ({ userId: id, mutualConnections: score }));
  }

  // ============ STATISTICS ============
  getStats() {
    const totalUsers = this.users.size;
    let totalConnections = 0;
    for (const [, conns] of this.connections) {
      totalConnections += conns.size;
    }
    return {
      totalUsers,
      totalConnections: totalConnections / 2, // bidirectional counted twice
      averageConnections: totalUsers > 0 ? (totalConnections / 2) / totalUsers : 0,
    };
  }
}

// ============ EXPORT ============
export default SocialNetwork;