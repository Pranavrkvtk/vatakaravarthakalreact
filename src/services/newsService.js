import axios from "axios";

const API_URL = "http://localhost:8080/api/news";

export const getAllNews = () => axios.get(API_URL);

export const getNewsById = (id) =>
  axios.get(`${API_URL}/${id}`);

export const getNewsByCategory = (category) =>
  axios.get(`${API_URL}/category/${category}`);

export const searchNews = (keyword) =>
  axios.get(`${API_URL}/search?keyword=${keyword}`);

export const getLatestNews = () =>
  axios.get(`${API_URL}/latest`);

export const getBreakingNews = () =>
  axios.get(`${API_URL}/breaking`);

export const getTrendingNews = () =>
  axios.get(`${API_URL}/trending`);