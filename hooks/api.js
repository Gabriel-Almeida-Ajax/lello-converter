import axios from 'axios';
import { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const [state, setState] = useState({});

    const getApi = async (url, params) => {
        const response = await axios.get(url, { params });
        return response.data;
    };

    const postApi = async (url, data) => {
        const response = await axios.post(url, data);
        return response.data;
    };

    const putApi = async (url, data) => {
        const response = await axios.put(url, data);
        return response.data;
    };

    const deleteApi = async (url, data) => {
        const response = await axios.delete(url, data);
        return response.data;
    };

    const provider = {
        getApi,
        postApi,
        putApi,
        deleteApi,
        state,
    }

    return (
        <ApiContext.Provider value={provider}>
            {children}
        </ApiContext.Provider>
    )
}

export const useApi = () => {
    const context = useContext(ApiContext);

    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }

    return context;
}