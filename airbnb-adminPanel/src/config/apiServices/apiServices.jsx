import axios from 'axios';
import API_CONFIG from '../api/api';
import { showErrorToast } from '../../components/toast/toast';

const { apiKey } = API_CONFIG;
const token = localStorage.getItem("token")
const getAuthConfig = (data) => {
  const token = localStorage.getItem("token"); // ✅ always fresh

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
  };
};

export const postData = async (endpoint, data) => {
    try {
        const response = await axios.post(`${apiKey}/${endpoint}`, data);
        return response.data;
    } catch (error) {
        showErrorToast(error.message);
        throw new Error('Error posting data: ' + error.message);
    }
};

export const postDataById = async (endpoint, data, id) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };


  try {
    const response = await axios.post(`${apiKey}/${endpoint}/${id}`, data, config);
    return response.data;
  } catch (error) {
    throw new Error('Error posting data: ' + error);
  }
};

export const updateData = async (endpoint, data) => {
    try {
        const response = await axios.put(`${apiKey}/${endpoint}`, data);
        return response.data;
    } catch (error) {
        showErrorToast(error.message);
        throw new Error('Error updating data: ' + error.message);
    }
};

export const updateDataById = async (endpoint, id, data) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
  };

  try {
    const response = await axios.put(`${apiKey}/${endpoint}/${id}`, data, config);     
    return response.data;
  } catch (error) {
    throw new Error('Error updating data: ' + error.message);
  }
};

export const fetchData = async (endpoint) => {

    // const config = {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // };

      const config = getAuthConfig();
  
    try {
      const response = await axios.get(`${apiKey}/${endpoint}`, config);
      const initialData = response.data;   
      return initialData;
    } catch (error) {
      throw new Error('Error fetching data: ' + error.message);
    }
  };

  export const fetchDataById = async (endpoint, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  
    try {
      const response = await axios.get(`${apiKey}/${endpoint}/${id}`, config);   
      // console.log(response);
      
      return response.data;
    } catch (error) {
      throw new Error('Error fetching data: ' + error.message);
    }
  };

export const deleteDataById = async (endpoint, id) => {
    try {
        const response = await axios.delete(`${apiKey}/${endpoint}/${id}`);
        return response.data.data;
    } catch (error) {
        showErrorToast(error.message);
        throw new Error('Error deleting data: ' + error.message);
    }
};