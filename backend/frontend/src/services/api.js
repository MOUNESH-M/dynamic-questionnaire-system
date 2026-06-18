import axios from "axios";

export const BASE_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* Attach the JWT to every outgoing request, if one exists. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* On a 401, clear the stored session so ProtectedRoute sends the
   user back to /login on the next render. We don't hard-redirect
   here so callers can still show a friendly inline error first. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("qs_token");
      localStorage.removeItem("qs_user");
    }
    return Promise.reject(error);
  }
);

/* ---------------------------------------------------------------
   Auth
   ------------------------------------------------------------- */
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
};

/* ---------------------------------------------------------------
   Questionnaires (admin)
   ------------------------------------------------------------- */
export const questionnaireApi = {
  list: () => api.get("/questionnaires"),
  listPublished: () => api.get("/questionnaires/published"),
  get: (id) => api.get(`/questionnaires/${id}`),
  create: (payload) => api.post("/questionnaires", payload),
  remove: (id) => api.delete(`/questionnaires/${id}`),
  publish: (id) => api.post(`/questionnaires/${id}/publish`),
};

/* ---------------------------------------------------------------
   Questions
   ------------------------------------------------------------- */
export const questionApi = {
  create: (payload) =>
    api.post("/questions", payload),

  update: (questionId, payload) =>
    api.put(`/questions/${questionId}`, payload),

  remove: (questionId) =>
    api.delete(`/questions/${questionId}`),

  getByQuestionnaire: (
    questionnaireId
  ) =>
    api.get(
      `/questions/questionnaire/${questionnaireId}`
    ),
};

/* ---------------------------------------------------------------
   Options
   ------------------------------------------------------------- */
export const optionApi = {
  create: (payload) =>
    api.post("/options", payload),

  remove: (optionId) =>
    api.delete(`/options/${optionId}`),

  getByQuestion: (
    questionId
  ) =>
    api.get(
      `/options/question/${questionId}`
    ),
};

/* ---------------------------------------------------------------
   Rules
   ------------------------------------------------------------- */
export const ruleApi = {
  create: (payload) => api.post("/rules", payload),
  remove: (ruleId) => api.delete(`/rules/${ruleId}`),
  getAll: ()=>api.get("/rules")
};

/* ---------------------------------------------------------------
   Responses (user takes a questionnaire)
   ------------------------------------------------------------- */
export const responseApi = {
  submit: (questionnaireId, answers) =>
    api.post(`/questionnaires/${questionnaireId}/responses`, { answers }),
};

export default api;
