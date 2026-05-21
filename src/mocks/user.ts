export const MOCK_PROFILE = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "admin",
};

export const useAuth = () => {
  return {
    user: MOCK_PROFILE,
    logout: async () => console.log("mock logout"),
  };
};
