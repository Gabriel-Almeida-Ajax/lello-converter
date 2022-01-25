import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useApi } from "./api";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
    const { postApi } = useApi();

    const [form, setForm] = useState({
        type: 'S-2220',
    });

    const options = [
        {
            type: 'S-2220',
            callback(){
                alert('S-2220')
            }
        },
        {
            type: 'S-2240',
            callback(){
                alert('S-2240')
            }
        }
    ]

    const handleInterface = useCallback((e) => {
        setForm({
            ...form,
            type: e.target.value,
        });
    }, [form]);

    useEffect(() => {
        console.log(form);
    }, [form])

    const provider = {
        handleInterface,
        options,
        form
    }

    return (
        <FormContext.Provider value={provider}>
            {children}
        </FormContext.Provider>
    )
}

export const useForm = () => {
    const context = useContext(FormContext);

    if (!context) {
        throw new Error('useForm must be used within an FormProvider');
    }

    return context;
}