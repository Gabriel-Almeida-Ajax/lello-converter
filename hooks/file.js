import { createContext, useContext, useState, useCallback } from 'react';
import { useApi } from "../hooks/api";
import { useForm } from './form';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const { postApi } = useApi();

    const [key, setKey] = useState();
    const [files, setFiles] = useState([]);
    const [filesR, setFilesR] = useState([]);

    const { form } = useForm();

    const loader = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => {
                console.log('> Error: ', reader.error);
                return alert('Não foi possível ler o arquivo.')
            };

            reader.onload = (e) => {
                const data = e.target.result;

                postApi('/api/convert', { xml: `${data}`, ...form })
                    .then(_response => {
                        console.log(_response);

                        if (!!_response.tables.length) _response.tables.forEach(table => download({ ...table, name: file.name.split('.')[0] + '_' + table.name }))

                        resolve({ text: _response.conteudo.text, name: file.name.split('.')[0] });
                    })
                    .catch(error => {
                        alert('Não foi possível ler o arquivo.')
                        reject(error);
                    });


                setKey(Math.random());
            };

            reader.readAsText(file);
        });
    }, [form, postApi]);

    const download = useCallback(async (res) => {
        const resBlob = await res.text;

        let url = // 'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
            window.URL.createObjectURL(
                new Blob([resBlob], { type: 'text/plain' })
            )

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `${res.name}.csv`,
        );


        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();
        setFilesR(old => ([...old, { name: res.name + ".csv" }]));

        // Clean up and remove the link
        link.parentNode.removeChild(link);
    }, [setFilesR])

    const fileLoader = useCallback(
        ({ target }) => {
            if (target.files.length) {
                setFiles(old => ([...old, ...target.files]))

                if (form.type === 'S-2220' || form.type === 'S-2240') {
                    return [...target.files].map(async file => await loader(file))
                }

                return [...target.files].map(async file => download(await loader(file)));
            }

            alert('Nenhum arquivo selecionado.');
        },
        [download, loader],
    )

    const provider = {
        key,
        files,
        filesR,
        download,
        fileLoader,
    }

    return (
        <FileContext.Provider value={provider}>
            {children}
        </FileContext.Provider>
    )
}

export const useFile = () => {
    const context = useContext(FileContext);

    if (!context) {
        throw new Error('useFile must be used within an FileProvider');
    }

    return context;
}