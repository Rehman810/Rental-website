import apiClient from './config/ServiceApi/apiClient.js';

const check = async () => {
  try {
    const res = await apiClient.get('/listing/6906f61931fc1e995875c738');
    console.log('Host Data Structure:', JSON.stringify(res.data.hostData, null, 2));
  } catch (e) {
    console.error(e);
  }
};
check();
