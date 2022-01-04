import { createContext, useContext, useState, useCallback } from 'react';
import { useApi } from "../hooks/api";

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const { postApi } = useApi();

    const [key, setKey] = useState();


    const loader = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => {
                console.log('> Error: ', reader.error);
                return alert('Não foi possível ler o arquivo.')
            };

            reader.onload = (e) => {
                const data = e.target.result;

                postApi('/api/convert', { xml: `${data}` })
                    .then(_response => {
                        resolve({ text: _response, name: file.name.split('.')[0] });
                    })
                    .catch(error => {
                        alert('Não foi possível ler o arquivo.')
                        reject(error);
                    });

                setKey(Math.random());
            };

            reader.readAsText(file);
        });
    }, [postApi]);

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

        // Clean up and remove the link
        link.parentNode.removeChild(link);
    }, [])

    const fileLoader = useCallback(
        ({ target }) => {
            if (target.files.length) {
                return [...target.files].map(async file => download(await loader(file)));
            }

            alert('Nenhum arquivo selecionado.');
        },
        [download, loader],
    )

    const provider = {
        key,
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