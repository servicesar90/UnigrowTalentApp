import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { creditReportApi, getCreditsApi, getFreeCreditsApi, getBillApi, getPlansApi, getinvoiceApi, gstVerifyApi, updateCompanyApi, createProfileApi, searchCandidateApi } from "./api";
import Toast from "react-native-toast-message";

export const apiFunction = async (api, params, data, type, header) => {

  try {
    let response;
    if (header) {
      const token = await AsyncStorage.getItem("Token");
      
      const headers = { Authorization: `Bearer ${token}` }

      if (headers) {
        switch (type) {
          case "get": {

            response = await axios.get(params ? `${api}/${params.join("/")}` : api, { headers });
            break;
          }
          case "post": {

            response = await axios.post(params ? `${api}/${params.join("/")}` : api, data, { headers });
            break;
          }

          case "patch": {

            response = await axios.patch(params ? `${api}/${params.join("/")}` : api, data, { headers });
            break;
          }

          case "delete": {

            response = await axios.delete(params ? `${api}/${params.join("/")}` : api, { headers });
            break;
          }
        }
      }

    } else {
      switch (type) {
        case "get": {
          response = await axios.get(params ? `${api}/${params}` : api);
          break;
        }
        case "post": {
          response = await axios.post(params ? `${api}/${params}` : api, data);
          break
        }
      }
    }

    if (response) {
      return response.data ? response.data : response;
    }
  } catch (err) {
    if (err.status === 403) {
      Toast.show({
        type: "error",
        text1: "Credits",
        text2: "You Don't have Enough Credits"
      })

      return "plan"
    }
    return err
    
  }

}

export const getFreeCredit = async (data) => {
  try {
    const token = await AsyncStorage.getItem("TokenId"); const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(getFreeCreditsApi, data, { headers });
    return response;
  } catch (err) {
 
  }
}

export const getCredits = async () => {
  try {
    const token = await AsyncStorage.getItem("TokenId");
   

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(getCreditsApi, { headers });

    return response;
  } catch (err) {
    
  }
};


export const getBill = async () => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(getBillApi, { headers });

    return response;
  } catch (err) {
    console.log("Error from give get bill api", err);
  }
};

export const getPlans = async () => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(getPlansApi, { headers });

    return response;
  } catch (err) {
    console.log("Error from get plans api", err);
  }
};

export const getInvoiceFunc = async (id) => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${getinvoiceApi}/${id}`, { headers });
    if (response) {

      return response;
    }


  } catch (err) {
    console.log("Error from get unlock databases api", err);
  }

}

export const gstVerify = async (value) => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(`${gstVerifyApi}/${value}`, { headers });

    return response;
  } catch (err) {
    console.log("Error from gst verify api", err);
  }
}

export const postGstVerify = async (value, data) => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(`${gstVerifyApi}/${value}`, { data }, { headers });

    return response;
  } catch (err) {
    console.log("Error from gst verify api", err);
  }
}


export const updateProfile = async (data) => {
  try {
    const token = await AsyncStorage.getItem("Token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.patch(createProfileApi, data, { headers });

    return response;
  } catch (e) {
    console.log("errorResponse", e);
  }
};


export const updateCompany = async (data) => {
  try {
    const token = await AsyncStorage.getItem("Token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(updateCompanyApi, data, {
      headers,
    });

    return response;
  } catch (e) {
    console.log("error from update company", e);
  }
};

export const searchCandidateFunc = async (data) => {
  try {
    const token = localStorage.getItem("TokenId");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(searchCandidateApi, data, { headers });
    if (response) {
      return response;
    }
  } catch (err) {
    console.log("Error from get unlock databases api", err);
  }
}

