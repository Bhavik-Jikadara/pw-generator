// Service to handle password storage and retrieval
const STORAGE_KEY = 'pw_gen_history';

export const passwordService = {
  // Save a password to history
  saveToHistory: async (password, userId) => {
    try {
      const history = await passwordService.getHistory(userId);
      const newEntry = {
        id: Date.now(),
        password,
        createdAt: new Date().toISOString(),
        userId
      };
      
      history.unshift(newEntry); // Add to beginning of array
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return newEntry;
    } catch (error) {
      console.error('Error saving password to history:', error);
      throw error;
    }
  },

  // Get password history for a user
  getHistory: async (userId) => {
    try {
      const historyStr = localStorage.getItem(STORAGE_KEY);
      const history = historyStr ? JSON.parse(historyStr) : [];
      return history.filter(entry => entry.userId === userId);
    } catch (error) {
      console.error('Error getting password history:', error);
      return [];
    }
  },

  // Clear history for a user
  clearHistory: async (userId) => {
    try {
      const history = await passwordService.getHistory(userId);
      const filteredHistory = history.filter(entry => entry.userId !== userId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error clearing password history:', error);
      throw error;
    }
  }
};
